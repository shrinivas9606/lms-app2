// src/app/dashboard/admin/attendance/[lectureId]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AttendanceTable } from '@/components/AttendanceTable';
import { markAttendance } from '@/app/actions';
import { notFound } from 'next/navigation';

export default async function AttendancePage({ params }: any) {
  const { lectureId } = params;
  const supabase = await createClient();

  // 1. Fetch current user and check if they are an admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return <p className="p-8">You do not have permission to view this page.</p>;
  }

  // 2. Fetch lecture details to get the batch_id
  const { data: lecture, error: lectureError } = await supabase
    .from('lectures')
    .select(`
      title,
      scheduled_at,
      batch_id,
      batches ( name, courses (title) )
    `)
    .eq('id', lectureId)
    .single();

  if (lectureError || !lecture) {
    notFound();
  }

  // 3. Fetch all students with an ACTIVE enrollment in this lecture's batch
  const { data: students, error: studentsError } = await supabase
    .from('enrollments')
    .select(`
      profiles ( id, full_name )
    `)
    .eq('batch_id', lecture.batch_id)
    .eq('status', 'ACTIVE');

  if (studentsError || !students) {
    return <p className="p-8">Could not fetch students for this batch.</p>;
  }

  // 4. Fetch existing attendance records for this lecture
  const { data: existingAttendance } = await supabase
    .from('attendance')
    .select('user_id, status')
    .eq('lecture_id', lectureId);

  // Format student list for the client component
  const studentList = students.map(s => ({
    id: (s.profiles as { id?: any; full_name?: any })?.id,
    name: (s.profiles as { id?: any; full_name?: any })?.full_name || 'No name provided',
  }));

  return (
    <main className="p-4 md:p-8">
      <div className="mb-6">
        <p className="text-muted-foreground">
          {lecture.batches?.[0]?.courses?.[0]?.title} - {lecture.batches?.[0]?.name}
        </p>
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <h2 className="text-xl text-muted-foreground">{lecture.title}</h2>
        <p className="text-sm text-muted-foreground">
          {new Date(lecture.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </p>
      </div>
      
      <AttendanceTable
        students={studentList}
        lectureId={lectureId}
        existingAttendance={existingAttendance || []}
        markAttendanceAction={markAttendance}
      />
    </main>
  );
}
