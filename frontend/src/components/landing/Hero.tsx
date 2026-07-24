"use client";

import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Layers, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-[#0d0d14]">
      {/* High-Visibility Modern Tech Grid & Dot Matrix Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_85%_70%_at_50%_20%,#000_85%,transparent_100%)] pointer-events-none" 
      />
      <div 
        className="absolute inset-0 bg-[radial-gradient(rgba(168,85,247,0.3)_1.5px,transparent_1.5px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,#000_85%,transparent_100%)] pointer-events-none" 
      />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[linear-gradient(to_right,rgba(124,58,237,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,0.18)_1px,transparent_1px)] bg-[size:120px_120px] pointer-events-none"
      />

      {/* Glowing Radial Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-600/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-fuchsia-500/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-200 text-xs font-semibold mb-6 shadow-lg shadow-violet-500/10 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Built for Marketing Agencies & Growth Teams</span>
          </motion.div>

          {/* Tagline H1 (Primary SEO Headline) */}
          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] font-sans"
          >
            Landing pages that convert <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              visitors into customers
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-sans"
          >
            Multi-agent AI (copywriter, designer, compliance) generates on-brand, high-converting landing pages from a single prompt or ad URL — built specifically for agencies managing client campaigns.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="/auth"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-xl shadow-violet-500/25 hover:opacity-95 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Start Generating Free</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />
              <span>See How It Works</span>
            </a>
          </motion.div>

          {/* Key Value Micro-pills */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-400" /> No coding required
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-fuchsia-400" /> Brand kit integration
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Ad compliance checked
            </span>
          </motion.div>
        </div>

        {/* Visual App Mockup Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#13131a]/80 backdrop-blur-2xl shadow-2xl p-2 sm:p-3 overflow-hidden"
        >
          {/* Top Browser Bar */}
          <div className="h-9 bg-[#161622] rounded-xl px-4 flex items-center justify-between border border-white/5 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="px-4 py-1 rounded-lg bg-[#0d0d14] border border-white/5 text-[11px] font-mono text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              build.landing-xyx.vercel.app
            </div>
            <div className="text-xs font-semibold text-violet-400">PixelPage AI</div>
          </div>

          {/* Interface Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-[#0d0d14] rounded-xl p-3 border border-white/5 min-h-[360px] md:min-h-[440px]">
            {/* Left Chat Mockup Column */}
            <div className="md:col-span-4 bg-[#13131a] rounded-xl p-4 border border-white/5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white pb-2 border-b border-white/5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  PixelPage Assistant
                </div>
                <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 text-xs text-violet-200">
                  "Create a high-converting SaaS landing page for an AI email writer..."
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300">
                  ⚡ 3 AI Agents (Copywriter, Designer, Compliance) generated navbar, hero, features & A/B variants.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#161622] border border-white/10 text-xs text-gray-500 flex justify-between items-center">
                <span>Ask AI to edit headline...</span>
                <span className="p-1 rounded-lg bg-violet-600 text-white">↵</span>
              </div>
            </div>

            {/* Right Live Preview Column */}
            <div className="md:col-span-8 bg-white rounded-xl overflow-hidden p-6 text-gray-900 flex flex-col justify-between relative shadow-inner">
              <div className="space-y-4 text-center max-w-md mx-auto pt-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs font-medium text-gray-600">
                  <span className="font-bold text-violet-600 text-sm">BrandAI</span>
                  <div className="flex gap-3 text-[11px]">
                    <span>Features</span>
                    <span>Pricing</span>
                    <span>About</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 inline-block mt-2">
                  AI-Generated Preview
                </span>
                <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                  Write Cold Emails That Actually Get 40%+ Reply Rates
                </h3>
                <p className="text-xs text-gray-600">
                  Powered by custom fine-tuned copywriter AI trained on $50M+ cold outreach campaigns.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <span className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold shadow-md">
                    Start 14-Day Free Trial
                  </span>
                  <span className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                    Watch Demo
                  </span>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="grid grid-cols-3 gap-2 pt-6 text-center text-[10px] font-semibold text-gray-500 border-t border-gray-100 mt-6">
                <div className="p-2 bg-gray-50 rounded-lg">✓ Navbar + Hero</div>
                <div className="p-2 bg-gray-50 rounded-lg">✓ Brand Kit Synced</div>
                <div className="p-2 bg-gray-50 rounded-lg">✓ 0 Policy Flags</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
