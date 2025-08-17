// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // THIS LINE IS ESSENTIAL
import { Toaster as Sonner } from "@/components/ui/sonner";
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';
import LogoutButton from '@/components/LogoutButton';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMS Platform",
  description: "Your modern learning management system.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="p-4 border-b bg-white">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="font-bold text-lg text-violet-700">My LMS</Link>
            {user ? (
              <div className="flex items-center gap-4">
                <NotificationBell user={user} />
                <LogoutButton />
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium hover:underline">Login</Link>
            )}
          </nav>
        </header>
        <main>{children}</main>
        <Sonner />
      </body>
    </html>
  );
}
