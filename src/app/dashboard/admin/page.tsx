// src/app/dashboard/admin/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, BookCopy, BarChart, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/student');

  // Fetch stats in parallel for performance
  const [
    { count: studentCount },
    { count: courseCount },
    { data: payments, error: paymentsError }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('courses').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount_inr').eq('status', 'PAID')
  ]);

  const totalRevenue = payments ? payments.reduce((acc, p) => acc + p.amount_inr, 0) : 0;

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your learning platform.</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard/admin/courses/new"><PlusCircle className="mr-2 h-4 w-4" /> New Course</Link>
        </Button>
        <Button asChild variant="outline">
           <Link href="/dashboard/admin/courses">Manage Courses</Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={BarChart} />
        <StatCard title="Total Students" value={studentCount || 0} icon={Users} />
        <StatCard title="Active Courses" value={courseCount || 0} icon={BookCopy} />
      </div>

      {/* Placeholder for more components */}
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A table of recent enrollments or payments will be displayed here.</p>
        </CardContent>
      </Card>
    </main>
  );
}
