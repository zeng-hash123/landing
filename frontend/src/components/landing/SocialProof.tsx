"use client";

import React from 'react';

const LOGOS = [
  { name: "APEX AGENCY", badge: "A" },
  { name: "NEXUS GROWTH", badge: "N" },
  { name: "SCALEFLOW", badge: "S" },
  { name: "CONVERSIONLAB", badge: "C" },
  { name: "VELOCITY MEDIA", badge: "V" },
];

export function SocialProof() {
  return (
    <section className="py-12 bg-[#0d0d14] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-8">
          Trusted by marketing agencies shipping client pages 10x faster
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 opacity-60 grayscale hover:grayscale-0 hover:opacity-90 transition-all duration-300">
          {LOGOS.map((logo, idx) => (
            <div key={idx} className="flex items-center gap-2 text-gray-400 font-bold tracking-wider text-xs sm:text-sm">
              <span className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white text-xs font-mono">
                {logo.badge}
              </span>
              <span>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
