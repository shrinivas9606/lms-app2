// src/app/dashboard/admin/batches/[batchId]/lectures/new/page.tsx
import { LectureForm } from '@/components/LectureForm';
import { createLecture } from '@/app/actions';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { PageProps } from '@/lib/types';
type NewLecturePageProps = PageProps<{ batchId: string }>;

export default async function NewLecturePage({ params }: NewLecturePageProps) {
  const { batchId } = params;
  const supabase = await createClient();
  const { data: batch } = await supabase
    .from('batches')
    .select('name, courses(title)')
    .eq('id', batchId)
    .single();

  if (!batch) {
    notFound();
  }

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Scheduling new lecture for {batch.courses?.[0]?.title}</p>
          <h1 className="text-3xl font-bold">{batch.name}</h1>
        </div>
        <LectureForm
          formAction={createLecture.bind(null, batchId)}
          buttonText="Schedule Lecture"
        />
      </div>
    </main>
  );
}
