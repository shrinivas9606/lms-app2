// src/components/LectureForm.tsx
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';

const initialState = { message: '', success: false };

interface LectureData {
  id?: string;
  title: string;
  scheduled_at: string;
  duration_min: number | null;
  stream_url: string | null;
}

interface LectureFormProps {
  formAction: (prevState: any, formData: FormData) => Promise<any>;
  buttonText: string;
  initialData?: LectureData | null;
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

export function LectureForm({ formAction, buttonText, initialData }: LectureFormProps) {
  const [state, dispatch] = useFormState(formAction, initialState);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.scheduled_at ? parseISO(initialData.scheduled_at) : undefined
  );
  const [time, setTime] = useState<string>(
    initialData?.scheduled_at ? format(parseISO(initialData.scheduled_at), 'HH:mm') : ''
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success("Success!", { description: state.message });
      else toast.error("Error", { description: state.message });
    }
  }, [state]);

  const getDateTimeString = () => {
    if (!date || !time) return '';
    const [hours, minutes] = time.split(':');
    const combinedDate = new Date(date);
    combinedDate.setHours(parseInt(hours, 10));
    combinedDate.setMinutes(parseInt(minutes, 10));
    return combinedDate.toISOString();
  };

  return (
    <form action={dispatch} className="space-y-6">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      
      <div className="space-y-2">
        <Label htmlFor="title">Lecture Title</Label>
        <Input id="title" name="title" placeholder="e.g., Introduction to React Hooks" required defaultValue={initialData?.title} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time (24-hour format)</Label>
          <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
      </div>
      
      <input type="hidden" name="scheduled_at" value={getDateTimeString()} />

      <div className="space-y-2">
        <Label htmlFor="duration_min">Duration (in minutes)</Label>
        <Input id="duration_min" name="duration_min" type="number" placeholder="e.g., 60" required defaultValue={initialData?.duration_min ?? undefined} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stream_url">Stream URL / ID</Label>
        <Input id="stream_url" name="stream_url" placeholder="YouTube Video ID or Jitsi Room Name" required defaultValue={initialData?.stream_url ?? undefined} />
      </div>

      <SubmitButton text={buttonText} />
    </form>
  );
}
