import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-white text-xs font-bold">
            P
          </div>
          <span className="font-semibold text-zinc-900">PixelPage</span>
          <span>© {new Date().getFullYear()} PixelPage. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-zinc-900 transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-zinc-900 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="hover:text-zinc-900 transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}
