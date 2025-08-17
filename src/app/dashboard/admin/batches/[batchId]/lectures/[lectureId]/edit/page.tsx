// src/app/dashboard/admin/batches/[batchId]/lectures/[lectureId]/edit/page.tsx
import { createClient } from '@/lib/supabase/server';
import { LectureForm } from '@/components/LectureForm';
import { updateLecture } from '@/app/actions';
import { notFound } from 'next/navigation';
import type { PageProps } from '@/lib/types';
type EditLecturePageProps = PageProps<{ batchId: string, lectureId: string }>;

// interface EditLecturePageProps {
//   params: {
//     batchId: string;
//     lectureId: string;
//   };
// }

export default async function EditLecturePage({ params }: EditLecturePageProps) {
  const { batchId, lectureId } = params;
  const supabase = await createClient();

  const { data: lecture, error } = await supabase
    .from('lectures')
    .select('*, batches(name, courses(title))')
    .eq('id', lectureId)
    .eq('batch_id', batchId)
    .single();
  
  if (error || !lecture) {
    notFound();
  }

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Editing lecture for {lecture.batches?.courses?.title} - {lecture.batches?.name}</p>
          <h1 className="text-3xl font-bold">{lecture.title}</h1>
        </div>
        <LectureForm
          formAction={updateLecture.bind(null, batchId)}
          buttonText="Save Changes"
          initialData={lecture}
        />
      </div>
    </main>
  );
}
