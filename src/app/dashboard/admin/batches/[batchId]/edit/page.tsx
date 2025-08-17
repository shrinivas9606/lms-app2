// src/app/dashboard/admin/courses/[courseId]/batches/[batchId]/edit/page.tsx
import { createClient } from '@/lib/supabase/server';
import { BatchForm } from '@/components/BatchForm';
import { updateBatch } from '@/app/actions';
import { notFound } from 'next/navigation';
import type { PageProps } from '@/lib/types';
type EditBatchPageProps = PageProps<{ courseId: string, batchId: string }>;

// interface EditBatchPageProps {
//   params: {
//     courseId: string;
//     batchId: string;
//   };
// }

export default async function EditBatchPage({ params }: EditBatchPageProps) {
  const { courseId, batchId } = params;
  const supabase = await createClient();

  const { data: batch, error } = await supabase
    .from('batches')
    .select('*, courses(title)')
    .eq('id', batchId)
    .eq('course_id', courseId)
    .single();
  
  if (error || !batch) {
    notFound();
  }

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Editing batch for {batch.courses?.title}</p>
          <h1 className="text-3xl font-bold">{batch.name}</h1>
        </div>
        <BatchForm
          formAction={updateBatch.bind(null, courseId)}
          buttonText="Save Changes"
          initialData={batch}
        />
      </div>
    </main>
  );
}
