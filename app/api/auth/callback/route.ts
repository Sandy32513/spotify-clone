import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/auth/login?error=${error.message}`);
    }

    // Redirect to home page
    return NextResponse.redirect(`${origin}/`);
  }

  // Return the user if there's already a session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.redirect(`${origin}/`);
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
