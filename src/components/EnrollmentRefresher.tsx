// src/components/EnrollmentRefresher.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function EnrollmentRefresher() {
  const router = useRouter();

  useEffect(() => {
    // Show a toast to inform the user
    const toastId = toast.loading("Processing Enrollment...", {
      description: "Finalizing your details. Your dashboard will refresh shortly.",
    });

    // Set a timeout to refresh the page after 5 seconds
    const timer = setTimeout(() => {
      router.refresh();
      toast.dismiss(toastId); // Dismiss the loading toast
    }, 5000); // Increased delay to 5 seconds

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [router]);

  // This component renders nothing itself
  return null;
}
