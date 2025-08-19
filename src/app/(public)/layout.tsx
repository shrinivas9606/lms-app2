// src/app/(public)/layout.tsx
import PublicHeader from '@/components/PublicHeader';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PublicHeader />
      {children}
    </div>
  );
}
