// src/app/dashboard/admin/courses/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DeleteCourseButton } from '@/components/DeleteCourseButton'; 
import Link from 'next/link';
import { PlusCircle, Edit } from 'lucide-react';
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

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  // Protect the route for admin users only
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/student');

  // Fetch all courses
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
    // Handle error appropriately
  }

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Courses</h1>
          <p className="text-muted-foreground">Here you can create, view, and edit all courses.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Courses</CardTitle>
          <CardDescription>A list of all courses in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price (INR)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>₹{course.price_inr.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={course.is_active ? 'default' : 'destructive'}>
                        {course.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/admin/courses/${course.id}/batches`}>
                          Manage Batches
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        {/* We will create this edit page next */}
                        <Link href={`/dashboard/admin/courses/${course.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteCourseButton courseId={course.id} /> {/* Add this line */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No courses found.
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
