"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

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
    <div className="flex flex-col gap-4 w-full p-4 glass-panel mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Campaign Goal */}
        <div className="relative">
          <select 
            value={campaignGoal} 
            onChange={e => setCampaignGoal(e.target.value)}
            className="w-full appearance-none bg-surface/50 border border-border rounded-lg py-2 px-3 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="" disabled>Campaign Goal</option>
            {CAMPAIGN_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none" />
        </div>

        {/* Design Vibe */}
        <div className="relative">
          <select 
            value={designVibe} 
            onChange={e => setDesignVibe(e.target.value)}
            className="w-full appearance-none bg-surface/50 border border-border rounded-lg py-2 px-3 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="" disabled>Design Vibe</option>
            {DESIGN_VIBES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none" />
        </div>

        {/* CTA Focus */}
        <div className="relative">
          <select 
            value={ctaFocus} 
            onChange={e => setCtaFocus(e.target.value)}
            className="w-full appearance-none bg-surface/50 border border-border rounded-lg py-2 px-3 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="" disabled>CTA Focus</option>
            {CTA_FOCUSES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-text-muted pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={abTest} 
              onChange={e => setAbTest(e.target.checked)} 
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${abTest ? 'bg-primary' : 'bg-surface-hover border border-border'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${abTest ? 'transform translate-x-4' : ''}`}></div>
          </div>
          <span className="ml-3 text-sm text-text-muted">A/B Variant (Optional)</span>
        </label>

        <button
          onClick={() => onGenerate()}
          disabled={!canGenerate || isGenerating}
          className={`px-6 py-2 rounded-lg font-medium text-sm transition-all shadow-lg ${
            canGenerate && !isGenerating
              ? 'gradient-bg text-white hover:opacity-90 hover:shadow-primary/25 cursor-pointer'
              : 'bg-surface-hover text-text-muted cursor-not-allowed opacity-50'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></span>
              Generating...
            </span>
          ) : 'Generate Page'}
        </button>
      </div>
    </div>
  );
}
