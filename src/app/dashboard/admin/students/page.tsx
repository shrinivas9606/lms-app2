// src/app/dashboard/admin/students/page.tsx
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
import { SearchStudents } from '@/components/SearchStudents';

// This page accepts searchParams to handle the search query
export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  // CORRECT: createClient() should not be awaited
  const supabase = await createClient();
  const query = searchParams?.q || '';

  // Protect the route for admins
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/student');

  // Build the query to fetch profiles
  let queryBuilder = supabase.from('profiles').select('id, full_name, role, created_at');

  // If there is a search query, filter the results
  if (query) {
    queryBuilder = queryBuilder.ilike('full_name', `%${query}%`);
  }

  const { data: students, error } = await queryBuilder.order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching students:", error);
  }

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground">Search, view, and manage all registered students.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>
            A list of all users in the system.
          </CardDescription>
          {/* Add the search component here */}
          <SearchStudents />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students && students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={student.role === 'admin' ? 'default' : 'secondary'}>
                        {student.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(student.created_at!).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
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
