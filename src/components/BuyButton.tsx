// src/components/BuyButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface BuyButtonProps {
  batchId: string;
  amount: number;
  courseTitle: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BuyButton({ batchId, amount, courseTitle }: BuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Fetch the current user when the component mounts
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  // Load the Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast.error('Payment script is still loading. Please wait a moment.');
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to purchase a course.");
      router.push('/login');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount, currency: 'INR' }),
      });

      if (!response.ok) throw new Error('Failed to create Razorpay order');

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Your LMS Name',
        description: `Payment for ${courseTitle}`,
        order_id: order.id,
        handler: function (response: any) {
          toast.success("Payment Successful!", {
            description: "Redirecting you to your dashboard...",
          });
          setTimeout(() => {
            router.push('/dashboard/student?status=processing');
          }, 1500);
        },
        prefill: {
          name: user.user_metadata?.full_name || '',
          email: user.email,
        },
        notes: {
          batchId: batchId,
          userId: user.id, // Pass the user ID to the webhook
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment Failed", {
          description: response.error.description || "Please try again.",
        });
        console.error('Payment Failed:', response.error);
      });

    } catch (error) {
      console.error('An error occurred during payment:', error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={isLoading || !isScriptLoaded} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        `Enroll Now for ₹${amount.toLocaleString('en-IN')}`
      )}
    </Button>
  );
}
