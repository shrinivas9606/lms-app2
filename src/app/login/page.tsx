// src/app/login/page.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard');
        router.refresh(); // Important to refresh server components
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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            redirectTo={getURL()}
            theme="default"
            onlyThirdPartyProviders={false} // Set to true to only show Google, etc.
          />
        </div>
      </div>
      <div className="hidden bg-gray-100 lg:block dark:bg-gray-800">
        {/* You can place an image here */}
        <img
          src="https://placehold.co/1080x1920/e2e8f0/4a5568?text=Your\nLMS"
          alt="LMS placeholder image"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
