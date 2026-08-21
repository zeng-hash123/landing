"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PaymentSuccessModal } from '@/components/PaymentSuccessModal';
import { supabase } from '@/lib/supabase';
import { validateTargetUrl } from '@/lib/security/url-validation';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Check,
  ChevronDown,
  TrendingUp,
  Target,
  FileCode2,
  Palette,
  Eye,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';

const DODO_ONE_TIME_5_URL = 'https://checkout.dodopayments.com/buy/pdt_0NlsfRGt1hxhBfPNLsoFZ?quantity=1';
const DODO_AGENCY_49_URL = 'https://checkout.dodopayments.com/buy/pdt_0Njtj6vpds8u2k9BreAhC?quantity=1';

const FAQ_ITEMS = [
  {
    q: 'How does PixelPage analyze and score landing pages?',
    a: 'PixelPage crawls your page to analyze copy hierarchy, value proposition clarity, CTA commitment friction, trust signals, and layout density using proven direct-response conversion rate optimization (CRO) heuristics.',
  },
  {
    q: 'What is included in the $5 One-Time plan?',
    a: 'The $5 One-Time plan gives you 1 full optimized landing page generation, 20 deep conversion audits, unlimited section rewrites, side-by-side visual diffs, and production-ready HTML exports with zero recurring charges.',
  },
  {
    q: 'What does the $49 Agency plan include?',
    a: 'The $49 Agency plan includes 100 optimized landing page generations, 100 audits per month, multi-brand kit presets, white-label client reports, and full HTML/CSS exports.',
  },
  {
    q: 'Can I export and use the code on WordPress, Webflow, or Shopify?',
    a: 'Yes! PixelPage exports clean, modern, standalone HTML and responsive CSS/Tailwind code with zero framework lock-in. You can paste it into any website builder, CMS, or codebase.',
  },
  {
    q: 'How does Dodo Payments checkout work?',
    a: 'Checkout is processed securely via Dodo Payments. Once payment succeeds, your account is instantly upgraded and generation credits are activated immediately.',
  },
  {
    q: 'Can I preserve my existing tracking scripts and brand styles?',
    a: 'Yes. PixelPage preserves all existing analytics tags, Meta Pixel, and Google Analytics snippets while allowing you to enforce primary brand colors, fonts, and tone.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Fetching your page...');
  const [user, setUser] = useState<any>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      <PaymentSuccessModal />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="max-w-5xl mx-auto px-4 pt-16 sm:pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Landing Page CRO Audit & Regeneration Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.12] mb-6">
            Find what&apos;s hurting your conversions. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent">
              Regenerate an optimized version in seconds.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            PixelPage scans your landing page copy, value proposition, CTAs, and trust proof — pinpointing exact friction points and generating high-converting HTML section replacements.
          </p>

          {/* URL Input Form */}
          <div className="max-w-xl mx-auto mb-4">
            <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-3.5 rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-sm shadow-sm"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition-all shadow-md whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>{isLoading ? 'Analyzing...' : 'Analyze Landing Page'}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {error && (
              <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                {error}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="max-w-md mx-auto p-4 bg-white rounded-xl border border-zinc-200 shadow-sm text-center my-6">
              <div className="inline-block w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium text-zinc-800">{loadingStage}</p>
            </div>
          )}

          <p className="text-xs text-zinc-500 flex items-center justify-center gap-2 flex-wrap">
            <span>⚡ 100% Free Lifetime Audit</span>
            <span>•</span>
            <span>🔒 No credit card required</span>
            <span>•</span>
            <span>⏱️ Instant 2.4s analysis</span>
          </p>
        </section>

        {/* METRICS & PROOF BAR */}
        <section className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <div className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">+38%</div>
              <div className="text-xs font-medium text-zinc-500 mt-1">Avg. Conversion Lift</div>
            </div>
            <div className="text-center p-2 border-l border-zinc-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">2.4s</div>
              <div className="text-xs font-medium text-zinc-500 mt-1">Deep CRO Scan Speed</div>
            </div>
            <div className="text-center p-2 border-t md:border-t-0 md:border-l border-zinc-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">150+</div>
              <div className="text-xs font-medium text-zinc-500 mt-1">Agencies & Startups</div>
            </div>
            <div className="text-center p-2 border-t md:border-t-0 md:border-l border-zinc-100">
              <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">0 Lock-In</div>
              <div className="text-xs font-medium text-zinc-500 mt-1">Pure HTML/CSS Export</div>
            </div>
          </div>
        </section>

        {/* BEFORE & AFTER COMPARISON DEMO */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-3">
              <Eye className="w-3.5 h-3.5 text-zinc-600" />
              <span>Visual Transformation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-2">
              Before & After CRO Optimization
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl mx-auto mb-6">
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

        {/* 6-PILLAR CRO OPTIMIZATION MATRIX */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-3">
              <Layers className="w-3.5 h-3.5 text-zinc-600" />
              <span>Complete CRO Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              6 Core Pillars Analyzed on Every Page
            </h2>
            <p className="text-sm text-zinc-600 max-w-lg mx-auto mt-2">
              Every audit rigorously grades your landing page across direct-response principles to maximize visitor-to-customer conversion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-1.5">Headline & Hook Clarity</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Evaluates your 5-second test score. Replaces passive, feature-first headlines with clear transformation-driven hooks.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 font-bold">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-1.5">Call-to-Action Friction</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Identifies high-friction button wording. Rewrites CTAs with low-anxiety, value-focused microcopy and optimal placement.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 font-bold">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-1.5">Social Proof & Trust Scoring</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Audits testimonial positioning, trust badges, customer outcome metrics, and risk-reversal guarantees near decision points.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 font-bold">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-1.5">First-Fold Scanability</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Analyzes visual layout weight, subheadline pacing, bullet readability, and visual focus distribution.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 font-bold">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-1.5">Brand Kit Alignment</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Enforces your brand voice, primary hex colors, Google Fonts, and banned word filters during section regeneration.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm hover:border-zinc-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 mb-4 font-bold">
                <FileCode2 className="w-5 h-5 text-zinc-900" />
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-1.5">Instant HTML/CSS Export</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Download pure, responsive HTML/Tailwind code with 1 click. Copy directly into Webflow, WordPress, Next.js, or Shopify.
              </p>
            </div>
          </div>
        </section>

        {/* SIDE-BY-SIDE COPY TRANSFORMATION COMPARISON TABLE */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Copy Transformation Matrix</span>
              <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">Real Optimization Examples</h3>
              <p className="text-xs text-zinc-500 mt-1">How PixelPage transforms passive messaging into high-converting copy</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="py-3 px-4 font-semibold text-zinc-700">Section Element</th>
                    <th className="py-3 px-4 font-semibold text-red-700 bg-red-50/50">Original Copy (High Friction)</th>
                    <th className="py-3 px-4 font-semibold text-emerald-700 bg-emerald-50/50">PixelPage Optimized (High Conversion)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">Hero Headline</td>
                    <td className="py-3.5 px-4 text-zinc-600 bg-red-50/20">&quot;AI tools for modern teams&quot;</td>
                    <td className="py-3.5 px-4 text-zinc-900 font-medium bg-emerald-50/20">&quot;Automate 10+ hours of repetitive client work every week&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">Primary CTA</td>
                    <td className="py-3.5 px-4 text-zinc-600 bg-red-50/20">&quot;Submit Registration&quot;</td>
                    <td className="py-3.5 px-4 text-zinc-900 font-medium bg-emerald-50/20">&quot;Claim Your Free 1-Minute Audit → (No CC Required)&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">Value Proposition</td>
                    <td className="py-3.5 px-4 text-zinc-600 bg-red-50/20">&quot;We have many analytics charts and graphs.&quot;</td>
                    <td className="py-3.5 px-4 text-zinc-900 font-medium bg-emerald-50/20">&quot;Pinpoint exactly where 80% of your ad traffic drops off.&quot;</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">Social Proof Subheading</td>
                    <td className="py-3.5 px-4 text-zinc-600 bg-red-50/20">&quot;Trusted by clients everywhere.&quot;</td>
                    <td className="py-3.5 px-4 text-zinc-900 font-medium bg-emerald-50/20">&quot;Trusted by 150+ growth marketers managing $2M+ in monthly ad spend.&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3-STEP EXPLANATION */}
        <section className="max-w-5xl mx-auto px-4 py-12 border-t border-zinc-200">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              How PixelPage Works
            </h2>
            <p className="text-zinc-600 text-sm mt-1.5">Go from URL to production-ready optimized page in 3 steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-zinc-200 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-sm">
                1
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-2">Paste Your Landing Page URL</h3>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Enter your live website URL. PixelPage extracts page structure, copy hierarchy, CTAs, and visual layout.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-zinc-200 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-sm">
                2
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-2">Get Actionable CRO Friction Scores</h3>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Receive prioritized severity ratings, exact copy problems, and direct-response suggested copy replacements.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-zinc-200 text-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center mx-auto mb-4 text-sm shadow-sm">
                3
              </div>
              <h3 className="font-bold text-zinc-900 text-base mb-2">Regenerate, Diff & Export</h3>
              <p className="text-zinc-600 text-xs leading-relaxed">
                Select your fixes, adjust brand tone & colors, view side-by-side section diffs, and download complete HTML.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="max-w-5xl mx-auto px-4 py-16 border-t border-zinc-200">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Start with 1 Free Audit Lifetime
            </h2>
            <p className="text-zinc-600 text-sm mt-1.5">Upgrade for optimized generation & HTML export</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* FREE PLAN */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-zinc-300 transition-colors">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                  Free
                </span>
                <div className="text-3xl font-extrabold text-zinc-900 mt-4">$0</div>
                <p className="text-xs text-zinc-500 mb-4 mt-1">1 Free Audit Lifetime</p>
                <ul className="text-xs text-zinc-700 space-y-2.5 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>1 lifetime landing page audit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Overall & category scores</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Top 5 friction recommendations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>3 copy improvement suggestions</span>
                  </li>
                  <li className="flex items-center gap-2 text-zinc-400">
                    <span className="text-zinc-300 font-bold ml-0.5 mr-0.5">✕</span>
                    <span>No optimized page generation</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="block text-center w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* $5 ONE-TIME PRO PLAN */}
            <div className="bg-white border-2 border-zinc-900 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative scale-[1.02]">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider text-white bg-zinc-900 px-3 py-0.5 rounded-full shadow-sm">
                Most Popular • One-Time
              </span>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full">
                    One-Time
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    No recurring fees
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-zinc-900 mt-4">
                  $5 <span className="text-xs font-normal text-zinc-500 uppercase">one-time</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4 mt-1">Instant conversion lift for founders & creators</p>
                <ul className="text-xs text-zinc-700 space-y-2.5 mb-6">
                  <li className="flex items-center gap-2 font-semibold text-zinc-900 bg-zinc-50 p-1.5 rounded-lg border border-zinc-200/70">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>1 optimized landing page generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>20 deep audits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited section rewrites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Side-by-side visual diffs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Clean HTML/CSS export</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handlePaidCheckout(DODO_ONE_TIME_5_URL)}
                className="flex items-center justify-center gap-1.5 w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Get $5 One-Time Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* $49 AGENCY PLAN */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-zinc-300 transition-colors">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full">
                  Agency
                </span>
                <div className="text-3xl font-extrabold text-zinc-900 mt-4">
                  $49 <span className="text-xs font-normal text-zinc-500">/ month</span>
                </div>
                <p className="text-xs text-zinc-500 mb-4 mt-1">For marketing agencies & freelance CRO pros</p>
                <ul className="text-xs text-zinc-700 space-y-2.5 mb-6">
                  <li className="flex items-center gap-2 font-semibold text-zinc-900 bg-zinc-50 p-1.5 rounded-lg border border-zinc-200/70">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>100 optimized landing page generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100 audits / month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Unlimited section rewrites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Brand Kit tone & style presets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>White-label client audit reports</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handlePaidCheckout(DODO_AGENCY_49_URL)}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <span>Upgrade to Agency ($49)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <section className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-200">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-700 mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-600 mt-1">Everything you need to know about PixelPage audits and generation.</p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-zinc-200 rounded-xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-zinc-900 text-sm hover:bg-zinc-50/70 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform shrink-0 ${
                      openFaq === idx ? 'rotate-180 text-zinc-900' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL HIGH-CONVERTING CTA */}
        <section className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-zinc-900 text-white rounded-3xl p-10 sm:p-14 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-zinc-700/20 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Ready to eliminate conversion friction?
            </h2>
            <p className="text-zinc-400 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
              Join founders, growth marketers, and agencies optimizing their pages in seconds.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-3.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl font-semibold text-sm transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
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
