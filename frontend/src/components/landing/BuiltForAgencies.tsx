"use client";

import React from 'react';
import { CheckCircle2, Zap, TrendingUp, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function BuiltForAgencies() {
  return (
    <section id="agencies" className="py-24 bg-[#0d0d14] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Copy Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400">
              Agency Operations Optimized
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight font-sans">
              Stop waiting 2 weeks to launch a client landing page
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Agencies lose money when client campaigns sit in development queues. PixelPage empowers account managers and media buyers to generate, review, and ship high-converting pages in minutes.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Client-Specific Brand Isolation</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Switch between client brand kits instantly without mixing colors, logos, or typography.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">10x Output Without Hiring Developers</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Produce dozens of campaign variants per week with zero frontend engineering bottlenecks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Clean Production-Ready Code</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Export standard semantic HTML/CSS ready for hosting on Vercel, Netlify, or custom CMS.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-95 transition-all"
              >
                <span>Get Started for Your Agency</span>
                <span>→</span>
              </a>
            </div>
          </motion.div>

          {/* Right Visual / Stat Callout Column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 grid grid-cols-2 gap-4"
          >
            <div className="bg-[#13131a] border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono">10 Min</div>
              <p className="text-xs text-gray-400">Average time from prompt to live production page</p>
            </div>

            <div className="bg-[#13131a] border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono">+38%</div>
              <p className="text-xs text-gray-400">Higher conversion rate vs generic landing templates</p>
            </div>

            <div className="bg-[#13131a] border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono">100%</div>
              <p className="text-xs text-gray-400">Lightweight semantic HTML output with fast load times</p>
            </div>

            <div className="bg-[#13131a] border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white font-mono">500+</div>
              <p className="text-xs text-gray-400">Agencies generating client pages with PixelPage daily</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
