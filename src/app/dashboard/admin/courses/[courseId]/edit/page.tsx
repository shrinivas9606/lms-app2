// src/app/dashboard/admin/courses/[courseId]/edit/page.tsx
import { createClient } from '@/lib/supabase/server';
import { CourseForm } from '@/components/CourseForm';
import { updateCourse } from '@/app/actions';
import { notFound } from 'next/navigation';
import type { PageProps } from '@/lib/types';
type EditCoursePageProps = PageProps<{ courseId: string }>;

// interface EditCoursePageProps {
//   params: {
//     courseId: string;
//   };
// }

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = params;
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();
  
  if (error || !course) {
    notFound(); // Will render the not-found.tsx page
  }

  return (
    <main className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground">Update the details for "{course.title}".</p>
        </div>
        <CourseForm
          formAction={updateCourse}
          buttonText="Save Changes"
          initialData={course}
        />
      </div>
    </main>
  );
}
