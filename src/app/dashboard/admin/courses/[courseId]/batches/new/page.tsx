// src/app/dashboard/admin/courses/[courseId]/batches/new/page.tsx
import { BatchForm } from '@/components/BatchForm';
import { createBatch } from '@/app/actions';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function NewBatchPage({ params }: any) {
  const { courseId } = params;
  const supabase = await createClient();
  const { data: course } = await supabase.from('courses').select('title').eq('id', courseId).single();

  if (!course) {
    notFound();
  }

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Creating new batch for</p>
          <h1 className="text-3xl font-bold">{course.title}</h1>
        </div>
        {/* We pass the courseId to the form action */}
        <BatchForm
          formAction={createBatch.bind(null, courseId)}
          buttonText="Create Batch"
        />
      </div>
    </main>
  );
}
