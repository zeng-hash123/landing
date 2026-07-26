"use client";

import React, { useState, useEffect } from 'react';
import { Send, Upload, Check, Sparkles, Square, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatLogEntry } from '../types';
import { DropdownControls } from './DropdownControls';

function AILoadingIndicator({ isGenerated }: { isGenerated: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = isGenerated ? [
    "Analyzing edit instruction...",
    "Updating section layout & copy...",
    "Re-assembling responsive page..."
  ] : [
    "Analyzing brief & ad content...",
    "Copywriter Agent crafting headlines...",
    "Designer Agent selecting modern layout...",
    "Compliance Agent checking ad guidelines...",
    "Assembling responsive PixelPage..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="flex justify-start my-2"
    >
      <div className="max-w-[92%] p-4 text-xs rounded-2xl bg-gradient-to-r from-[#171529] via-[#1a1733] to-[#171529] border border-violet-500/30 text-gray-200 shadow-[0_0_30px_rgba(124,58,237,0.15)] relative overflow-hidden backdrop-blur-xl">
        {/* Glowing top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-400 to-fuchsia-400 animate-pulse"></div>

        <div className="flex items-center gap-3">
          {/* Futuristic Glowing Spinner Orb */}
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 animate-spin opacity-80 blur-[2px]"></div>
            <div className="relative w-5.5 h-5.5 rounded-full bg-[#13131a] flex items-center justify-center border border-white/20">
              <Sparkles className="w-3 h-3 text-violet-300 animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
                {isGenerated ? 'PixelPage Editor' : 'PixelPage Multi-Agent AI'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 animate-pulse">
                PROCESSING
              </span>
            </div>

            {/* Dynamic Step Text */}
            <div className="h-5 mt-1 overflow-hidden relative flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] text-violet-200/90 font-medium truncate flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-ping shrink-0" />
                  <span>{steps[stepIndex]}</span>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
          <motion.div 
            initial={{ width: "10%" }}
            animate={{ width: "92%" }}
            transition={{ duration: 12, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full shadow-[0_0_12px_rgba(168,85,247,0.8)]"
          />
        </div>
      </div>
    </motion.div>
  );
}

interface ChatPanelProps {
  chatHistory: ChatLogEntry[];
  isGenerating: boolean;
  isGenerated: boolean;
  onGenerate: (prompt: string) => void;
  onEdit: (instruction: string) => void;
  onStopGeneration?: () => void;
  onNewProject?: () => void;
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
  chatHistory, isGenerating, isGenerated, onGenerate, onEdit, onStopGeneration, onNewProject,
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
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow-lg shadow-violet-500/20 overflow-hidden">
            <img src="/logo.jpg" alt="PixelPage Logo" className="w-full h-full object-contain rounded-md" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
              PixelPage <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">AI</span>
            </h1>
            <p className="text-[11px] text-gray-400">Landing Page Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNewProject && (
            <button
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 transition-all cursor-pointer shadow-xs shrink-0"
              title="Start a New Project"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          )}

          <button
            onClick={onOpenBrandKit}
            className={`relative group p-[1.5px] rounded-full transition-all cursor-pointer overflow-hidden ${
              brandKitActive 
                ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 shadow-md shadow-violet-500/25' 
                : 'bg-gradient-to-r from-violet-500/60 via-fuchsia-500/40 to-violet-500/60 hover:from-violet-500 hover:via-fuchsia-400 hover:to-pink-500 shadow-sm shadow-violet-500/10'
            }`}
          >
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all ${
              brandKitActive ? 'bg-[#161624] text-violet-200' : 'bg-[#13131a] text-gray-200 group-hover:bg-[#161622] group-hover:text-white'
            }`}>
              {brandKitActive ? <Check className="w-3.5 h-3.5 text-violet-400" /> : <Upload className="w-3.5 h-3.5 text-violet-400" />}
              <span>{brandKitActive ? 'Active' : 'Brand Kit'}</span>
            </div>
          </button>
        </div>
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
        
        {isGenerating && <AILoadingIndicator isGenerated={isGenerated} />}
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
          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGeneration}
              title="Stop generation"
              className="absolute bottom-3.5 right-3.5 p-2.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30 cursor-pointer flex items-center justify-center"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute bottom-3.5 right-3.5 p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white disabled:bg-white/5 disabled:text-gray-600 transition-all hover:opacity-95 active:scale-95 shadow-md shadow-violet-500/25 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <DropdownControls
          campaignGoal={campaignGoal} setCampaignGoal={setCampaignGoal}
          designVibe={designVibe} setDesignVibe={setDesignVibe}
          ctaFocus={ctaFocus} setCtaFocus={setCtaFocus}
          abTest={abTest} setAbTest={setAbTest}
          onGenerate={handleSubmit}
          isGenerating={isGenerating}
          prompt={input}
        />
      </div>
    </div>
  );
}
