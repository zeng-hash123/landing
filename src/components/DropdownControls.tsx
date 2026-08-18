"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownControlsProps {
  campaignGoal: string;
  setCampaignGoal: (val: string) => void;
  designVibe: string;
  setDesignVibe: (val: string) => void;
  ctaFocus: string;
  setCtaFocus: (val: string) => void;
  abTest: boolean;
  setAbTest: (val: boolean) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  prompt?: string;
}

const CAMPAIGN_GOALS = [
  "Lead generation", "Sales / purchase", "Free trial signup", 
  "Webinar / event registration", "App download", 
  "Demo / book a call", "Waitlist / pre-launch", 
  "Newsletter / community signup"
];

const DESIGN_VIBES = [
  "Bold & modern", "Minimal & clean", "Luxury & premium", 
  "Playful & fun", "Corporate & trustworthy", "Tech & futuristic", 
  "Warm & organic", "Edgy & high-contrast"
];

const CTA_FOCUSES = [
  "Single strong CTA", "Urgency-driven", "Social proof-driven", 
  "Risk-reversal", "Value-stack", "Multi-step"
];

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}

function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-[#161622] border border-white/10 hover:border-white/20 rounded-2xl py-2.5 px-3.5 text-xs transition-all duration-200 cursor-pointer min-h-[42px] ${
          value ? 'text-gray-100 font-medium' : 'text-gray-400'
        } ${isOpen ? 'ring-2 ring-violet-500/40 border-violet-500/60' : ''}`}
      >
        <span className="text-left font-medium leading-tight pr-2">{value || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-400' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 bottom-full mb-2 bg-[#14141f] border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-2xl max-h-64 overflow-y-auto space-y-1 w-full min-w-full md:min-w-[220px]"
          >
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 text-xs rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-violet-600/30 text-violet-200 font-semibold border border-violet-500/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="whitespace-normal leading-snug pr-2">{opt}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownControls({
  campaignGoal, setCampaignGoal,
  designVibe, setDesignVibe,
  ctaFocus, setCtaFocus,
  abTest, setAbTest
}: DropdownControlsProps) {

  return (
    <div className="flex flex-col gap-4 w-full p-4 glass-panel mt-4 border border-white/10 shadow-2xl rounded-3xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Goal */}
        <CustomSelect 
          value={campaignGoal} 
          onChange={setCampaignGoal} 
          options={CAMPAIGN_GOALS} 
          placeholder="Goal" 
        />

        {/* Design Vibe */}
        <CustomSelect 
          value={designVibe} 
          onChange={setDesignVibe} 
          options={DESIGN_VIBES} 
          placeholder="Design Vibe" 
        />

        {/* CTA Focus */}
        <CustomSelect 
          value={ctaFocus} 
          onChange={setCtaFocus} 
          options={CTA_FOCUSES} 
          placeholder="CTA Focus" 
        />
      </div>

      <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={abTest} 
              onChange={e => setAbTest(e.target.checked)} 
            />
            <div className={`block w-9 h-5 rounded-full transition-colors duration-200 ${abTest ? 'bg-violet-600' : 'bg-white/10 group-hover:bg-white/15 border border-white/10'}`}></div>
            <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${abTest ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <span className="ml-2.5 text-xs text-gray-400 group-hover:text-gray-200 transition-colors">A/B Variant (Optional)</span>
        </label>
      </div>
    </div>
  );
}
