// src/app/page.tsx

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import CourseCard, { type Course } from '@/components/CourseCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch only active courses for the landing page
  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, title, description, price_inr')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Fetch the user session to show a login or dashboard button
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="container mx-auto py-8 px-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Our Courses</h1>
        {user ? (
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </header>
      
      {/* Handle case where no courses are found */}
      {!courses || courses.length === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <h2 className="text-2xl font-semibold">Coming Soon!</h2>
          <p className="text-muted-foreground mt-2">No courses are available at the moment. Please check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Map over the fetched courses and render a CourseCard for each one */}
          {courses.map((course) => (
            <CourseCard key={course.id} course={course as Course} />
          ))}
        </div>
      )}
    </main>
  );
}