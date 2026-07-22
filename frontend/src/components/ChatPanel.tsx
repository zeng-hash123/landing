"use client";

import React, { useState } from 'react';
import { Send, Upload, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="flex flex-col h-full bg-[#13131a] border-r border-white/10 p-4 md:p-6 w-full md:w-[420px] lg:w-[460px] shrink-0 overflow-y-auto z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              Forge <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-gray-400">Landing Page Generator</p>
          </div>
        </div>

        <button
          onClick={onOpenBrandKit}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            brandKitActive 
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-sm' 
              : 'glass-button text-gray-300 hover:text-white'
          }`}
        >
          {brandKitActive ? <Check className="w-3.5 h-3.5 text-violet-400" /> : <Upload className="w-3.5 h-3.5" />}
          <span>{brandKitActive ? 'Brand Kit Active' : 'Brand Kit'}</span>
        </button>
      </div>

      {/* Chat History / Empty State */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {chatHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-4 py-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center text-white shadow-[0_0_35px_rgba(124,58,237,0.2)]">
              <Sparkles className="w-8 h-8 text-violet-400" />
            </div>
            <div className="max-w-xs">
              <h2 className="text-lg font-bold text-white tracking-tight">Describe your perfect landing page</h2>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Or paste a product/ad URL to extract features and generate instantly.
              </p>
            </div>
          </motion.div>
        ) : (
          chatHistory.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex justify-end">
                <div className="max-w-[85%] p-3.5 text-xs message-bubble-user shadow-md leading-relaxed font-medium">
                  {msg.instruction}
                </div>
              </div>
              {msg.response && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3.5 text-xs message-bubble-system glass-panel text-gray-200 leading-relaxed shadow-xs">
                    {msg.response}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
        
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] p-3.5 text-xs message-bubble-system glass-panel flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-gray-400 ml-2 font-medium">
                {isGenerated ? 'Applying edit...' : 'Generating your page...'}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGenerated ? "Ask AI to edit the page..." : "Describe the page or paste an ad URL..."}
            className="w-full bg-[#161622] border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/80 resize-none transition-all duration-200 h-28 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute bottom-3.5 right-3.5 p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white disabled:bg-white/5 disabled:text-gray-600 transition-all hover:opacity-95 active:scale-95 shadow-md shadow-violet-500/25 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Send className="w-3.5 h-3.5" />
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
