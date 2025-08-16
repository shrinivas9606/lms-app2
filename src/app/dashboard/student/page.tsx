// src/app/dashboard/student/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, Video, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import LivePlayer from '@/components/LivePlayer';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import EnrollmentRefresher from '@/components/EnrollmentRefresher'; // Import the new component

// The page now accepts searchParams as a prop
export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();

  const { data: enrollments, count: enrolledCount } = await supabase
    .from('enrollments')
    .select('batch_id, batches(name, courses(title))', { count: 'exact' })
    .eq('user_id', session.user.id)
    .eq('status', 'ACTIVE');

  if (!enrollments || enrollments.length === 0) {
    return (
      <main className="container mx-auto p-4 md:p-8 text-center">
        {/* Conditionally render the refresher component even if no courses are initially found */}
        {searchParams?.status === 'processing' && <EnrollmentRefresher />}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-2xl font-bold mb-4">Welcome, {profile?.full_name || 'Student'}!</h1>
            <p className="text-muted-foreground max-w-md">You haven't enrolled in any courses yet. Explore our catalog and start your learning journey today.</p>
            <Button asChild className="mt-6">
              <Link href="/courses">Browse Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </div>
      </main>
    );
  }

  const batchIds = enrollments.map((e) => e.batch_id);

  const { data: upcomingLectures } = await supabase
    .from('lectures')
    .select('id, title, scheduled_at, stream_url, batches(platform)')
    .in('batch_id', batchIds)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1);

  const { count: attendanceCount } = await supabase
    .from('attendance')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('status', 'PRESENT');

  const nextLecture = upcomingLectures?.[0];

  return (
    <div className="space-y-8 p-4 md:p-0">
       {/* Conditionally render the refresher component */}
      {searchParams?.status === 'processing' && <EnrollmentRefresher />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'Student'}!</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Enrolled Courses" value={enrolledCount || 0} icon={BookOpen} />
        <StatCard title="Sessions Attended" value={attendanceCount || 0} icon={CheckCircle} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-card to-card/60 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Next Live Session
              </CardTitle>
              <CardDescription>This is your next class. The join link will appear when it's time.</CardDescription>
            </CardHeader>
            <CardContent>
              {nextLecture ? (
                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary">{new Date(nextLecture.scheduled_at).toLocaleDateString('en-IN', { weekday: 'long' })}</Badge>
                    <h3 className="text-2xl font-semibold mt-2">{nextLecture.title}</h3>
                    <p className="text-muted-foreground">
                      {new Date(nextLecture.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
                    </p>
                  </div>
                  {new Date(nextLecture.scheduled_at) <= new Date() ? (
                    <LivePlayer platform={nextLecture.batches && nextLecture.batches[0]?.platform} streamUrl={nextLecture.stream_url!} />
                  ) : (
                    <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">Session has not started yet.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No upcoming sessions. Enjoy your break!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <ul className="space-y-3">
                {enrollments.map((enrollment: any) => (
                  <li key={enrollment.batch_id} className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                    <div>
                      <p className="font-semibold">{enrollment.batches.courses.title}</p>
                      <p className="text-xs text-muted-foreground">{enrollment.batches.name}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/student/courses">View All Courses</Link>
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
