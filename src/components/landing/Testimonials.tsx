"use client";

import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote: "PixelPage allowed our agency to launch 14 client campaign pages in one week. The multi-agent copy and compliance check saved us countless hours of revision.",
    author: "Marcus Vance",
    role: "Founder & Lead Strategist",
    agency: "ScaleFlow Media",
    avatar: "MV"
  },
  {
    quote: "The brand kit integration is a game-changer. We uploaded our client's logo and primary colors, and the AI generated an on-brand page instantly.",
    author: "Vikas Singha",
    role: "Head of Performance Marketing",
    agency: "Nexus Growth Lab",
    avatar: "VS"
  },
  {
    quote: "We used the built-in A/B test variant generator for a DTC e-commerce client and saw a 34% increase in conversion rate on Day 1.",
    author: "David Miller",
    role: "Creative Director",
    agency: "Apex Conversion Agency",
    avatar: "DM"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-[#0d0d14] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400">
            Agency Success Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2 font-sans">
            Loved by fast-moving marketing teams
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="bg-[#13131a] border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
            >
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-600/20 border border-violet-500/30 text-violet-300 flex items-center justify-center font-bold text-xs">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.author}</h4>
                  <p className="text-[11px] text-gray-400">{t.role} • <span className="text-violet-400">{t.agency}</span></p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
