// src/app/dashboard/student/batches/[batchId]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function StudentBatchDetailPage({ params }: { params: { batchId: string } }) {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  // Fetch the specific batch and its lectures
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select(`
      name,
      courses ( title ),
      lectures ( id, title, scheduled_at, recording_url )
    `)
    .eq('id', params.batchId)
    .single();

  if (batchError || !batch) {
    notFound();
  }

  // Ensure lectures are sorted by date
  batch.lectures.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{batch.courses?.[0]?.title}</p>
        <h1 className="text-3xl font-bold">Lecture Schedule: {batch.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Lectures</CardTitle>
          <CardDescription>Here is the complete schedule and recordings for your batch.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lecture</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Status / Recording</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batch.lectures && batch.lectures.length > 0 ? (
                batch.lectures.map((lecture) => {
                  const isPast = new Date(lecture.scheduled_at) < new Date();
                  return (
                    <TableRow key={lecture.id}>
                      <TableCell className="font-medium">{lecture.title}</TableCell>
                      <TableCell>
                        {new Date(lecture.scheduled_at).toLocaleString('en-IN', {
                          dateStyle: 'full',
                          timeStyle: 'short',
                          timeZone: 'Asia/Kolkata'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPast ? (
                          lecture.recording_url ? (
                            <a href={lecture.recording_url} target="_blank" rel="noopener noreferrer">
                              <Badge>Watch Recording</Badge>
                            </a>
                          ) : (
                            <Badge variant="secondary">Completed</Badge>
                          )
                        ) : (
                          <Badge variant="outline">Upcoming</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No lectures have been scheduled for this batch yet.
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
