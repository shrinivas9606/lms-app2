// src/components/PublicHeader.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookCopy } from 'lucide-react';

export default function PublicHeader() {
  return (
    <header className="p-4 px-6 border-b bg-white sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookCopy className="h-6 w-6 text-violet-600" />
          <span className="text-lg font-bold">My LMS</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
            <Link href="/login">Register</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
