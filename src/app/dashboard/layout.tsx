// src/app/dashboard/layout.tsx
"use client"; 

import { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  role: string | null;
  avatar_url: string | null;
  full_name: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, avatar_url, full_name')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
    };
    fetchData();
  }, [supabase]);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <Sidebar user={user} profile={profile} isSheetOpen={isSheetOpen} setSheetOpen={setSheetOpen} />
      
      {/* THE FIX: This container is now constrained to the screen height */}
      <div className="flex flex-col h-screen overflow-hidden">
        <Header user={user} profile={profile} setSheetOpen={setSheetOpen} />
        
        {/* The main content area will now scroll independently */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
