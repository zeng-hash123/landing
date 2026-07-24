"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatPanel } from '../../components/ChatPanel';
import { PreviewPanel } from '../../components/PreviewPanel';
import { BrandKitModal } from '../../components/BrandKitModal';
import { VersionHistory } from '../../components/VersionHistory';
import { ComplianceBanner } from '../../components/ComplianceBanner';
import { ChatLogEntry, BrandKit, VersionEntry, GenerateRequest, EditRequest } from '../../types';
import { generatePage, editPage, getVersions, revertVersion, getPage } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { Sparkles, Check, ShieldCheck, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatStudioPage() {
  const router = useRouter();
  const [pageId, setPageId] = useState<string>('');
  const [html, setHtml] = useState<string>('');
  const [htmlB, setHtmlB] = useState<string>('');
  const [activeVariant, setActiveVariant] = useState<'A' | 'B'>('A');
  
  const [brandKit, setBrandKit] = useState<BrandKit | undefined>();
  const [brandKitActive, setBrandKitActive] = useState(false);
  const [showBrandKitModal, setShowBrandKitModal] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<ChatLogEntry[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [complianceFlags, setComplianceFlags] = useState<string[]>([]);
  
  // Dropdown states
  const [campaignGoal, setCampaignGoal] = useState('');
  const [designVibe, setDesignVibe] = useState('');
  const [ctaFocus, setCtaFocus] = useState('');
  const [abTest, setAbTest] = useState(false);
  
  // Versions
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Pricing Modal state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  // Auth protection & Supabase session sync
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return;

      let isAuth = localStorage.getItem('promtpage_authenticated') || localStorage.getItem('forge_authenticated');
      let email = localStorage.getItem('promtpage_user_email') || localStorage.getItem('forge_user_email');

      // Check real Supabase OAuth session upon redirect from Google
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user) {
            isAuth = 'true';
            email = session.user.email || 'google.user@promtpage.com';
            localStorage.setItem('promtpage_authenticated', 'true');
            if (session.user.email) {
              localStorage.setItem('promtpage_user_email', session.user.email);
            }
          }
        } catch (e) {
          console.error("Supabase session check error:", e);
        }
      }

      if (!isAuth) {
        const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || '/auth';
        router.push(authUrl);
      } else if (email) {
        setUserEmail(email);
      }
    };

    checkAuth();
  }, [router]);

  const fetchVersions = async (id: string) => {
    try {
      const v = await getVersions(id);
      const versionList = Array.isArray(v) ? v : [];
      setVersions(versionList);
      if (versionList.length > 0) {
        setCurrentVersionId(versionList[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    
    // Add user message
    const msgId = Date.now().toString();
    setChatHistory(prev => [...prev, {
      id: msgId,
      type: 'generate',
      instruction: prompt,
      timestamp: new Date()
    }]);

    try {
      const req: GenerateRequest = {
        campaign_goal: campaignGoal,
        design_vibe: designVibe,
        cta_focus: ctaFocus,
        ab_test: abTest,
        brand_kit: brandKitActive ? brandKit : undefined,
      };

      if (/^https?:\/\//i.test(prompt)) {
        req.ad_url = prompt;
      } else {
        req.prompt = prompt;
      }

      const res = await generatePage(req);
      
      setHtml(res.html);
      if (res.html_b) setHtmlB(res.html_b);
      setPageId(res.page_id);
      setComplianceFlags(res.flags || []);
      setIsGenerated(true);
      
      // Update chat with response
      setChatHistory(prev => prev.map(msg => 
        msg.id === msgId ? { ...msg, response: "I've generated your PromtPage landing page! You can preview it on the right. Let me know if you want to make any edits." } : msg
      ));

      if (res.versions && res.versions.length > 0) {
        setVersions(res.versions);
        setCurrentVersionId(res.versions[0].id);
      } else {
        await fetchVersions(res.page_id);
      }
    } catch (error) {
      console.error(error);
      setChatHistory(prev => prev.map(msg => 
        msg.id === msgId ? { ...msg, response: "Sorry, there was an error generating your page." } : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async (instruction: string) => {
    if (!pageId) return;
    setIsGenerating(true);
    
    const msgId = Date.now().toString();
    setChatHistory(prev => [...prev, {
      id: msgId,
      type: 'edit',
      instruction,
      timestamp: new Date()
    }]);

    try {
      const req: EditRequest = {
        page_id: pageId,
        edit_instruction: instruction,
      };

      const res = await editPage(req);
      
      setHtml(res.html);
      setActiveVariant('A'); // Switch back to A if editing
      
      setChatHistory(prev => prev.map(msg => 
        msg.id === msgId ? { ...msg, response: "I've applied your edits." } : msg
      ));

      if (res.versions && res.versions.length > 0) {
        setVersions(res.versions);
        setCurrentVersionId(res.versions[0].id);
      } else {
        await fetchVersions(pageId);
      }
    } catch (error) {
      console.error(error);
      setChatHistory(prev => prev.map(msg => 
        msg.id === msgId ? { ...msg, response: "Sorry, there was an error applying your edit." } : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveBrandKit = (kit: BrandKit) => {
    setBrandKit(kit);
    setBrandKitActive(true);
    setShowBrandKitModal(false);
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!pageId) return;
    try {
      await revertVersion(pageId, versionId);
      const page = await getPage(pageId);
      const v = versions.find(ver => ver.id === versionId);
      if (v) {
        setHtml(v.html);
        setCurrentVersionId(v.id);
      }
      await fetchVersions(pageId);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreviewVersion = (versionId: string) => {
    const v = versions.find(ver => ver.id === versionId);
    if (v) {
      setHtml(v.html);
      setCurrentVersionId(v.id);
    }
  };

  return (
    <main className="flex flex-row w-full h-screen overflow-hidden bg-[#0d0d14] text-white relative font-sans">
      <ComplianceBanner flags={complianceFlags} />
      
      {/* Top Header Plan Badge */}
      <div className="absolute top-3 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowPricingModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold shadow-lg hover:bg-violet-500/25 transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-violet-400" />
          <span>$49/mo Unlimited Plan</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      <ChatPanel 
        chatHistory={chatHistory}
        isGenerating={isGenerating}
        isGenerated={isGenerated}
        onGenerate={handleGenerate}
        onEdit={handleEdit}
        brandKitActive={brandKitActive}
        onOpenBrandKit={() => setShowBrandKitModal(true)}
        campaignGoal={campaignGoal} setCampaignGoal={setCampaignGoal}
        designVibe={designVibe} setDesignVibe={setDesignVibe}
        ctaFocus={ctaFocus} setCtaFocus={setCtaFocus}
        abTest={abTest} setAbTest={setAbTest}
      />
      
      <PreviewPanel 
        html={html}
        htmlB={htmlB}
        isGenerating={isGenerating}
        activeVariant={activeVariant}
        setActiveVariant={setActiveVariant}
        abTestActive={abTest}
        onToggleHistory={() => setShowVersionHistory(prev => !prev)}
        versionCount={versions.length}
      />

      <VersionHistory 
        versions={versions}
        currentVersionId={currentVersionId}
        isOpen={showVersionHistory}
        onOpen={() => setShowVersionHistory(true)}
        onClose={() => setShowVersionHistory(false)}
        onRestore={handleRestoreVersion}
        onPreview={handlePreviewVersion}
      />

      {showBrandKitModal && (
        <BrandKitModal 
          onClose={() => setShowBrandKitModal(false)}
          onSave={handleSaveBrandKit}
          initialKit={brandKit}
        />
      )}

      {/* Pricing Plan Modal ($49 / month Unlimited) */}
      <AnimatePresence>
        {showPricingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#13131a] border border-white/10 p-8 rounded-3xl max-w-md w-full relative shadow-2xl"
            >
              <button 
                onClick={() => setShowPricingModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/25">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">PromtPage Unlimited Plan</h3>
                <p className="text-xs text-gray-400 mt-1">Single simple plan for fast-growing agencies & marketers.</p>
              </div>

              <div className="bg-[#161622] border border-violet-500/40 p-6 rounded-2xl mb-6 relative overflow-hidden">
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-black text-white font-mono">$49</span>
                  <span className="text-xs text-gray-400">/ month</span>
                </div>

                <div className="space-y-2.5 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>Unlimited</strong> AI Landing Page Generations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full Multi-Agent AI (Copywriter, Designer, Compliance)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-World Web URL Scraper & Ad Brief Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Brand Kits & Google Fonts Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>A/B Variant Generator & Version History</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                <span>Account: <strong className="text-violet-300">{userEmail || 'Authenticated'}</strong></span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Plan Active
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
