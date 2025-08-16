// src/components/CourseCard.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Define the shape of the 'course' object that this component expects to receive.
// This uses TypeScript for type safety.
export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price_inr: number;
};

interface CourseCardProps {
  course: Course;
}

// The component itself. It receives a 'course' object as a prop.
export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
        <CardDescription className="line-clamp-3 h-[60px]">
          {course.description || 'No description available.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold">
          ₹{course.price_inr.toLocaleString('en-IN')}
        </p>
      </CardContent>
      <CardFooter>
        {/* This Link component will navigate to the detailed page for this specific course */}
        <Link href={`/courses/${course.slug}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}