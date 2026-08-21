"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabase';
import { validateTargetUrl } from '@/lib/security/url-validation';
import { AuditRecord } from '@/types/audit';

export const dynamic = 'force-dynamic';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ free_audit_used: boolean } | null>(null);
  const [previousAudit, setPreviousAudit] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [url, setUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('free_audit_used')
        .eq('id', currentUser.id)
        .single();

      setProfile(profileData || { free_audit_used: false });

      const { data: auditData } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (auditData) {
        setPreviousAudit(auditData as AuditRecord);
      }

      setLoading(false);

      if (typeof window !== 'undefined') {
        const pendingPayment = sessionStorage.getItem('pixelpage_pending_payment');
        if (pendingPayment && currentUser?.email) {
          sessionStorage.removeItem('pixelpage_pending_payment');
          window.location.href = `${pendingPayment}&email=${encodeURIComponent(currentUser.email)}`;
          return;
        }

        const pendingUrl = sessionStorage.getItem('pixelpage_pending_url');
        if (pendingUrl && (!profileData || !profileData.free_audit_used)) {
          setUrl(pendingUrl);
          sessionStorage.removeItem('pixelpage_pending_url');
          runAudit(pendingUrl, currentUser);
        }
      }
    }

    loadDashboardData();
  }, [router]);

  const runAudit = async (targetUrl: string, currentUser?: any) => {
    setError(null);
    setIsAuditing(true);

    const validation = validateTargetUrl(targetUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      setError(validation.error || 'Please enter a valid URL.');
      setIsAuditing(false);
      return;
    }

    try {
      const sessionRes = await supabase?.auth.getSession();
      const token = sessionRes?.data.session?.access_token;

      if (!token) {
        router.push('/login');
        return;
      }

      setStage('Fetching your page & extracting content...');
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: validation.normalizedUrl }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok) {
        if (analyzeData.error === 'FREE_AUDIT_USED') {
          router.push('/pricing?reason=limit_reached');
          return;
        }
        throw new Error(analyzeData.message || 'Page crawl failed.');
      }

      setStage('Analyzing messaging & evaluating conversion elements...');
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
        throw new Error(auditData.message || 'Audit execution failed.');
      }

      setStage('Preparing report...');
      router.push(`/audit/${auditData.auditId}`);
    } catch (err: any) {
      setError(err.message || 'Audit failed. Please try again.');
      setIsAuditing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      runAudit(url, user);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const freeAuditUsed = profile?.free_audit_used || false;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-12">
      {/* WELCOME BANNER */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              Welcome, {user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage your landing page audits and conversion insights.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700 self-start sm:self-auto">
            <span>Status:</span>
            {freeAuditUsed ? (
              <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Free Audit Used</span>
            ) : (
              <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">1 Free Audit Available</span>
            )}
          </div>
        </div>
      </div>

      {/* AUDIT RUNNER / PAYWALL CARD */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 mb-10 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-2">Run Landing Page Audit</h2>

        {freeAuditUsed ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-center">
            <h3 className="font-bold text-amber-900 text-base mb-1">You&apos;ve used your free audit</h3>
            <p className="text-sm text-amber-700 mb-4 max-w-md mx-auto">
              Upgrade to Pro or Agency to unlock unlimited audits and full landing page optimizations.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-2.5 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Unlock More Audits
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-sm text-zinc-600 mb-4">
              Enter your website URL below to run your 1 free lifetime audit.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isAuditing}
                className="flex-1 px-4 py-3 rounded-lg border border-zinc-300 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <button
                type="submit"
                disabled={isAuditing}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {isAuditing ? 'Analyzing...' : 'Run Your Free Audit'}
              </button>
            </form>

            {error && (
              <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            {isAuditing && (
              <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-center">
                <div className="inline-block w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-xs font-medium text-zinc-700">{stage}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PREVIOUS AUDIT SECTION */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Previous Audit</h2>

        {previousAudit ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-400 font-medium">
                {new Date(previousAudit.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <h3 className="text-base font-bold text-zinc-900 mt-1">{previousAudit.url}</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-lg line-clamp-2">
                {previousAudit.summary}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-zinc-400 block font-medium uppercase">Score</span>
                <span className="text-2xl font-bold text-zinc-900">{previousAudit.overall_score}/100</span>
              </div>
              <Link
                href={`/audit/${previousAudit.id}`}
                className="px-4 py-2 border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                View Audit Report
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center text-zinc-500 text-sm">
            No previous audit found. Enter a URL above to generate your audit.
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div></div>}>
          <DashboardContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
