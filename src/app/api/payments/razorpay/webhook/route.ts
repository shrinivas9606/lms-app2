// src/app/api/payments/razorpay/webhook/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  console.log("Webhook received a request.");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text();

  if (!signature) {
    console.error("Webhook Error: No signature found.");
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(body);
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    console.warn('Webhook Error: Invalid signature.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Webhook signature verified successfully.');
  const event = JSON.parse(body);

  if (event.event === 'payment.captured') {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;
    const { userId, batchId } = paymentEntity.notes;

    console.log(`Processing payment.captured for order: ${orderId}, userId: ${userId}, batchId: ${batchId}`);

    if (!userId || !batchId) {
      console.error("Webhook Error: Missing userId or batchId in payment notes.");
      return NextResponse.json({ error: 'Missing user or batch ID in notes' }, { status: 400 });
    }

    try {
      // Create a PENDING enrollment first, or find an existing one
      const { data: enrollment, error: upsertError } = await supabaseAdmin
        .from('enrollments')
        .upsert(
          { user_id: userId, batch_id: batchId, status: 'PENDING' },
          { onConflict: 'user_id, batch_id', ignoreDuplicates: false }
        )
        .select()
        .single();
        
      if (upsertError) throw upsertError;
      if (!enrollment) throw new Error("Upsert failed to return an enrollment record.");

      console.log(`Found/created enrollment record with ID: ${enrollment.id}`);

      // Update the enrollment status to ACTIVE
      const { error: updateEnrollmentError } = await supabaseAdmin
        .from('enrollments')
        .update({ status: 'ACTIVE', enrolled_at: new Date().toISOString() })
        .eq('id', enrollment.id);

      if (updateEnrollmentError) throw updateEnrollmentError;
      console.log("Enrollment status updated to ACTIVE.");

      // Create a payment record
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id: userId,
          enrollment_id: enrollment.id,
          provider: 'razorpay',
          order_id: orderId,
          payment_ref: paymentId,
          amount_inr: paymentEntity.amount / 100,
          status: 'PAID',
          paid_at: new Date().toISOString(),
        });

      if (paymentError) throw paymentError;
      console.log("Payment record created successfully.");

      // Insert a notification for the student
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Enrollment Successful!',
          body: `You have successfully enrolled in the course.`,
          link: `/dashboard/student`,
        });

      if (notificationError) throw notificationError;
      console.log("Notification sent to user.");

    } catch (error: any) {
      console.error('Webhook Error: Database update failed.', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ status: 'ok' });
}
