// src/app/dashboard/layout.tsx
import { createClient } from '@/lib/supabase/server';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default async function DashboardLayout({
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
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      {/* Sidebar Column */}
      <Sidebar user={user} profile={profile} />

      {/* Main Content Column */}
      <div className="flex flex-col">
        <Header user={user} profile={profile} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
