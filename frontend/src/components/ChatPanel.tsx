"use client";

import React, { useState } from 'react';
import { Send, Upload, Check } from 'lucide-react';
import { ChatLogEntry } from '../types';
import { DropdownControls } from './DropdownControls';

interface ChatPanelProps {
  chatHistory: ChatLogEntry[];
  isGenerating: boolean;
  isGenerated: boolean;
  onGenerate: (prompt: string) => void;
  onEdit: (instruction: string) => void;
  brandKitActive: boolean;
  onOpenBrandKit: () => void;
  
  // Dropdown states
  campaignGoal: string;
  setCampaignGoal: (val: string) => void;
  designVibe: string;
  setDesignVibe: (val: string) => void;
  ctaFocus: string;
  setCtaFocus: (val: string) => void;
  abTest: boolean;
  setAbTest: (val: boolean) => void;
}

export function ChatPanel({
  chatHistory, isGenerating, isGenerated, onGenerate, onEdit,
  brandKitActive, onOpenBrandKit,
  campaignGoal, setCampaignGoal, designVibe, setDesignVibe,
  ctaFocus, setCtaFocus, abTest, setAbTest
}: ChatPanelProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;

    if (isGenerated) {
      onEdit(input);
    } else {
      // Auto-assign smart defaults if user didn't pick dropdowns yet
      const goal = campaignGoal || "Lead generation";
      const vibe = designVibe || "Bold & modern";
      const cta = ctaFocus || "Single strong CTA";
      
      if (!campaignGoal) setCampaignGoal(goal);
      if (!designVibe) setDesignVibe(vibe);
      if (!ctaFocus) setCtaFocus(cta);
      
      onGenerate(input);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border p-4 md:p-6 w-full md:w-[420px] lg:w-[460px] shrink-0 overflow-y-auto z-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
          AI Landing Page
        </h1>
        <button
          onClick={onOpenBrandKit}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            brandKitActive 
              ? 'bg-primary/20 text-primary border border-primary/30' 
              : 'glass-button text-text-muted hover:text-text'
          }`}
        >
          {brandKitActive ? <Check className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
          {brandKitActive ? 'Brand Kit Active' : 'Brand Kit'}
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-text-muted space-y-4">
            <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center gradient-bg opacity-80">
              <span className="text-2xl text-white">✨</span>
            </div>
            <div>
              <p className="font-medium text-text">Describe your perfect landing page</p>
              <p className="text-sm mt-1">Or paste a URL to generate from an existing ad.</p>
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div key={msg.id} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] p-3 text-sm message-bubble-user shadow-md">
                  {msg.instruction}
                </div>
              </div>
              {msg.response && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 text-sm message-bubble-system glass-panel">
                    {msg.response}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="max-w-[85%] p-4 text-sm message-bubble-system glass-panel flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-text-muted ml-2">
                {isGenerated ? 'Applying edit...' : 'Generating your page...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGenerated ? "Ask to edit the page..." : "Describe the page or paste an ad URL..."}
            className="w-full bg-surface-hover border border-border rounded-xl py-3 pl-4 pr-12 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary resize-none transition-colors h-24 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-primary text-white disabled:bg-surface disabled:text-text-muted transition-colors hover:bg-primary-hover shadow-lg cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {!isGenerated && (
          <DropdownControls
            campaignGoal={campaignGoal} setCampaignGoal={setCampaignGoal}
            designVibe={designVibe} setDesignVibe={setDesignVibe}
            ctaFocus={ctaFocus} setCtaFocus={setCtaFocus}
            abTest={abTest} setAbTest={setAbTest}
            onGenerate={handleSubmit}
            isGenerating={isGenerating}
            prompt={input}
          />
        )}
      </div>
    </div>
  );
}
