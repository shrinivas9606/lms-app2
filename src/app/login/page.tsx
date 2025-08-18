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
    // THE FIX: Corrected the template literal syntax on this line
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
            view="sign_up"
            fields={{
              sign_up: {
                additionalFields: [
                  {
                    type: 'text',
                    name: 'full_name',
                    label: 'Your Full Name',
                    placeholder: 'Enter your full name',
                    required: true,
                  },
                ],
              },
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
        <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-12 text-white">
            <div className="text-center">
                <h2 className="text-4xl font-bold tracking-tighter">Unlock Your Potential</h2>
                <p className="mt-4 max-w-md text-gray-300">
                    Join thousands of learners and take your skills to the next level with our expert-led live courses.
                </p>
            </div>
            <div className="mt-8 w-full max-w-md rounded-lg border bg-white/5 p-6 backdrop-blur-sm">
                <p className="italic text-gray-200">
                    "This platform transformed my career. The live interaction is a game-changer compared to pre-recorded videos."
                </p>
                <p className="mt-4 font-semibold text-right">- Alex Johnson, Senior Developer</p>
            </div>
        </div>
      </div>
    </div>
  );
}
