// src/components/BatchForm.tsx
'use client';

import { useActionState, useEffect, useState } from 'react'; // CORRECT: Import useActionState from react
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const initialState = { message: '', success: false };

interface BatchData {
  id?: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  platform: string;
  is_active: boolean;
}

interface BatchFormProps {
  formAction: (prevState: any, formData: FormData) => Promise<any>;
  buttonText: string;
  initialData?: BatchData | null;
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

export function BatchForm({ formAction, buttonText, initialData }: BatchFormProps) {
  // CORRECT: Use useActionState instead of useFormState
  const [state, dispatch] = useActionState(formAction, initialState);
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialData?.start_date ? new Date(initialData.start_date) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialData?.end_date ? new Date(initialData.end_date) : undefined
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success("Success!", { description: state.message });
      else toast.error("Error", { description: state.message });
    }
  }, [state]);

  return (
    <form action={dispatch} className="space-y-6">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      
      <div className="space-y-2">
        <Label htmlFor="name">Batch Name</Label>
        <Input id="name" name="name" placeholder="e.g., Summer 2025 Cohort" required defaultValue={initialData?.name} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="start_date" value={startDate?.toISOString()} />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="end_date" value={endDate?.toISOString()} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">Platform</Label>
        <Select name="platform" required defaultValue={initialData?.platform}>
          <SelectTrigger>
            <SelectValue placeholder="Select a platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="YOUTUBE">YouTube</SelectItem>
            <SelectItem value="JITSI">Jitsi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="is_active" name="is_active" defaultChecked={initialData?.is_active ?? true} />
        <Label htmlFor="is_active">Is Active?</Label>
      </div>
      <SubmitButton text={buttonText} />
    </form>
  );
}
