"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Copy, Download, History, DollarSign, User, LogOut, ShieldCheck, Lock, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isAdminEmail } from '@/lib/admin';

interface PreviewPanelProps {
  html: string;
  htmlB?: string;
  isGenerating: boolean;
  activeVariant: 'A' | 'B';
  setActiveVariant: (variant: 'A' | 'B') => void;
  abTestActive: boolean;
  onToggleHistory?: () => void;
  versionCount?: number;
  onOpenPricing?: () => void;
  onNewProject?: () => void;
  userEmail?: string;
  userPlan?: 'Free' | 'Pro' | 'Admin';
  onSignOut?: () => void;
  isAdmin?: boolean;
  isPro?: boolean;
}

function ProfileMenu({ userEmail, isAdmin = false, isPro = false, onSignOut }: { userEmail?: string; isAdmin?: boolean; isPro?: boolean; onSignOut?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayEmail = userEmail || 'user@pixelpage.com';
  const initial = displayEmail.charAt(0).toUpperCase();
  const effectiveIsAdmin = isAdmin || isAdminEmail(userEmail);

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={displayEmail}
        className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white font-bold text-xs flex items-center justify-center border border-white/20 shadow-md hover:scale-105 transition-all cursor-pointer"
      >
        <User className="w-4 h-4 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 w-64 bg-[#14141f] border border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl space-y-3 font-sans"
          >
            {/* User Details */}
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 font-bold text-sm">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate" title={displayEmail}>
                  {displayEmail}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    effectiveIsAdmin 
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : isPro
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {effectiveIsAdmin ? 'Pro Admin Plan' : isPro ? 'Unlimited Plan Active' : 'Subscription Required'}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Details Info */}
            <div className="bg-[#161622] p-2.5 rounded-xl border border-white/5 text-[11px] text-gray-400 leading-tight">
              {effectiveIsAdmin ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Full Admin & Unlimited Access Active
                </span>
              ) : isPro ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Unlimited Plan Active
                </span>
              ) : (
                <span className="text-amber-300 font-medium flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 shrink-0" /> $49/mo Unlimited Plan Required
                </span>
              )}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                if (onSignOut) onSignOut();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PreviewPanel({
  html, htmlB, isGenerating,
  activeVariant, setActiveVariant, abTestActive,
  onToggleHistory, versionCount, onOpenPricing, onNewProject,
  userEmail, onSignOut, isAdmin = false, isPro = false
}: PreviewPanelProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const viewportWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  };

  const handleCopy = async () => {
    const code = activeVariant === 'A' ? html : (htmlB || html);
    if (code) {
      await navigator.clipboard.writeText(code);
    }
  };

  const handleDownload = () => {
    const code = activeVariant === 'A' ? html : (htmlB || html);
    if (code) {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `landing-page-variant-${activeVariant}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const currentHtml = activeVariant === 'A' ? html : (htmlB || html);

  if (!html) {
    return (
      <div className="flex-1 min-w-0 bg-[#0d0d14] flex flex-col h-full overflow-hidden">
        {/* Top Toolbar in empty state */}
        <div className="h-14 border-b border-white/10 bg-[#13131a]/80 backdrop-blur-md flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#161622] rounded-xl p-1 border border-white/10">
              <button 
                onClick={() => setViewport('desktop')} 
                title="Desktop View (100%)" 
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewport === 'desktop' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewport('tablet')} 
                title="Tablet View (768px)" 
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewport === 'tablet' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewport('mobile')} 
                title="Mobile View (375px)" 
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewport === 'mobile' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <span className="text-[11px] font-mono text-gray-500 hidden md:inline">
              {viewport === 'desktop' ? '100% width' : viewport === 'tablet' ? '768px width' : '375px width'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onNewProject && (
              <button
                onClick={onNewProject}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Start a New Project"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Project</span>
              </button>
            )}

            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold shadow-lg hover:bg-violet-500/25 transition-all cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-violet-400" />
                <span>Pricing</span>
              </button>
            )}

            {onToggleHistory && (
              <button 
                onClick={onToggleHistory} 
                className="flex items-center gap-2 px-3.5 py-1.5 glass-button rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">Version History</span>
                {versionCount && versionCount > 0 ? (
                  <span className="bg-violet-500/20 text-violet-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-violet-500/30">
                    {versionCount}
                  </span>
                ) : null}
              </button>
            )}

            <ProfileMenu userEmail={userEmail} isAdmin={isAdmin} onSignOut={onSignOut} />
          </div>
        </div>

        {/* Empty State Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md p-8 glass-panel flex flex-col items-center justify-center text-center shadow-2xl border border-white/10"
          >
            <div className={`w-20 h-20 mb-6 rounded-3xl bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-[0_0_40px_rgba(124,58,237,0.15)] ${isGenerating ? 'animate-pulse' : ''}`}>
              <Monitor className="w-10 h-10 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mb-1.5">
              {isGenerating ? 'Generating Your Page...' : 'Your preview will appear here'}
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              {isGenerating 
                ? 'AI is assembling components, copywriting, and styling...' 
                : 'Describe your landing page in the chat to generate a fully functional HTML output.'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 bg-[#0d0d14] flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 border-b border-white/10 bg-[#13131a]/80 backdrop-blur-md flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#161622] rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewport === 'desktop' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewport === 'tablet' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewport === 'mobile' ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] font-mono text-gray-500 hidden md:inline">
            {viewport === 'desktop' ? '100% width' : viewport === 'tablet' ? '768px width' : '375px width'}
          </span>
        </div>

        {Boolean(htmlB) && (
          <div className="flex bg-[#161622] rounded-xl p-1 border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveVariant('A')}
              className={`px-3.5 py-1 rounded-lg transition-all cursor-pointer ${activeVariant === 'A' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              Variant A
            </button>
            <button
              onClick={() => setActiveVariant('B')}
              className={`px-3.5 py-1 rounded-lg transition-all cursor-pointer ${activeVariant === 'B' ? 'bg-fuchsia-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              Variant B
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onNewProject && (
            <button
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Start a New Project"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          )}

          {onOpenPricing && (
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold shadow-lg hover:bg-violet-500/25 transition-all cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-violet-400" />
              <span>Pricing</span>
            </button>
          )}

          {onToggleHistory && (
            <button onClick={onToggleHistory} className="flex items-center gap-1.5 px-3 py-1.5 glass-button rounded-xl text-xs font-medium text-gray-300 hover:text-white cursor-pointer">
              <History className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Version History</span>
              {versionCount && versionCount > 0 ? (
                <span className="bg-violet-500/20 text-violet-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-violet-500/30">
                  {versionCount}
                </span>
              ) : null}
            </button>
          )}

          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 glass-button rounded-xl text-xs font-medium text-gray-300 hover:text-white cursor-pointer">
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy HTML</span>
          </button>
          
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 hover:opacity-95 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <ProfileMenu userEmail={userEmail} isAdmin={isAdmin} isPro={isPro} onSignOut={onSignOut} />
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto bg-[#09090e] p-4 flex justify-center items-start">
        <div 
          className="bg-white rounded-xl shadow-2xl transition-all duration-300 overflow-hidden min-h-full"
          style={{ 
            width: viewportWidths[viewport],
            maxWidth: '100%'
          }}
        >
          {currentHtml ? (
            <iframe
              srcDoc={currentHtml}
              title="Landing Page Live Preview"
              className="w-full h-[calc(100vh-120px)] border-0 rounded-xl"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
