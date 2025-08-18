// src/app/dashboard/admin/reports/students/page.tsx
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function StudentsReportPage() {
  const supabase = await createClient();

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/student');

  // Fetch all students and their active enrollments
  const { data: students, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      enrollments (
        id,
        batches (
          name,
          courses ( title )
        )
      )
    `)
    .eq('role', 'student')
    .order('full_name');

  if (error) {
    console.error("Error fetching students report:", error);
  }

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Enrollment Report</h1>
        <p className="text-muted-foreground">A list of all students and their active courses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Enrolled Courses</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students && students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      {student.enrollments.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {student.enrollments.map((enrollment: any) => (
                            <li key={enrollment.id}>
                              {enrollment.batches.courses.title} ({enrollment.batches.name})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground">No active enrollments</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    No students found.
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
