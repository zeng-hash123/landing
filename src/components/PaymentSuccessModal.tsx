"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, X, ArrowRight } from 'lucide-react';

function PaymentSuccessModalInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!searchParams) return;
    const isPaymentSuccess =
      searchParams.get('payment') === 'success' ||
      searchParams.get('status') === 'succeeded' ||
      searchParams.get('status') === 'success' ||
      searchParams.get('success') === 'true' ||
      Boolean(searchParams.get('payment_id'));

    if (isPaymentSuccess) {
      setIsOpen(true);
      // Mark local storage premium flag for instant client UI responsiveness
      if (typeof window !== 'undefined') {
        const email = localStorage.getItem('pixelpage_user_email');
        if (email) {
          localStorage.setItem(`pixelpage_pro_${email.toLowerCase().trim()}`, 'true');
        }
      }
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove payment query params cleanly
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('payment');
      url.searchParams.delete('status');
      url.searchParams.delete('success');
      url.searchParams.delete('payment_id');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  const handleGoDashboard = () => {
    handleClose();
    router.push('/dashboard');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200/60">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Premium Activated</span>
        </div>

        {/* Main Heading */}
        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
          Payment successful, welcome to Premium.
        </h3>

        {/* Description */}
        <p className="text-sm text-zinc-600 leading-relaxed mb-6">
          Your account has been upgraded! You now have full access to high-converting landing page generations, unlimited section rewrites, and instant HTML exports.
        </p>

        {/* Action Button */}
        <div className="space-y-2">
          <button
            onClick={handleGoDashboard}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="w-full py-2.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}

export function PaymentSuccessModal() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessModalInner />
    </Suspense>
  );
}
