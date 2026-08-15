"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RegenerateTab } from '@/components/audit/RegenerateTab';
import { supabase } from '@/lib/supabase';
import { AuditRecord, CategoryResult, Severity } from '@/types/audit';

export default function AuditResultPage() {
  const params = useParams();
  const id = params?.id as string;

  const [auditRecord, setAuditRecord] = useState<AuditRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'regenerate'>('audit');

  useEffect(() => {
    let isMounted = true;

    async function fetchAudit() {
      if (!id) return;

      try {
        const headers: Record<string, string> = {};

        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
          }
        }

        const res = await fetch(`/api/audit/${id}`, { headers });
        const json = await res.json();

        if (isMounted) {
          if (res.ok && json.success && json.auditRecord) {
            setAuditRecord(json.auditRecord as AuditRecord);
            setErrorMessage(null);
          } else {
            setErrorMessage(json.message || 'Audit report not found.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Audit report loading error:', err);
          setErrorMessage(err.message || 'Failed to load audit report.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchAudit();

    // Subscribe to auth state change if session restores asynchronously
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token && isMounted && !auditRecord) {
          fetchAudit();
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!auditRecord) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fafafa]">
        <Navbar />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Audit Report Not Found</h1>
          <p className="text-zinc-500 mb-6">
            {errorMessage || 'The requested CRO audit report could not be found or you may not have access to view it.'}
          </p>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-zinc-900 text-white rounded-lg font-medium text-sm hover:bg-zinc-800"
          >
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const audit = auditRecord.audit_json;
  const screenshotUrl = auditRecord.page_data_json?.screenshotUrl;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        {/* HEADER / OVERVIEW */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-zinc-100 text-xs font-semibold text-zinc-600 mb-2">
                PixelPage Multimodal CRO Audit Report
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 break-all">
                {auditRecord.url}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Audited on {new Date(auditRecord.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div className="text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">Overall Score</span>
                <span className={`text-4xl font-extrabold ${getScoreColor(audit.overall_score)}`}>
                  {audit.overall_score}
                </span>
                <span className="text-zinc-400 text-sm font-normal">/100</span>
              </div>
            </div>
          </div>

          {/* SCREENSHOT PREVIEW IF AVAILABLE */}
          {screenshotUrl && (
            <div className="pt-6 border-b border-zinc-100 pb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                Captured Landing Page Screenshot (Visual Reference)
              </h3>
              <div className="rounded-lg overflow-hidden border border-zinc-200 max-h-64 bg-zinc-50">
                <img
                  src={screenshotUrl}
                  alt={`Screenshot of ${auditRecord.url}`}
                  className="w-full object-cover object-top max-h-64"
                />
              </div>
            </div>
          )}

          <div className="pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Audit Summary</h3>
            <p className="text-base text-zinc-700 leading-relaxed italic">
              &quot;{audit.summary}&quot;
            </p>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-zinc-200 mb-8">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
              activeTab === 'audit'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            CRO Audit & Recommendations
          </button>
          <button
            onClick={() => setActiveTab('regenerate')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === 'regenerate'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Page Optimizer & HTML Export</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded font-sans">Option B</span>
          </button>
        </div>

        {/* TAB 1: CRO AUDIT CONTENT */}
        {activeTab === 'audit' && (
          <div className="space-y-12">
            {/* CATEGORY BREAKDOWN CARDS */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Category Scores</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {audit.categories.map((cat: CategoryResult, idx: number) => (
                  <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-zinc-900">{cat.name}</span>
                      <SeverityBadge severity={cat.severity} />
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className={`text-2xl font-bold ${getScoreColor(cat.score)}`}>{cat.score}</span>
                      <span className="text-xs text-zinc-400">/100</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className={`h-full ${getScoreBg(cat.score)}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-600 line-clamp-2">{cat.problem}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* TOP PRIORITIES */}
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Top 5 Recommendations</h2>

              <div className="space-y-6">
                {audit.categories.slice(0, 5).map((item: CategoryResult, idx: number) => (
                  <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-zinc-900 text-lg">{item.name} Optimization</h3>
                      </div>
                      <SeverityBadge severity={item.severity} />
                    </div>

                    <div className="space-y-2 text-sm text-zinc-700">
                      <p>
                        <strong className="text-zinc-900 font-semibold">Problem: </strong>
                        {item.problem}
                      </p>
                      <p>
                        <strong className="text-zinc-900 font-semibold">Why It Matters: </strong>
                        {item.why_it_matters}
                      </p>
                      <p>
                        <strong className="text-zinc-900 font-semibold">Recommendation: </strong>
                        {item.recommendation}
                      </p>
                    </div>

                    {(item.current_copy || item.suggested_copy) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {item.current_copy && (
                          <div className="p-4 bg-red-50/60 border border-red-200/60 rounded-lg text-xs">
                            <span className="font-bold text-red-900 block mb-1.5 uppercase tracking-wider">Current Copy</span>
                            <p className="text-red-950 font-mono leading-relaxed">{item.current_copy}</p>
                          </div>
                        )}

                        {item.suggested_copy && (
                          <div className="p-4 bg-emerald-50/60 border border-emerald-200/60 rounded-lg text-xs flex flex-col justify-between gap-3">
                            <div>
                              <span className="font-bold text-emerald-900 block mb-1.5 uppercase tracking-wider">Suggested Copy</span>
                              <p className="text-emerald-950 font-mono leading-relaxed">{item.suggested_copy}</p>
                            </div>
                            <button
                              onClick={() => handleCopy(item.suggested_copy!, idx)}
                              className="self-start px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
                            >
                              {copiedIndex === idx ? '✓ Copied!' : 'Copy Suggested Copy'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PAYWALL BANNER TEASER */}
            <div className="bg-zinc-900 text-white rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold mb-2">Want to generate optimized pages & HTML exports?</h3>
              <p className="text-zinc-400 text-sm max-w-lg mx-auto mb-6">
                Upgrade to Pro for unlimited copy rewrites, monthly audits, and HTML exports.
              </p>
              <button
                onClick={() => setActiveTab('regenerate')}
                className="inline-block px-6 py-3 bg-white text-zinc-900 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-colors"
              >
                Switch to Page Optimizer
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PAGE REGENERATION & OPTIMIZER */}
        {activeTab === 'regenerate' && (
          <RegenerateTab auditRecord={auditRecord} />
        )}
      </main>

      <Footer />
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-amber-100 text-amber-800 border-amber-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles[severity] || styles.low} capitalize`}>
      {severity}
    </span>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}
