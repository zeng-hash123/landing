"use client";

import React, { useState } from 'react';
import { AuditRecord, CategoryResult } from '@/types/audit';
import { BrandConfig, RegeneratedSection, RegenerationRecord } from '@/types/regenerate';
import { supabase } from '@/lib/supabase';

interface RegenerateTabProps {
  auditRecord: AuditRecord;
}

export function RegenerateTab({ auditRecord }: RegenerateTabProps) {
  const categories: CategoryResult[] = auditRecord.audit_json.categories || [];

  // Suggestion selection state (default: all checked)
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>(
    categories.map((c) => c.name)
  );

  // Brand Configuration state
  const [tone, setTone] = useState<'outcome_focused' | 'conversational' | 'professional' | 'bold'>('outcome_focused');
  const [primaryColor, setPrimaryColor] = useState('#09090b');
  const [ctaStyle, setCtaStyle] = useState('rounded');
  const [bannedWords, setBannedWords] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneration, setRegeneration] = useState<RegenerationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'diff' | 'preview'>('diff');

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
    } catch (err: any) {
      setError(err.message || 'Regeneration failed. Please try again.');
    }

    setIsGenerating(false);
  };

  const handleExportHtml = () => {
    if (!regeneration?.full_regenerated_html) return;

    const blob = new Blob([regeneration.full_regenerated_html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optimized_page_${auditRecord.id.substring(0, 8)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* OPTIMIZER CONTROLS CARD */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Landing Page Regeneration Engine</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Select which Kimi CRO suggestions to apply and customize brand rules to generate an optimized landing page version.
        </p>

        {/* 1. SUGGESTION SELECTOR */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Select Suggestions to Apply ({selectedSuggestions.length}/{categories.length})
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs text-zinc-600 hover:text-zinc-900 font-medium underline"
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
                  className={`flex items-start gap-3 p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-50 text-zinc-900 font-medium'
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
                    <span className="font-bold text-zinc-900 block">{cat.name} Fix</span>
                    <span className="text-zinc-600 line-clamp-1">{cat.recommendation}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. BRAND CONFIGURATION CONTROLS */}
        <div className="pt-6 border-t border-zinc-100 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
            Brand Rules & Customizations (Optional)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Primary Color</label>
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
                <option value="rounded">Rounded Corners</option>
                <option value="pill">Pill Shape</option>
                <option value="sharp">Sharp Edges</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">Banned Words</label>
              <input
                type="text"
                placeholder="synergy, cheap, revolutionary"
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs bg-white text-zinc-900 placeholder-zinc-400"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedSuggestions.length === 0}
            className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Optimizing Page Sections...</span>
              </>
            ) : (
              <span>Generate Optimized Page</span>
            )}
          </button>

          {regeneration && (
            <button
              onClick={handleExportHtml}
              className="w-full sm:w-auto px-6 py-3.5 border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Download HTML Export</span>
            </button>
          )}
        </div>
      </div>

      {/* REGENERATED OUTPUT & DIFF VIEWER */}
      {regeneration && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 text-white rounded-xl p-6">
            <div>
              <h3 className="text-xl font-bold">Optimized Page Ready</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Generated {regeneration.sections_json.length} sections based on selected CRO fixes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-zinc-800 p-1 rounded-lg border border-zinc-700 text-xs font-semibold">
                <button
                  onClick={() => setViewMode('diff')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    viewMode === 'diff' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Side-by-Side Diff
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    viewMode === 'preview' ? 'bg-white text-zinc-900' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Full Preview
                </button>
              </div>

              <button
                onClick={handleExportHtml}
                className="px-4 py-2 bg-white text-zinc-900 rounded-lg text-xs font-bold hover:bg-zinc-100 transition-colors"
              >
                Export HTML
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: SIDE-BY-SIDE SECTION DIFF */}
          {viewMode === 'diff' ? (
            <div className="space-y-6">
              {regeneration.sections_json.map((section: RegeneratedSection, idx: number) => (
                <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded">
                        Section: {section.type}
                      </span>
                      {section.suggestion_ids.length > 0 ? (
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded">
                          {section.suggestion_ids.length} CRO Fixes Applied
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-zinc-100 text-zinc-500 px-2.5 py-0.5 rounded">
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
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                      <span className="text-xs font-bold text-red-800 uppercase tracking-wider block mb-2">
                        Original Section HTML / Copy
                      </span>
                      <pre className="text-xs text-zinc-800 font-mono overflow-x-auto whitespace-pre-wrap bg-white p-3 rounded border border-red-100 max-h-64">
                        {section.original_html}
                      </pre>
                    </div>

                    {/* RIGHT: REGENERATED */}
                    <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50/30">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                        Regenerated Optimized HTML / Copy
                      </span>
                      <pre className="text-xs text-zinc-800 font-mono overflow-x-auto whitespace-pre-wrap bg-white p-3 rounded border border-emerald-100 max-h-64">
                        {section.regenerated_html}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* VIEW MODE 2: FULL PREVIEW */
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                Full Regenerated Page HTML Source
              </h4>
              <pre className="text-xs font-mono text-zinc-900 bg-zinc-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-[600px] border border-zinc-200">
                {regeneration.full_regenerated_html}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
