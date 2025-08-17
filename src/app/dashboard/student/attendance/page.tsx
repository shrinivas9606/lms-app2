// src/app/dashboard/student/attendance/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function AttendanceHistoryPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Fetch all attendance records for the user, joining related tables
  const { data: attendanceRecords, error } = await supabase
    .from('attendance')
    .select(`
      id,
      status,
      lectures (
        title,
        scheduled_at,
        batches (
          name,
          courses (
            title
          )
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('lectures(scheduled_at)', { ascending: false }); // Show most recent first

  if (error) {
    console.error("Error fetching attendance:", error);
    // You can add a more user-friendly error message here
  }

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance History</h1>
        <p className="text-muted-foreground">A complete record of your session attendance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Attendance</CardTitle>
          <CardDescription>
            Here is a list of all the lectures and your attendance status for each.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Lecture</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords && attendanceRecords.length > 0 ? (
                attendanceRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="font-medium">
                        {record.lectures?.[0]?.batches?.[0]?.courses?.[0]?.title || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.lectures?.[0]?.batches?.[0]?.name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{record.lectures?.[0]?.title || 'N/A'}</TableCell>
                    <TableCell>
                      {record.lectures?.[0]?.scheduled_at 
                        ? new Date(record.lectures[0].scheduled_at).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={
                          record.status === 'PRESENT' ? 'default' 
                          : record.status === 'EXCUSED' ? 'secondary'
                          : 'destructive'
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No attendance records found.
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
