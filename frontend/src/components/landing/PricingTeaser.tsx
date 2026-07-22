"use client";

import React from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PLANS = [
  {
    name: "Starter Agency",
    price: "$49",
    period: "/month",
    description: "Perfect for boutique agencies & solo growth marketers.",
    features: [
      "15 AI Page Generations / mo",
      "Full Multi-Agent Copy & Design",
      "3 Brand Kits Supported",
      "A/B Variant Generator",
      "Standard HTML / CSS Export"
    ],
    popular: false,
    cta: "Start 14-Day Free Trial",
    href: "/auth"
  },
  {
    name: "Agency Pro",
    price: "$149",
    period: "/month",
    description: "Built for scaling agencies with multiple active client accounts.",
    features: [
      "Unlimited AI Page Generations",
      "Unlimited Client Brand Kits",
      "Advanced Ad Compliance Scanner",
      "Real-Time Chat Copy Editing",
      "White-Label Client Preview Links",
      "Priority AI Agent Processing"
    ],
    popular: true,
    cta: "Start Free Agency Trial",
    href: "/auth"
  },
  {
    name: "Enterprise",
    price: "$399",
    period: "/month",
    description: "Custom workflows and dedicated AI model fine-tuning for large teams.",
    features: [
      "Everything in Pro + Unlimited Seats",
      "Custom Brand Kit Auto-Scraper",
      "Dedicated Slack / Teams Support",
      "Custom Integration & Webhooks",
      "SLA & Dedicated Account Manager"
    ],
    popular: false,
    cta: "Contact Sales",
    href: "/auth"
  }
];

export function PricingTeaser() {
  return (
    <section id="pricing" className="py-24 bg-[#0d0d14] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400">
            Simple Agency Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2 font-sans">
            Transparent plans that scale with your agency
          </h2>
          <p className="text-sm text-gray-400 mt-3 leading-relaxed">
            Try free for 14 days. No credit card required to start generating.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`rounded-2xl p-8 flex flex-col justify-between relative transition-all duration-300 ${
                p.popular
                  ? 'bg-[#161624] border-2 border-violet-500 shadow-2xl shadow-violet-500/20 scale-105 z-10'
                  : 'bg-[#13131a] border border-white/10 hover:border-white/20'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Most Popular for Agencies
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{p.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">{p.price}</span>
                  <span className="text-xs text-gray-400 font-medium">{p.period}</span>
                </div>

                <div className="mt-8 space-y-3">
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                      <div className="w-4 h-4 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <a
                  href={p.href}
                  className={`w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                    p.popular
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-95'
                      : 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white'
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
