"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ComplianceBannerProps {
  flags: string[];
}

export function ComplianceBanner({ flags }: ComplianceBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (flags && flags.length > 0) {
      setIsVisible(true);
    }
  }, [flags]);

  if (!isVisible || flags.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-yellow-500/10 border border-yellow-500/50 backdrop-blur-md text-yellow-200 p-4 rounded-xl shadow-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-400 mb-1">Compliance Warning</h3>
          <ul className="text-sm space-y-1">
            {flags.map((flag, i) => (
              <li key={i}>• {flag}</li>
            ))}
          </ul>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-yellow-500/20 rounded-lg transition-colors text-yellow-400/80 hover:text-yellow-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
