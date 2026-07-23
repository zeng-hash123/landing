"use client";

import React from 'react';
import { Cpu, Palette, GitCompare, MessageSquareCode, ShieldCheck, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: Cpu,
    title: "Multi-Agent AI Pipeline",
    description: "Specialized Copywriter, Designer, and Compliance agents run in parallel to craft copy, select layout components, and evaluate conversion structure."
  },
  {
    icon: Palette,
    title: "Brand Kit Engine",
    description: "Upload your client's logo, primary & secondary brand colors, and custom Google Fonts to ensure every landing page stays 100% on-brand."
  },
  {
    icon: GitCompare,
    title: "Built-In A/B Testing",
    description: "Automatically generate Variant A and Variant B with alternate headlines and CTA copy to double your campaign testing volume instantly."
  },
  {
    icon: MessageSquareCode,
    title: "Chat-Based Real-Time Editing",
    description: "Refine headlines, swap colors, adjust copy tone, or modify section layouts instantly using simple natural language chat commands."
  },
  {
    icon: ShieldCheck,
    title: "Ad Compliance & Policy Checks",
    description: "Automated scan flags misleading claims, guarantees, or prohibited ad copy before you launch on Meta or Google Ads."
  },
  {
    icon: Briefcase,
    title: "Agency White-Label Export",
    description: "Export clean, lightweight HTML/CSS code or share live previews with clients without any PromtPage branding or platform locks."
  }
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 bg-[#0d0d14] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400">
            Engineered For Agencies
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2 font-sans">
            Everything your growth team needs to scale landing pages
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Replace fragmented design files and slow copywriter turnarounds with an integrated AI workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-[#13131a] border border-white/10 hover:border-violet-500/40 rounded-2xl p-6 transition-all duration-300 group hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white tracking-tight mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
