// src/app/dashboard/student/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, BookOpen, CheckCircle, ArrowRight, Video } from 'lucide-react';
import LivePlayer from '@/components/LivePlayer';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import EnrollmentRefresher from '@/components/EnrollmentRefresher';

// THE FIX: This line forces the page to be rendered dynamically on every request.
export const dynamic = 'force-dynamic';

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('user_enrollment_details')
    .select('batch_id, batch_name, course_title')
    .eq('user_id', session.user.id);

  if (enrollmentsError) {
    console.error("Error fetching enrollments:", enrollmentsError);
  }

  const enrolledCount = enrollments?.length || 0;

  if (enrolledCount === 0) {
    return (
      <main className="container mx-auto p-4 md:p-8 text-center">
        {searchParams?.status === 'processing' && <EnrollmentRefresher />}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Welcome, {profile?.full_name || 'Student'}!</h1>
            <p className="text-muted-foreground max-w-md">You haven't enrolled in any courses yet. Explore our catalog and start your learning journey today.</p>
            <Button asChild className="mt-6 bg-violet-600 hover:bg-violet-700 text-white">
              <Link href="/courses">Browse Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </div>
      </main>
    );
  }

  const batchIds = (enrollments ?? []).map((e) => e.batch_id);

  const twoHoursAgo = new Date(new Date().getTime() - 2 * 60 * 60 * 1000);

  const { data: upcomingLectures } = await supabase
    .from('lectures')
    .select('id, title, scheduled_at, stream_url, batches(platform)')
    .in('batch_id', batchIds)
    .gte('scheduled_at', twoHoursAgo.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1);

  const { count: attendanceCount } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('status', 'PRESENT');

  const nextLecture = upcomingLectures?.[0];

  let sessionState = 'UPCOMING';
  if (nextLecture) {
    const now = new Date();
    const scheduledTime = new Date(nextLecture.scheduled_at);
    const fiveMinutesBefore = new Date(scheduledTime.getTime() - 5 * 60 * 1000);

    if (now >= scheduledTime) {
      sessionState = 'LIVE';
    } else if (now >= fiveMinutesBefore) {
      sessionState = 'STARTING_SOON';
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {searchParams?.status === 'processing' && <EnrollmentRefresher />}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, {profile?.full_name || 'Student'}!</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Enrolled Courses" value={enrolledCount} icon={BookOpen} />
          <Link href="/dashboard/student/attendance">
            <StatCard title="Sessions Attended" value={attendanceCount || 0} icon={CheckCircle} />
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Clock className="h-5 w-5 text-violet-600" />
                  Next Live Session
                </CardTitle>
                <CardDescription>Your next class will appear here. The video player will be available when the session starts.</CardDescription>
              </CardHeader>
              <CardContent>
                {nextLecture ? (
                  <div className="space-y-4">
                    <div>
                      <Badge variant="outline" className="border-violet-300 text-violet-700">{new Date(nextLecture.scheduled_at).toLocaleDateString('en-IN', { weekday: 'long' })}</Badge>
                      <h3 className="text-2xl font-semibold mt-2 text-gray-900">{nextLecture.title}</h3>
                      <p className="text-gray-500">
                        {new Date(nextLecture.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
                      </p>
                    </div>
                    
                    {sessionState === 'LIVE' && nextLecture.batches?.platform && nextLecture.stream_url ? (
                      <LivePlayer platform={nextLecture.batches.platform} streamUrl={nextLecture.stream_url} />
                    ) : sessionState === 'STARTING_SOON' ? (
                      <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg bg-green-50 border-green-200">
                          <p className="font-semibold text-green-700">Session is starting soon!</p>
                          <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                            <Video className="mr-2 h-4 w-4" /> Join Now
                          </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-gray-50">
                          <p className="text-gray-500">Session has not started yet.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-gray-50">
                      <p className="text-gray-500">No upcoming sessions. Enjoy your break!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-gray-800">My Courses</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                {(enrollments ?? []).map((enrollment) => (
                  <Link href={`/dashboard/student/batches/${enrollment.batch_id}`} key={enrollment.batch_id}>
                    <div className="flex items-center justify-between text-sm p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-semibold text-gray-800">{enrollment.course_title}</p>
                        <p className="text-xs text-gray-500">{enrollment.batch_name}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </CardContent>
              <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                      <Link href="/courses">Browse More Courses</Link>
                  </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
