// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';
import LogoutButton from '@/components/LogoutButton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon } from "lucide-react";

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
  // CORRECTED: createClient() is not asynchronous
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the user's profile to get their avatar URL
  const { data: profile } = user 
    ? await supabase.from('profiles').select('avatar_url').eq('id', user.id).single() 
    : { data: null };

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="p-4 border-b bg-white sticky top-0 z-50">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="font-bold text-lg text-violet-700">Suffix AI</Link>
            
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <NotificationBell user={user} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer h-9 w-9">
                        <AvatarImage src={profile?.avatar_url ?? undefined} alt="User profile picture" />
                        <AvatarFallback>
                          <UserIcon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      {/* You can add a profile settings page link here later */}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <LogoutButton />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                // If not logged in, show a placeholder avatar that links to login
                <Link href="/login">
                  <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="bg-gray-50/50">{children}</main>
        <Sonner />
      </body>
    </html>
  );
}



