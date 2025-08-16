// src/app/dashboard/admin/courses/new/page.tsx
import { CourseForm } from '@/components/CourseForm';
import { createCourse } from '@/app/actions';

export default function NewCoursePage() {
  return (
    <main className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create a New Course</h1>
          <p className="text-muted-foreground">Fill in the details below to add a new course to the catalog.</p>
        </div>
        <CourseForm
          formAction={createCourse}
          buttonText="Create Course"
        />
      </div>
    </main>
  );
}
