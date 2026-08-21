"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, LogOut, LayoutDashboard, Sparkles, ChevronDown } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  const handleSignOut = async () => {
    setProfileOpen(false);
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pixelpage_authenticated');
      localStorage.removeItem('pixelpage_user_email');
    }
    router.push('/login');
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-base shadow-sm">
            P
          </div>
          <span className="font-semibold text-zinc-900 text-lg tracking-tight">PixelPage</span>
        </Link>

        <nav className="flex items-center gap-5 sm:gap-6 text-sm font-medium text-zinc-600">
          <Link href="/pricing" className="hover:text-zinc-900 transition-colors">
            Pricing
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Dashboard
              </Link>

              {/* Profile Icon Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-zinc-200 transition-all focus:outline-none"
                  aria-label="User Profile Menu"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {userInitial}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2.5 border-b border-zinc-100">
                      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-semibold text-zinc-900 truncate mt-0.5" title={user.email}>
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/pricing"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Upgrade / Plans</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-zinc-100">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="hover:text-zinc-900 transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-zinc-800 transition-colors font-medium text-xs shadow-sm"
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
