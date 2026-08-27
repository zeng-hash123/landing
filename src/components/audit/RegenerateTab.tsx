"use client";

import React, { useState } from 'react';
import { AuditRecord, CategoryResult } from '@/types/audit';
import { BrandConfig, RegeneratedSection, RegenerationRecord } from '@/types/regenerate';
import { supabase } from '@/lib/supabase';
import {
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Download,
  ExternalLink,
  Code2,
  Columns,
  Eye,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  FileCode,
  Globe,
  Split,
  Image as ImageIcon,
} from 'lucide-react';

interface RegenerateTabProps {
  auditRecord: AuditRecord;
}

export function RegenerateTab({ auditRecord }: RegenerateTabProps) {
  const categories: CategoryResult[] = auditRecord.audit_json.categories || [];
  const detectedLanguage = auditRecord.page_data_json?.language || 'en';
  const screenshotUrl = auditRecord.page_data_json?.screenshotUrl;

  // Suggestion selection state (default: all checked)
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>(
    categories.map((c) => c.name)
  );

  // Brand Configuration state
  const [tone, setTone] = useState<'outcome_focused' | 'conversational' | 'professional' | 'bold'>('outcome_focused');
  const [primaryColor, setPrimaryColor] = useState('#09090b');
  const [ctaStyle, setCtaStyle] = useState('rounded');
  const [bannedWords, setBannedWords] = useState('');
  const [framework, setFramework] = useState<'react_nextjs' | 'html' | 'vue'>('react_nextjs');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneration, setRegeneration] = useState<RegenerationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'compare' | 'diff' | 'code'>('preview');
  const [codeTab, setCodeTab] = useState<'react' | 'html' | 'vue'>('react');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const getLanguageName = (code: string) => {
    const map: Record<string, string> = {
      en: 'English (US/UK)',
      es: 'Spanish (Español)',
      de: 'German (Deutsch)',
      fr: 'French (Français)',
      pt: 'Portuguese (Português)',
      it: 'Italian (Italiano)',
      ja: 'Japanese (日本語)',
      zh: 'Chinese (中文)',
      ko: 'Korean (한국어)',
      ru: 'Russian (Русский)',
      hi: 'Hindi (हिन्दी)',
      ar: 'Arabic (العربية)',
    };
    return map[code.toLowerCase()] || code.toUpperCase();
  };

  const toggleSuggestion = (name: string) => {
    setSelectedSuggestions((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSuggestions.length === categories.length) {
      setSelectedSuggestions([]);
    } else {
      setSelectedSuggestions(categories.map((c) => c.name));
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const sessionRes = await supabase?.auth.getSession();
      const token = sessionRes?.data.session?.access_token;

      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      const brandConfigPayload: BrandConfig = {
        tone,
        primaryColor,
        ctaStyle,
        bannedWords: bannedWords.split(',').map((w) => w.trim()).filter(Boolean),
        framework,
      };

      const res = await fetch(`/api/pages/${auditRecord.id}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          suggestion_ids: selectedSuggestions,
          brandConfig: brandConfigPayload,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to generate optimized page.');
      }

      setRegeneration(json.regenerationRecord as RegenerationRecord);
      setViewMode('preview');
    } catch (err: any) {
      setError(err.message || 'Regeneration failed. Please try again.');
    }

    setIsGenerating(false);
  };

  const getActiveCode = () => {
    if (!regeneration) return '';
    if (codeTab === 'react') {
      return regeneration.react_tsx || regeneration.full_regenerated_html;
    }
    if (codeTab === 'vue') {
      return regeneration.vue_code || regeneration.full_regenerated_html;
    }
    return regeneration.full_regenerated_html;
  };

  const handleCopyCode = async () => {
    const code = getActiveCode();
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleExportHtml = () => {
    if (!regeneration?.full_regenerated_html) return;

    const pageUrl = auditRecord.url || auditRecord.page_data_json?.url || 'website.com';
    const blob = new Blob([regeneration.full_regenerated_html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optimized_${pageUrl.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportReactTsx = () => {
    const code = regeneration?.react_tsx || regeneration?.full_regenerated_html;
    if (!code) return;

    const pageUrl = auditRecord.url || auditRecord.page_data_json?.url || 'website.com';
    const blob = new Blob([code], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OptimizedLandingPage_${pageUrl.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_')}.tsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    if (!regeneration?.full_regenerated_html) return;
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(regeneration.full_regenerated_html);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-8">
      {/* OPTIMIZER CONTROLS CARD */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xs shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Multilingual Landing Page Generator</h2>
              <p className="text-xs text-zinc-500">
                Preserves original website design, language, colors, and layout with optimized CRO copy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-700 self-start sm:self-auto">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>Site Language: <strong className="text-zinc-900">{getLanguageName(detectedLanguage)}</strong></span>
          </div>
        </div>

        {/* 1. SUGGESTION SELECTOR */}
        <div className="mt-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Select CRO Fixes to Apply ({selectedSuggestions.length}/{categories.length})
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-zinc-600 hover:text-zinc-900 font-medium underline cursor-pointer"
            >
              {selectedSuggestions.length === categories.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat, idx) => {
              const isSelected = selectedSuggestions.includes(cat.name);
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-50 text-zinc-900 font-medium shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSuggestion(cat.name)}
                    className="mt-0.5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  />
                  <div>
                    <span className="font-bold text-zinc-900 block">{cat.name}</span>
                    <span className="text-zinc-600 line-clamp-1">{cat.recommendation}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. BRAND & FRAMEWORK CONTROLS */}
        <div className="pt-6 border-t border-zinc-100 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
            Framework & Style Customizations
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Target Framework</label>
              <select
                value={framework}
                onChange={(e: any) => setFramework(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs bg-white text-zinc-900 focus:ring-zinc-900 font-medium"
              >
                <option value="react_nextjs">React / Next.js (TSX)</option>
                <option value="html">HTML + Tailwind CSS</option>
                <option value="vue">Vue 3 / Svelte</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Tone of Voice</label>
              <select
                value={tone}
                onChange={(e: any) => setTone(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs bg-white text-zinc-900 focus:ring-zinc-900"
              >
                <option value="outcome_focused">Outcome Focused</option>
                <option value="conversational">Conversational</option>
                <option value="professional">Professional</option>
                <option value="bold">Bold & Direct</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Brand Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-300 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-zinc-300 rounded-lg text-xs bg-white text-zinc-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">CTA Button Style</label>
              <select
                value={ctaStyle}
                onChange={(e) => setCtaStyle(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs bg-white text-zinc-900 focus:ring-zinc-900"
              >
                <option value="rounded">Rounded Corners (12px)</option>
                <option value="pill">Pill Shape (Full)</option>
                <option value="sharp">Sharp Minimal (4px)</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedSuggestions.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Generating Optimized Page in {getLanguageName(detectedLanguage)}...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Generate Optimized Landing Page</span>
              </>
            )}
          </button>

          {regeneration && (
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={handleCopyCode}
                className="flex-1 sm:flex-initial px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleExportReactTsx}
                className="flex-1 sm:flex-initial px-4 py-3 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Download React (.tsx)</span>
              </button>
              <button
                onClick={handleExportHtml}
                className="flex-1 sm:flex-initial px-4 py-3 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .HTML</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* REGENERATED OUTPUT & LIVE PREVIEW CONTROLS */}
      {regeneration && (
        <div className="space-y-4">
          {/* Top Preview Toolbar */}
          <div className="bg-zinc-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Optimized Landing Page Generated</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {getLanguageName(detectedLanguage)}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  {regeneration.sections_json.length} sections redesigned matching original design & copy structure.
                </p>
              </div>
            </div>

            {/* View Mode & Viewport Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              {/* Viewport switcher (Active in Preview & Compare mode) */}
              {(viewMode === 'preview' || viewMode === 'compare') && (
                <div className="flex items-center bg-zinc-800 p-1 rounded-xl border border-zinc-700 text-xs">
                  <button
                    onClick={() => setViewport('desktop')}
                    title="Desktop View (100%)"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewport === 'desktop' ? 'bg-zinc-700 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewport('tablet')}
                    title="Tablet View (768px)"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewport === 'tablet' ? 'bg-zinc-700 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewport('mobile')}
                    title="Mobile View (375px)"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewport === 'mobile' ? 'bg-zinc-700 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* View Mode Tabs */}
              <div className="flex bg-zinc-800 p-1 rounded-xl border border-zinc-700 text-xs font-semibold">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'preview' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
                {screenshotUrl && (
                  <button
                    onClick={() => setViewMode('compare')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'compare' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Compare Original</span>
                  </button>
                )}
                <button
                  onClick={() => setViewMode('diff')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'diff' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Diff View</span>
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'code' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Framework Code</span>
                </button>
              </div>

              {/* Open in New Window */}
              <button
                onClick={handleOpenNewTab}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Open live preview in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: LIVE INTERACTIVE IFRAME PREVIEW */}
          {viewMode === 'preview' && (
            <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-3 sm:p-6 shadow-2xl flex flex-col items-center">
              {/* Browser Window Header Frame */}
              <div
                className="bg-zinc-800 border border-zinc-700 rounded-t-xl px-4 py-2.5 flex items-center justify-between transition-all duration-300 w-full"
                style={{ width: viewportWidths[viewport], maxWidth: '100%' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                </div>

                <div className="bg-zinc-900/80 px-4 py-1 rounded-md border border-zinc-700/60 text-[11px] font-mono text-zinc-300 truncate max-w-xs sm:max-w-md">
                  https://optimized.{(auditRecord.url || auditRecord.page_data_json?.url || 'website.com').replace(/https?:\/\//, '')}
                </div>

                <div className="text-[11px] font-mono text-zinc-400 hidden sm:block">
                  {viewport === 'desktop' ? '100% Desktop' : viewport === 'tablet' ? '768px Tablet' : '375px Mobile'}
                </div>
              </div>

              {/* Live Preview Iframe */}
              <div
                className="bg-white rounded-b-xl shadow-2xl transition-all duration-300 overflow-hidden border-x border-b border-zinc-700 w-full"
                style={{
                  width: viewportWidths[viewport],
                  maxWidth: '100%',
                }}
              >
                <iframe
                  srcDoc={regeneration.full_regenerated_html}
                  title="Landing Page Live Preview"
                  className="w-full h-[780px] border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          )}

          {/* VIEW MODE 2: VISUAL SIDE-BY-SIDE COMPARISON WITH ORIGINAL SCREENSHOT */}
          {viewMode === 'compare' && screenshotUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: ORIGINAL SITE SCREENSHOT */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Original URL Screenshot (Visual Reference)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">{auditRecord.url}</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-zinc-200 flex-1 bg-zinc-50 max-h-[750px] overflow-y-auto">
                  <img
                    src={screenshotUrl}
                    alt={`Screenshot of ${auditRecord.url}`}
                    className="w-full object-cover object-top"
                  />
                </div>
              </div>

              {/* RIGHT: REGENERATED PAGE LIVE IFRAME */}
              <div className="bg-white border-2 border-zinc-900 rounded-2xl p-5 shadow-md space-y-3 flex flex-col">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Optimized Regenerated Landing Page
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Design Matched + CRO Improved
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden border border-zinc-200 flex-1 bg-white h-[750px]">
                  <iframe
                    srcDoc={regeneration.full_regenerated_html}
                    title="Optimized Landing Page Live"
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: SIDE-BY-SIDE SECTION DIFF */}
          {viewMode === 'diff' && (
            <div className="space-y-6">
              {regeneration.sections_json.map((section: RegeneratedSection, idx: number) => (
                <div key={idx} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md">
                        Section: {section.type}
                      </span>
                      {section.suggestion_ids.length > 0 ? (
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md">
                          {section.suggestion_ids.length} CRO Fixes Applied
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-zinc-100 text-zinc-500 px-2.5 py-0.5 rounded-md">
                          Unchanged Passthrough
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-zinc-500 italic">
                      {section.change_summary}
                    </span>
                  </div>

                  {/* SIDE BY SIDE COLUMNS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* LEFT: ORIGINAL */}
                    <div className="border border-red-200 rounded-xl p-4 bg-red-50/30">
                      <span className="text-xs font-bold text-red-800 uppercase tracking-wider block mb-2">
                        Original Section HTML
                      </span>
                      <pre className="text-xs text-zinc-800 font-mono overflow-x-auto whitespace-pre-wrap bg-white p-3 rounded-lg border border-red-100 max-h-64">
                        {section.original_html}
                      </pre>
                    </div>

                    {/* RIGHT: REGENERATED */}
                    <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                        Regenerated Optimized HTML (Tailwind CSS)
                      </span>
                      <pre className="text-xs text-zinc-800 font-mono overflow-x-auto whitespace-pre-wrap bg-white p-3 rounded-lg border border-emerald-100 max-h-64">
                        {section.regenerated_html}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* VIEW MODE 4: FRAMEWORK CODE EXPORTER */}
          {viewMode === 'code' && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 border-b border-zinc-100 pb-3">
                {/* Framework Selector Tabs */}
                <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setCodeTab('react')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      codeTab === 'react' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    ⚛️ React / Next.js (TSX)
                  </button>
                  <button
                    onClick={() => setCodeTab('html')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      codeTab === 'html' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    🌐 HTML + Tailwind
                  </button>
                  <button
                    onClick={() => setCodeTab('vue')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      codeTab === 'vue' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    🟢 Vue 3 / Svelte
                  </button>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="text-xs font-mono text-zinc-900 bg-zinc-50 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap max-h-[600px] border border-zinc-200">
                {getActiveCode()}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
