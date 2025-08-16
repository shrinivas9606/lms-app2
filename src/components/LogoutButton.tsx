// src/components/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Redirect to the login page after signing out
    router.push('/login');
    router.refresh(); // Clears any cached server component data
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Logout
    </Button>
  );
}