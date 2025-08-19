// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { createClient } from '@/lib/supabase/server';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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

  const { data: profile } = user 
    ? await supabase.from('profiles').select('role, avatar_url, full_name').eq('id', user.id).single() 
    : { data: null };

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
          {/* This line adds the sidebar to your application */}
          <Sidebar user={user} profile={profile} />

          {/* This is the main content area */}
          <div className="flex flex-col">
            <Header user={user} profile={profile} />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50/50">
              {children}
            </main>
          </div>
        </div>
        <Sonner />
      </body>
    </html>
  );
}
