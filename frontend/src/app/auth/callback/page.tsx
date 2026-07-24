"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          localStorage.setItem('promtpage_authenticated', 'true');
          if (session.user.email) {
            localStorage.setItem('promtpage_user_email', session.user.email);
          }
        }
      } else {
        localStorage.setItem('promtpage_authenticated', 'true');
      }
      router.push('/chat');
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white flex flex-col items-center justify-center font-sans">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-500 border-t-transparent"></div>
        <span className="text-sm font-semibold text-gray-300">Completing sign in...</span>
      </div>
    </div>
  );
}
