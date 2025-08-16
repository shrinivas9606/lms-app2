// src/app/dashboard/admin/batches/[batchId]/lectures/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Edit, Users } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DeleteLectureButton } from '@/components/DeleteLectureButton';

interface LecturesPageProps {
  params: {
    batchId: string;
  };
}

export default async function AdminLecturesPage({ params }: LecturesPageProps) {
  const { batchId } = params;
  const supabase = await createClient();

  // Protect the route
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard/student');

  // Fetch batch and its lectures
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select('name, courses(title)')
    .eq('id', batchId)
    .single();

  if (batchError || !batch) {
    notFound();
  }

  const { data: lectures, error: lecturesError } = await supabase
    .from('lectures')
    .select('*')
    .eq('batch_id', batchId)
    .order('scheduled_at', { ascending: true });

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Managing Lectures for {batch.courses?.[0]?.title}</p>
          <h1 className="text-3xl font-bold">{batch.name}</h1>
        </div>
        <Button asChild>
          <Link href={`/dashboard/admin/batches/${batchId}/lectures/new`}>
            <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Lecture
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Lectures</CardTitle>
          <CardDescription>A list of all lectures for this batch.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lecture Title</TableHead>
                <TableHead>Scheduled At</TableHead>
                <TableHead>Duration (min)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lectures && lectures.length > 0 ? (
                lectures.map((lecture) => (
                  <TableRow key={lecture.id}>
                    <TableCell className="font-medium">{lecture.title}</TableCell>
                    <TableCell>
                      {new Date(lecture.scheduled_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                        timeZone: 'Asia/Kolkata'
                      })}
                    </TableCell>
                    <TableCell>{lecture.duration_min}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/admin/attendance/${lecture.id}`}>
                            <Users className="h-4 w-4 mr-2" /> Attendance
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/admin/batches/${batchId}/lectures/${lecture.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteLectureButton lectureId={lecture.id} batchId={batchId} />
                        {/* We will add Edit and Delete buttons here later */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No lectures scheduled for this batch yet.
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
