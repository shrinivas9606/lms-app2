// src/app/layout.tsx
import { Toaster as Sonner } from "@/components/ui/sonner" // Import the new Sonner component
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import NotificationBell from '@/components/NotificationBell';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <header className="p-4 border-b">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="font-bold">My LMS</Link>
            {user ? (
              <div className="flex items-center gap-4">
                <NotificationBell user={user} />
                <LogoutButton />
              </div>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <Sonner /> {/* Add the Sonner component here */}
      </body>
    </html>
  );
}