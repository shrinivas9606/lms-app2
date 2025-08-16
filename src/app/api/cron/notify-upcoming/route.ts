// src/app/api/cron/notify-upcoming/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize the Supabase admin client with the service role key
// This is necessary to bypass RLS and query all users/enrollments.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// We need to revalidate the path to ensure data is fresh, but this is an API route.
// Vercel's Edge runtime is recommended for cron jobs.
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  // 1. Authenticate the request
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Define the time window for upcoming lectures (e.g., 30-35 minutes from now)
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const thirtyFiveMinutesFromNow = new Date(now.getTime() + 35 * 60 * 1000);

    // 3. Find lectures scheduled within this window
    const { data: lectures, error: lecturesError } = await supabaseAdmin
      .from('lectures')
      .select('id, batch_id, title')
      .gte('scheduled_at', thirtyMinutesFromNow.toISOString())
      .lt('scheduled_at', thirtyFiveMinutesFromNow.toISOString());

    if (lecturesError) throw lecturesError;

    if (!lectures || lectures.length === 0) {
      return NextResponse.json({ message: 'No upcoming lectures to notify.' });
    }

    const lectureIds = lectures.map(l => l.id);
    const batchIds = lectures.map(l => l.batch_id);

    // 4. Find all students enrolled in these batches
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('user_id, batch_id')
      .in('batch_id', batchIds)
      .eq('status', 'ACTIVE');

    if (enrollmentsError) throw enrollmentsError;
    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ message: 'Lectures found, but no students enrolled.' });
    }

    // 5. Prepare the notification records to be inserted
    const notificationsToInsert = enrollments.map(enrollment => {
      const relevantLecture = lectures.find(l => l.batch_id === enrollment.batch_id);
      return {
        user_id: enrollment.user_id,
        title: 'Class Starting Soon!',
        body: `Your class "${relevantLecture?.title}" is scheduled to start in about 30 minutes.`,
        link: `/dashboard/student`, // Link to the student dashboard
      };
    });

    // 6. Bulk insert the notifications
    const { error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert(notificationsToInsert);

    if (insertError) throw insertError;

    return NextResponse.json({ message: `Successfully sent ${notificationsToInsert.length} notifications.` });

  } catch (error: any) {
    console.error('Cron job error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
