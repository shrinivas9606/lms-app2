// src/app/courses/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BuyButton from '@/components/BuyButton';
import { Calendar, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

// THE FIX: We define the props type directly in the function signature.
// This is a more robust way to handle props for Next.js pages.
export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const slug = decodeURIComponent(params.slug);
  const supabase = createClient();

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (courseError || !course) {
    console.error(`Course with decoded slug "${slug}" not found.`, courseError);
    notFound();
  }

  const { data: batches } = await supabase
    .from('batches')
    .select('*')
    .eq('course_id', course.id)
    .eq('is_active', true)
    .order('start_date');

  return (
    <main>
      <section className="bg-gray-900 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <Badge variant="secondary">{course.is_active ? 'Open for Enrollment' : 'Closed'}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-4">{course.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-300">
            {course.description}
          </p>
          <p className="text-2xl font-bold mt-6">
            Price: ₹{course.price_inr.toLocaleString('en-IN')}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Available Batches</h2>
          {batches && batches.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {batches.map((batch) => (
                <Card key={batch.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{batch.name}</CardTitle>
                    <CardDescription>Platform: {batch.platform}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Starts: {new Date(batch.start_date!).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Timezone: {batch.timezone}</span>
                    </div>
                    <div className="md:ml-auto">
                      <BuyButton
                        batchId={batch.id}
                        amount={course.price_inr}
                        courseTitle={course.title}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>No active batches are available for this course right now.</p>
              <p>Please check back later!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
