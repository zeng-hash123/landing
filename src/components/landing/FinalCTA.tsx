"use client";

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function FinalCTA() {
  return (
    <section className="py-24 bg-[#0d0d14] relative border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-[#161624] to-[#13131a] border border-white/10 p-10 sm:p-16 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/25">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight font-sans">
            Ready to convert visitors into loyal customers?
          </h2>

          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mt-4 leading-relaxed font-sans">
            Join 50+ agencies building high-converting, on-brand landing pages in minutes with multi-agent AI.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/auth"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-xl shadow-violet-500/30 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Start Building Free Today</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <p className="text-[11px] text-gray-500 mt-4">
            Free 14-day trial • No credit card required • Instant setup
          </p>
        </motion.div>
      </div>
    </section>
  );
}
