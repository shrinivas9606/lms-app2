// src/components/AttendanceTable.tsx
'use client';

import { useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

// Define types for the props
type Student = {
  id: string;
  name: string;
};

type AttendanceStatus = 'PRESENT' | 'ABSENT';

type ExistingAttendance = {
  user_id: string;
  status: string;
};

interface AttendanceTableProps {
  students: Student[];
  lectureId: string;
  existingAttendance: ExistingAttendance[];
  markAttendanceAction: (formData: FormData) => Promise<void>;
}

export function AttendanceTable({
  students,
  lectureId,
  existingAttendance,
  markAttendanceAction,
}: AttendanceTableProps) {
  // Initialize attendance state from existing records, defaulting to ABSENT
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    const initialState: Record<string, AttendanceStatus> = {};
    students.forEach(student => {
      const record = existingAttendance.find(a => a.user_id === student.id);
      initialState[student.id] = record?.status === 'PRESENT' ? 'PRESENT' : 'ABSENT';
    });
    return initialState;
  });

  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent ? 'PRESENT' : 'ABSENT',
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    const newState: Record<string, AttendanceStatus> = {};
    students.forEach(student => {
      newState[student.id] = status;
    });
    setAttendance(newState);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('lectureId', lectureId);
    formData.append('attendanceData', JSON.stringify(attendance));

    startTransition(async () => {
      await markAttendanceAction(formData);
      // Optionally show a success toast here
      alert('Attendance saved successfully!');
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => markAll('PRESENT')} variant="outline">Mark All Present</Button>
        <Button onClick={() => markAll('ABSENT')} variant="outline">Mark All Absent</Button>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Student Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map(student => (
              <TableRow key={student.id}>
                <TableCell>
                  <Checkbox
                    checked={attendance[student.id] === 'PRESENT'}
                    onCheckedChange={(checked) => handleStatusChange(student.id, !!checked)}
                    id={`att-${student.id}`}
                  />
                  <label htmlFor={`att-${student.id}`} className="ml-2">
                    Present
                  </label>
                </TableCell>
                <TableCell>{student.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button onClick={handleSubmit} disabled={isPending} className="mt-4 w-full md:w-auto">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Attendance
      </Button>
    </div>
  );
}
