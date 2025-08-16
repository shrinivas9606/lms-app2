// src/components/CourseForm.tsx
'use client';

import { useActionState, useEffect } from 'react'; // Import useActionState from react
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const initialState = {
  message: '',
  success: false,
};

// Define the shape of the course data
interface CourseData {
  id?: string;
  title: string;
  slug: string;
  description: string | null;
  price_inr: number;
  is_active: boolean;
}

interface CourseFormProps {
  formAction: (prevState: any, formData: FormData) => Promise<any>;
  buttonText: string;
  initialData?: CourseData | null;
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {text}
    </Button>
  );
}

export function CourseForm({ formAction, buttonText, initialData }: CourseFormProps) {
  // Replace useFormState with useActionState
  const [state, dispatch] = useActionState(formAction, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success("Success!", { description: state.message });
      } else {
        toast.error("Error", { description: state.message });
      }
    }
  }, [state]);

  return (
    <form action={dispatch} className="space-y-6">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      
      <div className="space-y-2">
        <Label htmlFor="title">Course Title</Label>
        <Input id="title" name="title" placeholder="e.g., Next.js for Beginners" required defaultValue={initialData?.title} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Course Slug</Label>
        <Input id="slug" name="slug" placeholder="e.g., nextjs-for-beginners (unique)" required defaultValue={initialData?.slug} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="A brief summary of the course..." defaultValue={initialData?.description || ''} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price_inr">Price (INR)</Label>
        <Input id="price_inr" name="price_inr" type="number" placeholder="e.g., 4999" required defaultValue={initialData?.price_inr} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="is_active" name="is_active" defaultChecked={initialData?.is_active ?? true} />
        <Label htmlFor="is_active">Is Active?</Label>
      </div>
      <SubmitButton text={buttonText} />
    </form>
  );
}
