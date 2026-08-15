"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <span className="font-semibold text-zinc-900 text-lg tracking-tight">PixelPage</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600">
          <Link href="/pricing" className="hover:text-zinc-900 transition-colors">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-zinc-900 transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors font-medium"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
