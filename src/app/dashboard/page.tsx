// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role === 'admin') {
    redirect('/dashboard/admin');
  } else if (profile?.role === 'student') {
    redirect('/dashboard/student');
  } else {
    // This case handles profiles that might not be created yet or have no role
    // It's a good safeguard.
    redirect('/login?error=profile_incomplete');
  }

  // This loading state will be briefly visible during the redirect
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="ml-4">Loading your dashboard...</p>
    </div>
  );
}
