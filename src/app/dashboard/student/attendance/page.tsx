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

  // THE FIX: Query the new, simple 'student_attendance_details' view
  const { data: attendanceRecords, error } = await supabase
    .from('student_attendance_details')
    .select('*')
    .eq('user_id', session.user.id)
    .order('scheduled_at', { ascending: false }); // Show most recent first

  if (error) {
    console.error("Error fetching attendance:", error);
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
                      {/* THE FIX: Use the new, direct field names */}
                      <div className="font-medium">{record.course_title}</div>
                      <div className="text-sm text-muted-foreground">{record.batch_name}</div>
                    </TableCell>
                    <TableCell>{record.lecture_title}</TableCell>
                    <TableCell>
                      {record.scheduled_at 
                        ? new Date(record.scheduled_at).toLocaleDateString('en-IN', {
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
