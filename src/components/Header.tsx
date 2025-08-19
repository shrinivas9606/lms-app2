// src/components/Header.tsx
"use client"; 

import Link from 'next/link';
import type { User } from "@supabase/supabase-js";
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
import { User as UserIcon, Menu } from "lucide-react";
import { Button } from '@/components/ui/button';

// We pass the setSheetOpen function from the layout to control the mobile sidebar
interface HeaderProps {
  user: User | null;
  profile: { avatar_url: string | null; full_name: string | null; } | null;
  setSheetOpen: (open: boolean) => void;
}

export default function Header({ user, profile, setSheetOpen }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        {/* Mobile Hamburger Menu Button */}
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={() => setSheetOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>

        <div className="w-full flex-1">
            {/* You can add a search bar here later if you want */}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <NotificationBell user={user} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer h-9 w-9">
                    <AvatarImage src={profile?.avatar_url ?? undefined} alt="User profile picture" />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300">
                <UserIcon className="h-5 w-5 text-gray-500" />
              </div>
            </Link>
          )}
        </div>
    </header>
  );
}
