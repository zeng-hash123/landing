"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { validateTargetUrl } from '@/lib/security/url-validation';

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Fetching your page...');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateTargetUrl(url);
    if (!validation.isValid || !validation.normalizedUrl) {
      setError(validation.error || 'Please enter a valid URL.');
      return;
    }

    const targetUrl = validation.normalizedUrl;

    // Check if unauthenticated
    if (!user) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pixelpage_pending_url', targetUrl);
      }
      router.push(`/signup?redirect_url=audit`);
      return;
    }

    // Authenticated user audit flow
    setIsLoading(true);
    setLoadingStage('Fetching your page...');

    try {
      const sessionRes = await supabase?.auth.getSession();
      const token = sessionRes?.data.session?.access_token;

      if (!token) {
        router.push('/login');
        return;
      }

      // Step 1: Crawl
      setLoadingStage('Fetching your page & extracting content...');
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        if (analyzeData.error === 'FREE_AUDIT_USED') {
          router.push('/pricing?reason=limit_reached');
          return;
        }
        throw new Error(analyzeData.message || 'Failed to crawl website.');
      }

      // Step 2: Audit with AI CRO Engine
      setLoadingStage('Analyzing messaging & evaluating conversion elements...');
      const auditRes = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pageData: analyzeData.pageData }),
      });

      const auditData = await auditRes.json();

      if (!auditRes.ok) {
        if (auditData.error === 'FREE_AUDIT_USED') {
          router.push('/pricing?reason=limit_reached');
          return;
        }
        throw new Error(auditData.message || 'Audit analysis failed.');
      }

      setLoadingStage('Preparing your audit report...');
      router.push(`/audit/${auditData.auditId}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during the audit.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-600 mb-6">
            <span>Free AI Landing Page Audit & Regeneration</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.15] mb-6">
            Find what&apos;s hurting your landing page conversions.
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Paste your URL and PixelPage will analyze your messaging, CTA, trust signals, UX, and generate an optimized page version.
          </p>

          {/* URL Input Form */}
          <div className="max-w-xl mx-auto mb-6">
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-3.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-base shadow-sm"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-base transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
              >
                {isLoading ? 'Analyzing...' : 'Analyze My Landing Page'}
              </button>
            </form>

            {error && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 text-left">
                {error}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="max-w-md mx-auto p-4 bg-white rounded-lg border border-zinc-200 shadow-sm text-center my-6">
              <div className="inline-block w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium text-zinc-800">{loadingStage}</p>
            </div>
          )}

          <p className="text-xs text-zinc-500">100% free • No credit card required • Instant results</p>
        </section>

        {/* BEFORE & AFTER COMPARISON DEMO */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 shadow-sm text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-3">
              <span>Visual Transformation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-3">
              Before & After CRO Optimization
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl mx-auto mb-8">
              See how PixelPage analyzes conversion friction and automatically regenerates high-converting messaging and landing page sections.
            </p>
            <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm bg-zinc-50">
              <img
                src="/landing-img.png"
                alt="Before and After Landing Page Optimization Comparison"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* EXAMPLE SCORE CARD & ISSUES */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-zinc-200 p-6 sm:p-8 shadow-sm mb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Sample Audit Overview</span>
                <h3 className="text-xl font-bold text-zinc-900 mt-1">https://example-saas.com</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-extrabold text-amber-600">63<span className="text-lg text-zinc-400 font-normal">/100</span></div>
                <div className="text-sm text-zinc-600 max-w-xs leading-snug">
                  Your page communicates the product, but the value proposition and CTA are not strong enough.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-6">
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-700">Headline</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700">Critical</span>
                </div>
                <div className="text-lg font-bold text-zinc-900">45/100</div>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-700">CTA Strength</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-700">High</span>
                </div>
                <div className="text-lg font-bold text-zinc-900">58/100</div>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-zinc-700">Trust Signals</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Good</span>
                </div>
                <div className="text-lg font-bold text-zinc-900">82/100</div>
              </div>
            </div>

            {/* Example Recommendation Card */}
            <div className="p-5 rounded-lg border border-zinc-200 bg-white space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">Critical Issue</span>
                <h4 className="font-semibold text-zinc-900 text-base">Headline is outcome-passive</h4>
              </div>
              <p className="text-sm text-zinc-600"><strong className="text-zinc-800">Problem:</strong> &quot;AI tools for modern teams&quot; lacks a clear benefit or transformation.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 bg-red-50 border border-red-100 rounded text-red-900">
                  <span className="font-bold block mb-1">Current Copy</span>
                  &quot;AI tools for modern teams&quot;
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-emerald-900">
                  <span className="font-bold block mb-1">Suggested Copy</span>
                  &quot;Automate 10+ hours of repetitive work every week&quot;
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-STEP EXPLANATION */}
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-zinc-200">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              How PixelPage Works
            </h2>
            <p className="text-zinc-600 mt-2">Get a comprehensive landing page audit & section regeneration in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl border border-zinc-200 text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-zinc-900 text-lg mb-2">Paste Your URL</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Enter any public landing page URL. PixelPage securely extracts the page structure and copy.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-zinc-200 text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-zinc-900 text-lg mb-2">AI CRO Analysis</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                PixelPage AI acts as your expert CRO consultant, evaluating messaging, CTAs, structure, and UX.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl border border-zinc-200 text-center">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-zinc-900 text-lg mb-2">Regenerate & Export</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Apply selected fixes, customize brand tone & style, and download complete HTML exports.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING TEASER */}
        <section className="max-w-5xl mx-auto px-4 py-16 border-t border-zinc-200">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="text-zinc-600 mt-2">Start with 1 free audit lifetime</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FREE PLAN */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                  Free
                </span>
                <div className="text-3xl font-extrabold text-zinc-900 mt-3">$0</div>
                <p className="text-xs text-zinc-500 mb-4">1 Free Audit Lifetime</p>
                <ul className="text-xs text-zinc-700 space-y-2 mb-6">
                  <li className="flex items-center gap-2">✓ 1 lifetime audit</li>
                  <li className="flex items-center gap-2">✓ Overall & category scores</li>
                  <li className="flex items-center gap-2">✓ Top 5 recommendations</li>
                  <li className="flex items-center gap-2">✓ 3 copy improvements</li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="block text-center w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-semibold transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* PRO PLAN */}
            <div className="bg-white border-2 border-zinc-900 rounded-2xl p-6 flex flex-col justify-between shadow-md relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-white bg-zinc-900 px-2.5 py-0.5 rounded-full">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">
                  Pro
                </span>
                <div className="text-3xl font-extrabold text-zinc-900 mt-3">$19<span className="text-xs font-normal text-zinc-500">/month</span></div>
                <p className="text-xs text-zinc-500 mb-4">For startups & marketers</p>
                <ul className="text-xs text-zinc-700 space-y-2 mb-6">
                  <li className="flex items-center gap-2">✓ 20 audits/month</li>
                  <li className="flex items-center gap-2">✓ Optimized page generation</li>
                  <li className="flex items-center gap-2">✓ Unlimited section rewrites</li>
                  <li className="flex items-center gap-2">✓ landing page export</li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="block text-center w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                View Pro Plan
              </Link>
            </div>

            {/* AGENCY PLAN */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                  Agency
                </span>
                <div className="text-3xl font-extrabold text-zinc-900 mt-3">$49<span className="text-xs font-normal text-zinc-500">/month</span></div>
                <p className="text-xs text-zinc-500 mb-4">For agencies & teams</p>
                <ul className="text-xs text-zinc-700 space-y-2 mb-6">
                  <li className="flex items-center gap-2">✓ 100 audits/month</li>
                  <li className="flex items-center gap-2">✓ Optimized page generation</li>
                  <li className="flex items-center gap-2">✓ Unlimited section rewrites</li>
                  <li className="flex items-center gap-2">✓ HTML export</li>
                  <li className="flex items-center gap-2">✓ White-label audit reports</li>
                </ul>
              </div>
              <Link
                href="/pricing"
                className="block text-center w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-semibold transition-colors"
              >
                View Agency Plan
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-zinc-900 text-white rounded-2xl p-10 sm:p-14">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to increase your conversion rate?
            </h2>
            <p className="text-zinc-400 text-base max-w-lg mx-auto mb-8">
              Join founders and marketers who use PixelPage to eliminate conversion friction.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-3.5 bg-white text-zinc-900 rounded-lg font-semibold hover:bg-zinc-100 transition-colors"
            >
              Run Free Audit Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
