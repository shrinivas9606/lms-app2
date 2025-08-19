// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookCopy, BookOpen, BarChart, Users, Settings, LifeBuoy, CheckCircle, MessageSquare } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface Profile {
  role: string | null;
}

interface SidebarProps {
  user: User | null;
  profile: Profile | null;
  isSheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ${
        isActive ? "bg-gray-100 text-gray-900" : ""
      }`}
    >
      {children}
    </Link>
  );
}

// The navigation content is now its own component to be reused
function NavigationContent({ user, profile, onLinkClick }: { user: User | null, profile: Profile | null, onLinkClick?: () => void }) {
  const isAdmin = profile?.role === 'admin';
  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookCopy className="h-6 w-6 text-violet-600" />
          <span className="">Suffix AI</span>
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {isAdmin ? (
            <>
              <NavLink href="/dashboard/admin" onClick={onLinkClick}><BookOpen className="h-4 w-4" />Dashboard</NavLink>
              <NavLink href="/dashboard/admin/courses" onClick={onLinkClick}><BookCopy className="h-4 w-4" />Courses</NavLink>
              <NavLink href="/dashboard/admin/students" onClick={onLinkClick}><Users className="h-4 w-4" />Students</NavLink>
              <NavLink href="/dashboard/admin/reports/revenue" onClick={onLinkClick}><BarChart className="h-4 w-4" />Reports</NavLink>
              <NavLink href="/dashboard/admin/inquiries" onClick={onLinkClick}><MessageSquare className="h-4 w-4" />Inquiries</NavLink>
            </>
          ) : (
            <>
              <NavLink href="/dashboard/student" onClick={onLinkClick}><BookOpen className="h-4 w-4" />Dashboard</NavLink>
              <NavLink href="/dashboard/student/attendance" onClick={onLinkClick}><CheckCircle className="h-4 w-4" />My Attendance</NavLink>
            </>
          )}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
         <NavLink href="/settings" onClick={onLinkClick}><Settings className="h-4 w-4" />Settings</NavLink>
         <NavLink href="/support" onClick={onLinkClick}><LifeBuoy className="h-4 w-4" />Support</NavLink>
      </div>
    </>
  );
}

export default function Sidebar({ user, profile, isSheetOpen, setSheetOpen }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-white lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <NavigationContent user={user} profile={profile} />
        </div>
      </div>
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="flex flex-col p-0">
           <NavigationContent user={user} profile={profile} onLinkClick={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
