import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      const supabase = getAdminSupabase();
      await supabase.auth.exchangeCodeForSession(code);
    } catch (err) {
      console.error('Error exchanging OAuth code:', err);
    }
  }

  // URL redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard?auto_run=true', request.url));
}
