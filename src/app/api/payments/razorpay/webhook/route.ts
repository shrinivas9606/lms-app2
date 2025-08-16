// src/app/api/payments/razorpay/webhook/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Use the service_role key for server-side operations
// that need to bypass RLS policies.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Ensure this is in your .env.local
);

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  // 1. Get the signature and body from the request
  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text(); // Read the raw body

  if (!signature) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  // 2. Create the expected signature
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(body);
  const digest = shasum.digest('hex');

  // 3. Compare the signatures
  if (digest !== signature) {
    console.warn('Invalid webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 4. If signature is valid, process the event
  console.log('Webhook signature verified successfully.');
  const event = JSON.parse(body);

  // We are only interested in the 'payment.captured' event
  if (event.event === 'payment.captured') {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;
    const userId = paymentEntity.notes.userId; // Assuming you pass userId in notes
    const batchId = paymentEntity.notes.batchId; // Assuming you pass batchId in notes

    try {
      // Use a transaction to ensure all database operations succeed or fail together
      // NOTE: Supabase doesn't have traditional transactions in JS SDK,
      // so we perform operations sequentially and handle errors carefully.
      // For true transactions, you would use a database function (pl/pgsql).

      // Find the corresponding enrollment record (should be PENDING)
      const { data: enrollment, error: enrollmentError } = await supabaseAdmin
        .from('enrollments')
        .select('id, user_id')
        .eq('user_id', userId)
        .eq('batch_id', batchId)
        .eq('status', 'PENDING')
        .single();

      if (enrollmentError || !enrollment) {
        console.error('Webhook Error: No matching PENDING enrollment found for order:', orderId, enrollmentError);
        // Still return 200 to Razorpay, as the payment was valid.
        // Log this for manual intervention.
        return NextResponse.json({ status: 'No pending enrollment found, but webhook received' });
      }

      // Update the enrollment status to ACTIVE
      const { error: updateEnrollmentError } = await supabaseAdmin
        .from('enrollments')
        .update({ status: 'ACTIVE', enrolled_at: new Date().toISOString() })
        .eq('id', enrollment.id);

      if (updateEnrollmentError) throw updateEnrollmentError;

      // Create a payment record
      const { error: paymentError } = await supabaseAdmin
        .from('payments')
        .insert({
          user_id: enrollment.user_id,
          enrollment_id: enrollment.id,
          provider: 'razorpay',
          order_id: orderId,
          payment_ref: paymentId,
          amount_inr: paymentEntity.amount / 100, // Convert from paise to INR
          status: 'PAID',
          paid_at: new Date().toISOString(),
        });

      if (paymentError) throw paymentError;

      // Insert a notification for the student
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: enrollment.user_id,
          title: 'Enrollment Successful!',
          body: `You have successfully enrolled in the course.`,
          link: `/dashboard/student/courses`,
        });

      if (notificationError) throw notificationError;

      console.log(`Successfully processed payment and activated enrollment for order: ${orderId}`);

    } catch (error) {
      console.error('Error processing webhook and updating database:', error);
      // If any DB operation fails, we return a 500 error.
      // Razorpay will try to send the webhook again.
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  // 5. Acknowledge the event was received
  return NextResponse.json({ status: 'ok' });
}
