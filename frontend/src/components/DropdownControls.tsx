"use client";

import React from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface DropdownControlsProps {
  campaignGoal: string;
  setCampaignGoal: (val: string) => void;
  designVibe: string;
  setDesignVibe: (val: string) => void;
  ctaFocus: string;
  setCtaFocus: (val: string) => void;
  abTest: boolean;
  setAbTest: (val: boolean) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  prompt: string;
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

export function DropdownControls({
  campaignGoal, setCampaignGoal,
  designVibe, setDesignVibe,
  ctaFocus, setCtaFocus,
  abTest, setAbTest,
  onGenerate, isGenerating, prompt
}: DropdownControlsProps) {
  
  const canGenerate = prompt.trim().length > 0;

  return (
    <div className="flex flex-col gap-4 w-full p-4 glass-panel mt-4 border border-white/10 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Campaign Goal */}
        <div className="relative">
          <select 
            value={campaignGoal} 
            onChange={e => setCampaignGoal(e.target.value)}
            className="w-full appearance-none bg-[#161622] border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-3.5 pr-8 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all duration-200 cursor-pointer"
          >
            <option value="" disabled className="bg-[#13131a] text-gray-400">Goal</option>
            {CAMPAIGN_GOALS.map(g => <option key={g} value={g} className="bg-[#13131a] text-gray-200">{g}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Design Vibe */}
        <div className="relative">
          <select 
            value={designVibe} 
            onChange={e => setDesignVibe(e.target.value)}
            className="w-full appearance-none bg-[#161622] border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-3.5 pr-8 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all duration-200 cursor-pointer"
          >
            <option value="" disabled className="bg-[#13131a] text-gray-400">Design Vibe</option>
            {DESIGN_VIBES.map(g => <option key={g} value={g} className="bg-[#13131a] text-gray-200">{g}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>

        {/* CTA Focus */}
        <div className="relative">
          <select 
            value={ctaFocus} 
            onChange={e => setCtaFocus(e.target.value)}
            className="w-full appearance-none bg-[#161622] border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-3.5 pr-8 text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all duration-200 cursor-pointer"
          >
            <option value="" disabled className="bg-[#13131a] text-gray-400">CTA Focus</option>
            {CTA_FOCUSES.map(g => <option key={g} value={g} className="bg-[#13131a] text-gray-200">{g}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
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

        <button
          onClick={() => onGenerate()}
          disabled={!canGenerate || isGenerating}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
            canGenerate && !isGenerating
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-95 hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              : 'bg-white/[0.04] text-gray-500 border border-white/10 cursor-not-allowed opacity-50'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white"></span>
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Generate Page
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
