"use client";

import React from 'react';
import { MessageSquare, Bot, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    step: "01",
    title: "Describe your product or paste an ad URL",
    description: "Input a short prompt describing your target audience or attach an existing ad / product URL. Our scraper automatically extracts key selling points.",
    icon: MessageSquare,
    color: "from-violet-500/20 to-violet-600/10",
    border: "border-violet-500/30",
    iconColor: "text-violet-400"
  },
  {
    step: "02",
    title: "Multi-agent AI writes, designs, and checks compliance",
    description: "Copywriter, Designer, and Compliance AI agents work simultaneously to generate structured HTML templates, conversion copy, and ad policy risk checks.",
    icon: Bot,
    color: "from-fuchsia-500/20 to-fuchsia-600/10",
    border: "border-fuchsia-500/30",
    iconColor: "text-fuchsia-400"
  },
  {
    step: "03",
    title: "Publish, edit, and A/B test — all from chat",
    description: "Instant real-time HTML preview. Refine copy or styling using natural language chat commands, generate A/B variants, and export clean HTML.",
    icon: Rocket,
    color: "from-pink-500/20 to-pink-600/10",
    border: "border-pink-500/30",
    iconColor: "text-pink-400"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0d0d14] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2 font-sans">
            How Forge turns ideas into high-converting pages
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Eliminate developer bottlenecks and copy blocks. Go from prompt to production-ready landing page in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="bg-[#13131a] border border-white/10 rounded-2xl p-8 relative flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} border ${s.border} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                      <Icon className={`w-7 h-7 ${s.iconColor}`} />
                    </div>
                    <span className="text-3xl font-black text-white/10 font-mono">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight mb-3">
                    {s.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
                  <span>Step {idx + 1} workflow</span>
                  <span>→</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
