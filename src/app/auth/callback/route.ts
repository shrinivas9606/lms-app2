// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    console.log('Auth Callback: Found authorization code. Attempting to exchange for session...');
    const cookieStore = cookies();
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      console.log('Auth Callback: Session exchanged successfully. Redirecting to dashboard.');
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    // Log the specific error if the exchange fails
    console.error('Auth Callback Error:', error.message);
  } else {
    console.error('Auth Callback Error: No authorization code found in URL.');
  }

  // If we reach here, something went wrong. Redirect to an error page.
  return NextResponse.redirect(`${origin}/login?error=Authentication failed. Please try again.`);
}