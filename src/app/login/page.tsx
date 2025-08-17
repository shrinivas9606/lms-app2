// src/app/login/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);
  
  const getURL = () => {
    let url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000/';
    url = url.includes('http') ? url : `https://${url}`;
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return `${url}auth/callback`;
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Get Started</h1>
            <p className="text-balance text-muted-foreground">
              Create an account or sign in to access your learning dashboard
            </p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(222.2 47.4% 11.2%)',
                    brandAccent: 'hsl(222.2 84% 4.9%)',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={getURL()}
            theme="dark"
            view="sign_up" // Default to the sign-up view
            // THE FIX: Add a 'full_name' field to the sign-up form
            additionalData={{
              sign_up: {
                full_name: '',
              }
            }}
            localization={{
              variables: {
                sign_up: {
                  additional_data_label: {
                    full_name: 'Your Full Name'
                  },
                  additional_data_placeholder: {
                    full_name: 'Enter your full name'
                  }
                }
              }
            }}
          />
          <div className="mt-4 text-center text-sm">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {/* ... (your marketing section) ... */}
      </div>
    </div>
  );
}
