// src/app/page.tsx
import { createClient } from '@/lib/supabase/server';
import CourseCard from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { submitContactForm } from '@/app/actions';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';

// --- Hero Section Component ---
const HeroSection = () => (
  <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-white">
    <div className="container mx-auto grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
      <div className="flex flex-col justify-center space-y-4">
        <div className="space-y-2">
          <p className="max-w-[600px] text-gray-300 md:text-xl">Welcome to the Future of AI Education</p>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
            Master AI & ML with SuffixAI
          </h1>
          <p className="max-w-[600px] text-gray-300 md:text-xl">
            Transform your career with industry-standard education. Hands-on projects, expert mentors, and career support.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          <Link href="/courses">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">Explore Courses</Button>
          </Link>
        </div>
      </div>
      {/* You can feature your most popular course here */}
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>Artificial Intelligence Fluency</CardTitle>
          <CardDescription className="text-gray-400">Duration: 45 Days</CardDescription>
        </CardHeader>
        <CardContent>
          <p>45 Days Projects + Future Ready Insights</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full text-white border-white hover:bg-white hover:text-black">Enroll Now</Button>
        </CardFooter>
      </Card>
    </div>
  </section>
);

// --- About Section Component ---
const AboutSection = () => (
  <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
    <div className="container mx-auto grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
      <div className="space-y-4">
        <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">About Us</div>
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Suffix AI Academy</h2>
        <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          SuffixAI is a leading provider of AI and ML education, offering comprehensive courses designed to equip learners with the skills needed to excel in the rapidly evolving field of artificial intelligence. Our expert instructors bring real-world experience and a passion for teaching, ensuring that students gain both theoretical knowledge and practical skills through hands-on projects and industry-relevant case studies.        
        </p>
      </div>
      <Image
        alt="About Us Image"
        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
        height="310"
        // The src path starts from the 'public' folder.
        // Make sure you have an image named 'about-us.jpg' in your public folder.
        src="/about-us.jpg" 
        width="550"
      />
    </div>
  </section>
);

// --- Courses Section Component ---
async function CoursesSection() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('id, slug, title, description, price_inr')
    .eq('is_active', true)
    .limit(3); // Show the top 3 courses on the landing page

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
      <div className="container mx-auto space-y-12 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">Our Courses</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Explore Our Programs</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find the perfect course to match your career goals.
            </p>
          </div>
        </div>
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(courses ?? []).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="text-center">
          <Link href="/courses">
            <Button variant="outline">View All Courses</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- Contact Section Component ---
const ContactSection = () => (
  <section className="w-full py-12 md:py-24 lg:py-32 border-t">
    <div className="container mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Get in Touch</h2>
        <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Have questions? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>
      <div className="mx-auto w-full max-w-sm space-y-4">
        <form action={submitContactForm} className="space-y-4">
          <Input name="name" placeholder="Name" required type="text" />
          <Input name="email" placeholder="Email" required type="email" />
          <Textarea name="message" placeholder="Message" required />
          <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white">Submit</Button>
        </form>
      </div>
    </div>
  </section>
);

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <CoursesSection />
      <ContactSection />
    </>
  );
}
