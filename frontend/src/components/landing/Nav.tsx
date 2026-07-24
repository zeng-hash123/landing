"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#0d0d14]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3' : 'bg-[#0d0d14]/90 backdrop-blur-xl py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform overflow-hidden">
            <img src="/logo.jpg" alt="PixelPage Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
              PixelPage <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">AI</span>
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-300" aria-label="Main Navigation">
          <a href="/#features" className="hover:text-white transition-colors">Features</a>
          <a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="/#agencies" className="hover:text-white transition-colors">For Agencies</a>
          <a href="/blog" className="hover:text-violet-300 transition-colors text-violet-400 font-bold flex items-center gap-1">
            <span>Blog</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-violet-500/20 border border-violet-500/30 text-violet-300">NEW</span>
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/auth"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Sign In
          </a>
          <a
            href="/auth"
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Try PixelPage Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Actions & Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <a
            href="/auth"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md"
          >
            Try Free
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#13131a] border-b border-white/10 px-4 py-6 space-y-4 shadow-2xl mt-3">
          <nav className="flex flex-col space-y-3.5 text-sm font-semibold text-gray-300">
            <a href="/#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Features</a>
            <a href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">How It Works</a>
            <a href="/#agencies" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">For Agencies</a>
            <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="hover:text-violet-300 text-violet-400 font-bold flex items-center justify-between">
              <span>Blog & Insights</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-violet-500/20 border border-violet-500/30 text-violet-300">NEW</span>
            </a>
          </nav>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <a href="/auth" className="w-full text-center py-2.5 rounded-xl text-xs font-semibold border border-white/10 text-white">
              Sign In
            </a>
            <a href="/auth" className="w-full text-center py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg">
              Start Generating Free →
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
