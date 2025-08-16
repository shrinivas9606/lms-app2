// src/app/courses/page.tsx
import { createClient } from '@/lib/supabase/server';
import CourseCard, { type Course } from '@/components/CourseCard';

// This is a new server component for a visually appealing header
const HeroSection = () => (
  <section className="text-center py-12 md:py-20 bg-gray-50 dark:bg-gray-900 border-b">
    <div className="container mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
        Explore Our Courses
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
        Find the perfect course to advance your skills and achieve your goals.
        All our sessions are live and interactive.
      </p>
    </div>
  </section>
);

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, title, description, price_inr')
    .eq('is_active', true);

  return (
    <>
      <HeroSection />
      <main className="container mx-auto py-8 md:py-12 px-4">
        {!courses || courses.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold">No Courses Available</h2>
            <p className="mt-2 text-gray-500">
              Please check back later for new course offerings!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course: Course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
