// src/app/dashboard/student/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Clock, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import LivePlayer from '@/components/LivePlayer';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import EnrollmentRefresher from '@/components/EnrollmentRefresher';

export default async function StudentDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();

  // THE FIX: Query the new, simple 'user_enrollment_details' view
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
            <Button asChild className="mt-6">
              <Link href="/courses">Browse Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </div>
      </main>
    );
  }

  const batchIds = (enrollments ?? []).map((e) => e.batch_id);

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
      {searchParams?.status === 'processing' && <EnrollmentRefresher />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'Student'}!</p>
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
          {/* ... Next Live Session Card ... */}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <ul className="space-y-3">
                {(enrollments ?? []).map((enrollment) => (
                  <Link href={`/dashboard/student/batches/${enrollment.batch_id}`} key={enrollment.batch_id}>
                    <li className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                      <div>
                        {/* THE FIX: Use the new, direct field names from the view */}
                        <p className="font-semibold">{enrollment.course_title}</p>
                        <p className="text-xs text-muted-foreground">{enrollment.batch_name}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </li>
                  </Link>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/courses">Browse More Courses</Link>
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
