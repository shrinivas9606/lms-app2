// src/app/dashboard/admin/reports/revenue/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function RevenueReportPage() {
  const supabase = await createClient();

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/student');

  // Query the new, simple 'admin_revenue_report_view'
  const { data: payments, error } = await supabase
    .from('admin_revenue_report_view')
    .select('*')
    .order('paid_at', { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
  }

  const totalRevenue = payments ? payments.reduce((acc, p) => acc + p.amount_inr, 0) : 0;

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue Report</h1>
        <p className="text-muted-foreground">A detailed breakdown of all successful payments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>
            List of all transactions processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course Details</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount (INR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <div>{payment.course_title || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">{payment.batch_name || 'N/A'}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{payment.payment_ref}</TableCell>
                    <TableCell>
                      {new Date(payment.paid_at!).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{payment.amount_inr.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No payments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-bold text-right">Total Revenue</TableCell>
                <TableCell className="font-bold text-right">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
