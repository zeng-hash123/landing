"use client";

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PaymentSuccessModal } from '@/components/PaymentSuccessModal';
import { supabase } from '@/lib/supabase';
import { Check, Zap, Sparkles, Shield, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const DODO_ONE_TIME_5_URL = 'https://checkout.dodopayments.com/buy/pdt_0NlsfRGt1hxhBfPNLsoFZ?quantity=1';
const DODO_AGENCY_49_URL = 'https://checkout.dodopayments.com/buy/pdt_0Njtj6vpds8u2k9BreAhC?quantity=1';

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handlePaidCheckout = (checkoutUrl: string) => {
    if (user && user.email) {
      window.location.href = `${checkoutUrl}&email=${encodeURIComponent(user.email)}`;
    } else {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pixelpage_pending_payment', checkoutUrl);
      }
      router.push(`/login?redirect_url=${encodeURIComponent(checkoutUrl)}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-16">
      {/* Payment Success Celebratory Modal */}
      <PaymentSuccessModal />

      {reason === 'limit_reached' && (
        <div className="mb-10 max-w-xl mx-auto p-4 bg-amber-50 border border-amber-200 rounded-xl text-center shadow-sm">
          <h2 className="font-bold text-amber-900 text-base">You&apos;ve used your free audit</h2>
          <p className="text-xs text-amber-700 mt-1">
            Every free account includes 1 lifetime audit. Upgrade below to generate optimized landing pages and unlock unlimited rewrites.
          </p>
        </div>
      )}

      <div className="text-center mb-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-zinc-900 tracking-tight">
          Turn audit findings into high-converting pages.
        </h1>
        <p className="text-base text-zinc-600 mt-3">
          Get actionable CRO friction scores, AI section rewrites, and instant HTML export with no subscription lock-in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* FREE PLAN */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-7 flex flex-col justify-between shadow-sm hover:border-zinc-300 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                Free
              </span>
            </div>
            <div className="text-4xl font-extrabold text-zinc-900 mt-4">$0</div>
            <p className="text-xs text-zinc-500 mb-6 mt-1">1 Free Lifetime Audit</p>

            <ul className="text-xs text-zinc-700 space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1 lifetime landing page audit</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Overall conversion score & breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Top 5 friction recommendations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3 copy improvement suggestions</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <span className="text-zinc-300 font-bold ml-0.5 mr-0.5">✕</span>
                <span>No optimized page generation</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-400">
                <span className="text-zinc-300 font-bold ml-0.5 mr-0.5">✕</span>
                <span>No HTML export</span>
              </li>
            </ul>
          </div>

          <Link
            href="/signup"
            className="block text-center w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold transition-colors"
          >
            Get Started Free
          </Link>
        </div>

        {/* $5 ONE-TIME STARTER PLAN */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-7 flex flex-col justify-between shadow-sm hover:border-zinc-300 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">
                One-Time Access
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                No monthly charge
              </span>
            </div>

            <div className="text-4xl font-extrabold text-zinc-900 mt-4">
              $5 <span className="text-xs font-medium text-zinc-500 uppercase">one-time</span>
            </div>
            <p className="text-xs text-zinc-500 mb-6 mt-1">For founders & creators looking for instant CRO lift</p>

            <ul className="text-xs text-zinc-700 space-y-3 mb-8">
              <li className="flex items-center gap-2 font-semibold text-zinc-900 bg-zinc-50 p-2 rounded-lg border border-zinc-200/80">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>1 optimized landing page generation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>20 in-depth audits</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited section rewrites & copy fixes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Side-by-side visual diff comparison</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Clean production HTML export</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handlePaidCheckout(DODO_ONE_TIME_5_URL)}
            className="flex items-center justify-center gap-1.5 w-full py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>Get $5 One-Time Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* $49 AGENCY PLAN */}
        <div className="bg-white border-2 border-zinc-900 rounded-2xl p-7 flex flex-col justify-between shadow-xl relative scale-[1.02]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wider text-white bg-zinc-900 px-3 py-1 rounded-full shadow-sm">
            Most Popular
          </span>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                Agency / Pro
              </span>
            </div>

            <div className="text-4xl font-extrabold text-zinc-900 mt-4">
              $49 <span className="text-xs font-medium text-zinc-500 uppercase">/ month</span>
            </div>
            <p className="text-xs text-zinc-500 mb-6 mt-1">For growth teams, freelancers & marketing agencies</p>

            <ul className="text-xs text-zinc-700 space-y-3 mb-8">
              <li className="flex items-center gap-2 font-semibold text-zinc-900 bg-zinc-50 p-2 rounded-lg border border-zinc-200/80">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>100 optimized landing page generation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100 audits / month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited section rewrites & variants</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Multi-brand Kit tone & style presets</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full HTML export & white-label reports</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handlePaidCheckout(DODO_AGENCY_49_URL)}
            className="flex items-center justify-center gap-1.5 w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <span>Upgrade to Agency ($49)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="mt-16 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-4 text-xs text-zinc-600">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-zinc-900" />
          <span>Secure checkout via Dodo Payments</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Instant generation credit activation</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>No framework lock-in (Export Pure HTML/CSS)</span>
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
