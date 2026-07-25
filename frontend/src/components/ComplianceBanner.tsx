"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AnimatePresence>
      <div className="fixed top-4 left-4 z-40 w-80 sm:w-96 px-2 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-[#1e1b13]/95 border border-amber-500/40 backdrop-blur-xl text-amber-200 p-3.5 rounded-2xl shadow-2xl flex items-start gap-3 pointer-events-auto"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 mb-1">Ad Compliance Notice</h3>
            <ul className="text-xs space-y-1 text-amber-200/90 leading-relaxed">
              {flags.map((flag, i) => (
                <li key={i}>• {flag}</li>
              ))}
            </ul>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-1.5 hover:bg-amber-500/20 rounded-lg transition-colors text-amber-400/80 hover:text-amber-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
