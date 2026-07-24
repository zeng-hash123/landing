"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      if (supabase) {
        try {
          supabase.auth.onAuthStateChange((event, session) => {
            if (session && session.user && mounted) {
              localStorage.setItem('pixelpage_authenticated', 'true');
              if (session.user.email) {
                localStorage.setItem('pixelpage_user_email', session.user.email);
              }
              window.location.href = '/chat';
            }
          });

          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user && mounted) {
            localStorage.setItem('pixelpage_authenticated', 'true');
            if (session.user.email) {
              localStorage.setItem('pixelpage_user_email', session.user.email);
            }
            window.location.href = '/chat';
            return;
          }
        } catch (e) {
          console.error("Auth callback error:", e);
        }
      }

      // Fallback redirect after 1.2s to give session sync time
      setTimeout(() => {
        if (mounted) {
          localStorage.setItem('pixelpage_authenticated', 'true');
          window.location.href = '/chat';
        }
      }, 1200);
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0d0d14] text-white flex flex-col items-center justify-center font-sans">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-500 border-t-transparent"></div>
        <span className="text-sm font-semibold text-gray-300">Completing Google sign in...</span>
      </div>
    </div>
  );
}
