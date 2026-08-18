"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const dynamic = 'force-dynamic';

function PricingContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-16">
      {reason === 'limit_reached' && (
        <div className="mb-10 max-w-xl mx-auto p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <h2 className="font-bold text-amber-900 text-base">You&apos;ve used your free audit</h2>
          <p className="text-xs text-amber-700 mt-1">
            Every free account includes 1 lifetime audit. Upgrade below to unlock additional audits and features.
          </p>
        </div>
      )}

      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-base text-zinc-600 mt-2">
          Choose the plan that fits your growth needs. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FREE PLAN */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
              Free
            </span>
            <div className="text-4xl font-extrabold text-zinc-900 mt-4">$0</div>
            <p className="text-xs text-zinc-500 mb-6">1 Free Audit Lifetime</p>

            <ul className="text-xs text-zinc-700 space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> 1 lifetime audit
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Overall score
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Category scores
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Top 5 recommendations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> 3 copy improvements
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <span className="text-zinc-300 font-bold">✕</span> No optimized page
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <span className="text-zinc-300 font-bold">✕</span> No HTML export
              </li>
            </ul>
          </div>

          <Link
            href="/signup"
            className="block text-center w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-semibold transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* PRO PLAN */}
        <div className="bg-white border-2 border-zinc-900 rounded-2xl p-8 flex flex-col justify-between shadow-md relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-wider text-white bg-zinc-900 px-3 py-1 rounded-full">
            Most Popular
          </span>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">
              Pro
            </span>
            <div className="text-4xl font-extrabold text-zinc-900 mt-4">
              $19<span className="text-sm font-normal text-zinc-500">/month</span>
            </div>
            <p className="text-xs text-zinc-500 mb-6">For indie hackers & growing startups</p>

            <ul className="text-xs text-zinc-700 space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> 20 audits/month
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Optimized landing-page generation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Unlimited section rewrites
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> landing page export
              </li>
            </ul>
          </div>

          <button
            onClick={() => alert('Select a plan to start your 7-day Pro trial.')}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* AGENCY PLAN */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
              Agency
            </span>
            <div className="text-4xl font-extrabold text-zinc-900 mt-4">
              $49<span className="text-sm font-normal text-zinc-500">/month</span>
            </div>
            <p className="text-xs text-zinc-500 mb-6">For CRO agencies & freelancers</p>

            <ul className="text-xs text-zinc-700 space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> 100 audits/month
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Optimized landing-page generation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Unlimited section rewrites
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> HTML export
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> White-label audit reports
              </li>
            </ul>
          </div>

          <button
            onClick={() => alert('Contact team or select Agency plan.')}
            className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-sm font-semibold transition-colors"
          >
            Upgrade to Agency
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div></div>}>
          <PricingContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
