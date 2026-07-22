"use client";

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Copy, Download, History } from 'lucide-react';

interface PreviewPanelProps {
  html: string;
  htmlB?: string;
  isGenerating: boolean;
  activeVariant: 'A' | 'B';
  setActiveVariant: (variant: 'A' | 'B') => void;
  abTestActive: boolean;
  onToggleHistory?: () => void;
  versionCount?: number;
}

export function PreviewPanel({
  html, htmlB, isGenerating,
  activeVariant, setActiveVariant, abTestActive,
  onToggleHistory, versionCount
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
      <div className="flex-1 min-w-0 bg-background flex flex-col h-full overflow-hidden">
        {/* Toolbar in empty state */}
        <div className="h-14 border-b border-border bg-surface/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-border">
              <button onClick={() => setViewport('desktop')} title="Desktop View (100%)" className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewport === 'desktop' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text'}`}>
                <Monitor className="w-4 h-4" />
              </button>
              <button onClick={() => setViewport('tablet')} title="Tablet View (768px)" className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewport === 'tablet' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text'}`}>
                <Tablet className="w-4 h-4" />
              </button>
              <button onClick={() => setViewport('mobile')} title="Mobile View (375px)" className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewport === 'mobile' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text'}`}>
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs font-mono text-text-muted/60 hidden md:inline">
              {viewport === 'desktop' ? '100% width' : viewport === 'tablet' ? '768px width' : '375px width'}
            </span>
          </div>
          {onToggleHistory && (
            <button onClick={onToggleHistory} className="flex items-center gap-2 px-3 py-1.5 glass-button rounded-lg text-sm font-medium text-text-muted hover:text-text cursor-pointer">
              <History className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Version History</span>
              {versionCount && versionCount > 0 ? (
                <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {versionCount}
                </span>
              ) : null}
            </button>
          )}
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full h-full glass-panel flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-24 h-24 mb-6 rounded-2xl bg-surface-hover flex items-center justify-center">
              <Monitor className="w-12 h-12 text-primary opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-text-muted mb-2">Your preview will appear here</h2>
            <p className="text-sm text-text-muted max-w-sm">
              Describe your landing page in the chat to generate a fully functional HTML output.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 bg-background flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 border-b border-border bg-surface/50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surface rounded-lg p-1 border border-border">
            <button
              onClick={() => setViewport('desktop')}
              title="Desktop View (100%)"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewport === 'desktop' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              title="Tablet View (768px)"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewport === 'tablet' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              title="Mobile View (375px)"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewport === 'mobile' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-mono text-text-muted/60 hidden md:inline">
            {viewport === 'desktop' ? '100% width' : viewport === 'tablet' ? '768px width' : '375px width'}
          </span>
        </div>

        {Boolean(htmlB) && (
          <div className="flex bg-surface rounded-lg p-1 border border-border text-sm font-medium">
            <button
              onClick={() => setActiveVariant('A')}
              className={`px-4 py-1 rounded-md transition-colors ${activeVariant === 'A' ? 'bg-primary text-white' : 'text-text-muted hover:text-text'}`}
            >
              Variant A
            </button>
            <button
              onClick={() => setActiveVariant('B')}
              className={`px-4 py-1 rounded-md transition-colors ${activeVariant === 'B' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'}`}
            >
              Variant B
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {onToggleHistory && (
            <button onClick={onToggleHistory} className="flex items-center gap-2 px-3 py-1.5 glass-button rounded-lg text-sm font-medium text-text-muted hover:text-text cursor-pointer">
              <History className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">History</span>
              {versionCount && versionCount > 0 ? (
                <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {versionCount}
                </span>
              ) : null}
            </button>
          )}
          <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 glass-button rounded-lg text-sm font-medium text-text-muted hover:text-text cursor-pointer">
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy HTML</span>
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 glass-button rounded-lg text-sm font-medium text-text-muted hover:text-text cursor-pointer">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* iframe container */}
      <div className="flex-1 min-h-0 overflow-auto bg-[#e5e7eb] flex justify-center p-4">
        <div 
          className="h-full min-h-[600px] bg-white shadow-2xl transition-all duration-300 ease-in-out relative rounded-sm overflow-hidden border border-border flex flex-col"
          style={{ width: viewportWidths[viewport] }}
        >
          {isGenerating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mb-4"></div>
              <p className="text-gray-600 font-medium animate-pulse">Rendering preview...</p>
            </div>
          )}
          <iframe
            srcDoc={currentHtml}
            className="w-full h-full min-h-[600px] border-0 bg-white flex-1"
            title="Landing Page Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </div>
      </div>
    </div>
  );
}
