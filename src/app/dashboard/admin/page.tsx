// src/app/dashboard/admin/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, BookCopy, BarChart, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/student');

  // Fetch stats and recent enrollments in parallel
  const [
    { count: studentCount },
    { count: courseCount },
    { data: payments },
    { data: recentEnrollments, error: enrollmentsError }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount_inr').eq('status', 'PAID'),
    // THE NEW QUERY: Fetch the 5 most recent enrollments and their related data
    supabase
      .from('enrollments')
      .select(`
        id,
        enrolled_at,
        profiles!enrollments_user_id_fkey ( full_name, avatar_url ),
        batches (
          name,
          courses ( title )
        )
      `)
      .eq('status', 'ACTIVE')
      .order('enrolled_at', { ascending: false })
      .limit(5)
  ]);

  if (enrollmentsError) {
    console.error("Error fetching recent enrollments:", enrollmentsError);
  }

  const totalRevenue = payments ? payments.reduce((acc, p) => acc + p.amount_inr, 0) : 0;

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your learning platform.</p>
      </div>

      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard/admin/courses/new"><PlusCircle className="mr-2 h-4 w-4" /> New Course</Link>
        </Button>
        <Button asChild variant="outline">
           <Link href="/dashboard/admin/courses">Manage Courses</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={BarChart} />
        <StatCard title="Total Students" value={studentCount || 0} icon={Users} />
        <StatCard title="Active Courses" value={courseCount || 0} icon={BookCopy} />
      </div>

      {/* THE UPDATED SECTION: Display the recent enrollments in a table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
          <CardDescription>The 5 most recent student enrollments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Enrolled On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEnrollments && recentEnrollments.length > 0 ? (
                recentEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={enrollment.profiles?.[0]?.avatar_url ?? undefined} alt="Avatar" />
                          <AvatarFallback>{enrollment.profiles?.[0]?.full_name?.charAt(0) ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{enrollment.profiles?.[0]?.full_name || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{enrollment.batches?.[0]?.courses?.[0]?.title || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{enrollment.batches?.[0]?.name || 'N/A'}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(enrollment.enrolled_at!).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No recent enrollments.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
