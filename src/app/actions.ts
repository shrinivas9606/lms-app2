// src/app/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

type AttendanceData = Record<string, 'PRESENT' | 'ABSENT'>;

export async function markAttendance(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // Check if user is admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Authorization failed: Not an admin');

  const lectureId = formData.get('lectureId') as string;
  const attendanceData = JSON.parse(formData.get('attendanceData') as string) as AttendanceData;

  if (!lectureId || !attendanceData) {
    throw new Error('Missing lecture ID or attendance data');
  }

  // Prepare data for upsert
  const recordsToUpsert = Object.entries(attendanceData).map(([userId, status]) => ({
    lecture_id: lectureId,
    user_id: userId,
    status: status,
    marked_by: user.id,
  }));

  // Upsert allows us to insert new records or update existing ones in a single operation
  const { error } = await supabase
    .from('attendance')
    .upsert(recordsToUpsert, { onConflict: 'lecture_id, user_id' }); // Specify conflict target

  if (error) {
    console.error('Error saving attendance:', error);
    throw new Error('Failed to save attendance.');
  }

  // Revalidate the path to ensure the page shows fresh data on the next visit
  revalidatePath(`/dashboard/admin/attendance/${lectureId}`);

  console.log('Attendance saved successfully for lecture:', lectureId);
}


export async function createCourse(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // Authentication and Authorization
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication required', success: false };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { message: 'Authorization failed', success: false };

  // Form data validation (basic)
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const price_inr = Number(formData.get('price_inr'));
  const is_active = formData.get('is_active') === 'on';

  if (!title || !slug || !price_inr) {
    return { message: 'Title, Slug, and Price are required.', success: false };
  }

  // Insert data into the database
  const { error } = await supabase.from('courses').insert({
    title,
    slug,
    description,
    price_inr,
    is_active,
  });

  if (error) {
    console.error('Error creating course:', error);
    return { message: `Database error: ${error.message}`, success: false };
  }

  // Revalidate the path to show the new course in the table
  revalidatePath('/dashboard/admin/courses');
  
  // Redirect to the courses list page on success
  redirect('/dashboard/admin/courses');
}


export async function updateCourse(prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication required', success: false };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { message: 'Authorization failed', success: false };
  
  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const price_inr = Number(formData.get('price_inr'));
  const is_active = formData.get('is_active') === 'on';

  if (!id || !title || !slug || !price_inr) {
    return { message: 'ID, Title, Slug, and Price are required.', success: false };
  }

  const { error } = await supabase
    .from('courses')
    .update({ title, slug, description, price_inr, is_active })
    .eq('id', id);

  if (error) {
    console.error('Error updating course:', error);
    return { message: `Database error: ${error.message}`, success: false };
  }

  revalidatePath('/dashboard/admin/courses');
  revalidatePath(`/dashboard/admin/courses/${id}/edit`);
  
  // We can't redirect from here because the form needs to show the success message.
  // The user will see the success toast and can then navigate away.
  return { message: 'Course updated successfully.', success: true };
}


export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication required', success: false };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { message: 'Authorization failed', success: false };
  
  if (!courseId) {
    return { message: 'Course ID is required.', success: false };
  }

  // The CASCADE on the foreign keys in your DB should handle deleting related records.
  const { error } = await supabase.from('courses').delete().eq('id', courseId);

  if (error) {
    console.error('Error deleting course:', error);
    return { message: `Database error: ${error.message}`, success: false };
  }

  revalidatePath('/dashboard/admin/courses');
  return { message: 'Course deleted successfully.', success: true };
}


export async function createBatch(courseId: string, prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  // Auth & Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication required', success: false };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { message: 'Authorization failed', success: false };

  // Form data extraction
  const name = formData.get('name') as string;
  const start_date = formData.get('start_date') as string;
  const end_date = formData.get('end_date') as string;
  const platform = formData.get('platform') as string;
  const is_active = formData.get('is_active') === 'on';

  if (!name || !platform || !start_date) {
    return { message: 'Name, Platform, and Start Date are required.', success: false };
  }

  // Insert into DB
  const { error } = await supabase.from('batches').insert({
    course_id: courseId,
    name,
    start_date,
    end_date,
    platform,
    is_active,
  });

  if (error) {
    console.error('Error creating batch:', error);
    return { message: `Database error: ${error.message}`, success: false };
  }

  revalidatePath(`/dashboard/admin/courses/${courseId}/batches`);
  redirect(`/dashboard/admin/courses/${courseId}/batches`);
}


export async function updateBatch(courseId: string, prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  // Auth & Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication required', success: false };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { message: 'Authorization failed', success: false };

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const start_date = formData.get('start_date') as string;
  const end_date = formData.get('end_date') as string;
  const platform = formData.get('platform') as string;
  const is_active = formData.get('is_active') === 'on';

  if (!id || !name || !platform || !start_date) {
    return { message: 'ID, Name, Platform, and Start Date are required.', success: false };
  }

  const { error } = await supabase
    .from('batches')
    .update({ name, start_date, end_date, platform, is_active })
    .eq('id', id);

  if (error) {
    console.error('Error updating batch:', error);
    return { message: `Database error: ${error.message}`, success: false };
  }

  revalidatePath(`/dashboard/admin/courses/${courseId}/batches`);
  revalidatePath(`/dashboard/admin/courses/${courseId}/batches/${id}/edit`);
  
  return { message: 'Batch updated successfully.', success: true };
}


export async function deleteBatch(batchId: string, courseId: string) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication required', success: false };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { message: 'Authorization failed', success: false };
  
  if (!batchId) {
    return { message: 'Batch ID is required.', success: false };
  }

  const { error } = await supabase.from('batches').delete().eq('id', batchId);

  if (error) {
    console.error('Error deleting batch:', error);
    return { message: `Database error: ${error.message}`, success: false };
  }

  revalidatePath(`/dashboard/admin/courses/${courseId}/batches`);
  return { message: 'Batch deleted successfully.', success: true };
}


export async function createLecture(batchId: string, prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  // Auth & Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication required', success: false };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { message: 'Authorization failed', success: false };

  // Form data extraction
  const title = formData.get('title') as string;
  const scheduled_at = formData.get('scheduled_at') as string;
  const duration_min = Number(formData.get('duration_min'));
  const stream_url = formData.get('stream_url') as string;

  if (!title || !scheduled_at || !duration_min || !stream_url) {
    return { message: 'All fields are required.', success: false };
  }

  // Insert into DB
  const { error } = await supabase.from('lectures').insert({
    batch_id: batchId,
    title,
    scheduled_at,
    duration_min,
    stream_url,
  });

  if (error) {
    console.error('Error creating lecture:', error);
    return { message: `Database error: ${error.message}`, success: false };
  }

  revalidatePath(`/dashboard/admin/batches/${batchId}/lectures`);
  redirect(`/dashboard/admin/batches/${batchId}/lectures`);
}


export async function updateLecture(batchId: string, prevState: any, formData: FormData) {
  const supabase = await createClient();
  
  // Auth & Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication required', success: false };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { message: 'Authorization failed', success: false };

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const scheduled_at = formData.get('scheduled_at') as string;
  const duration_min = Number(formData.get('duration_min'));
  const stream_url = formData.get('stream_url') as string;

  if (!id || !title || !scheduled_at || !duration_min || !stream_url) {
    return { message: 'All fields are required.', success: false };
  }

  const { error } = await supabase
    .from('lectures')
    .update({ title, scheduled_at, duration_min, stream_url })
    .eq('id', id);

  if (error) {
    console.error('Error updating lecture:', error);
    return { message: `Database error: ${error.message}`, success: false };
  }

  revalidatePath(`/dashboard/admin/batches/${batchId}/lectures`);
  revalidatePath(`/dashboard/admin/batches/${batchId}/lectures/${id}/edit`);
  
  return { message: 'Lecture updated successfully.', success: true };
}


export async function deleteLecture(lectureId: string, batchId: string) {
  const supabase = await createClient();
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: 'Authentication required', success: false };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { message: 'Authorization failed', success: false };
  
  if (!lectureId) {
    return { message: 'Lecture ID is required.', success: false };
  }

  const { error } = await supabase.from('lectures').delete().eq('id', lectureId);

  if (error) {
    console.error('Error deleting lecture:', error);
    return { message: `Database error: ${error.message}`, success: false };
  }

  revalidatePath(`/dashboard/admin/batches/${batchId}/lectures`);
  return { message: 'Lecture deleted successfully.', success: true };
}

export async function submitContactForm(formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !message) {
    // Handle error - maybe return a message to the user
    console.error("Contact form submission is missing required fields.");
    return;
  }

  // THE CHANGE: Insert the data into the new 'contact_inquiries' table
  const { error } = await supabase
    .from('contact_inquiries')
    .insert({ name, email, message });

  if (error) {
    console.error("Error saving contact inquiry:", error);
    // Handle the error appropriately, maybe return an error state
  } else {
    console.log('New contact form submission saved to database.');
    // You could add a success message here if you modify the form to handle state
  }

  // Optional: Redirect to a "thank you" page after submission
  // For now, we will just stay on the page.
  // redirect('/thank-you');
}


