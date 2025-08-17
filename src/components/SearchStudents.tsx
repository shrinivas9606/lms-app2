// src/components/SearchStudents.tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { useDebouncedCallback } from 'use-debounce';

export function SearchStudents() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // This function is wrapped in a debounce callback to prevent
  // sending a request to the server on every keystroke.
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    // Update the URL with the new search query
    replace(`${pathname}?${params.toString()}`);
  }, 300); // Wait 300ms after the user stops typing

  return (
    <div className="mt-4">
      <Input
        type="search"
        placeholder="Search by student name..."
        className="max-w-sm"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get('q')?.toString()}
      />
    </div>
  );
}
