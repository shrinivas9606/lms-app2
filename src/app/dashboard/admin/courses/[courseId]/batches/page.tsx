// src/app/dashboard/admin/courses/[courseId]/batches/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
import { DeleteBatchButton } from '@/components/DeleteBatchButton';

interface BatchesPageProps {
  params: {
    courseId: string;
  };
}

export default async function AdminBatchesPage({ params }: BatchesPageProps) {
  const { courseId } = params;
  const supabase = await createClient();

  // Protect the route
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/student');

  // Fetch the course and its batches in parallel
  const [courseResult, batchesResult] = await Promise.all([
    supabase.from('courses').select('title').eq('id', courseId).single(),
    supabase.from('batches').select('*').eq('course_id', courseId).order('start_date', { ascending: false })
  ]);

  const { data: course, error: courseError } = courseResult;
  const { data: batches, error: batchesError } = batchesResult;

  if (courseError || !course) {
    notFound();
  }

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Managing Batches for</p>
          <h1 className="text-3xl font-bold">{course.title}</h1>
        </div>
        <Button asChild>
          <Link href={`/dashboard/admin/courses/${courseId}/batches/new`}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Batch
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Batches</CardTitle>
          <CardDescription>A list of all batches for this course.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches && batches.length > 0 ? (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.platform}</TableCell>
                    <TableCell>{new Date(batch.start_date!).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge variant={batch.is_active ? 'default' : 'destructive'}>
                        {batch.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* We will add Edit and Delete buttons here later */}
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/admin/batches/${batch.id}/lectures`}>
                            Manage Lectures
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/admin/courses/${courseId}/batches/${batch.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteBatchButton batchId={batch.id} courseId={courseId} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No batches found for this course.
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
