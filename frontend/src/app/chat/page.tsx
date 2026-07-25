"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatPanel } from '../../components/ChatPanel';
import { PreviewPanel } from '../../components/PreviewPanel';
import { BrandKitModal } from '../../components/BrandKitModal';
import { VersionHistory } from '../../components/VersionHistory';
import { ComplianceBanner } from '../../components/ComplianceBanner';
import { ChatLogEntry, BrandKit, VersionEntry, GenerateRequest, EditRequest } from '../../types';
import { generatePage, editPage, getVersions, revertVersion, getPage, getUserPlan, getUserPages } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { Sparkles, Check, ShieldCheck, Zap, X, ArrowRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_EMAIL = 'zeng07292@gmail.com';
const DODO_PAYMENT_URL = 'https://checkout.dodopayments.com/buy/pdt_0Njtj6vpds8u2k9BreAhC?quantity=1';

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
  const [abTest, setAbTest] = useState(true);
  
  // Versions
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string>('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Pricing Modal & Auth Loading states
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pixelpage_user_email') || localStorage.getItem('forge_user_email') || '';
    }
    return '';
  });
  const [userId, setUserId] = useState<string>('');
  const [isProUser, setIsProUser] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const isAdminUser = userEmail?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();

  const getCheckoutUrl = () => {
    if (userEmail) {
      return `${DODO_PAYMENT_URL}&email=${encodeURIComponent(userEmail)}&disableEmail=true`;
    }
    return DODO_PAYMENT_URL;
  };

  const handleOpenCheckout = () => {
    window.open(getCheckoutUrl(), '_blank');
  };

  // Sync user plan (Free, Pro, Admin)
  useEffect(() => {
    if (!userEmail) return;
    const cleanEmail = userEmail.toLowerCase().trim();
    if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
      setIsProUser(true);
      return;
    }
    const localPro = localStorage.getItem(`pixelpage_pro_${cleanEmail}`);
    if (localPro === 'true') {
      setIsProUser(true);
      return;
    }
    getUserPlan(cleanEmail).then(res => {
      if (res && (res.plan === 'pro' || res.plan === 'admin')) {
        setIsProUser(true);
        localStorage.setItem(`pixelpage_pro_${cleanEmail}`, 'true');
      }
    }).catch(console.error);
  }, [userEmail]);

  // Auth protection & Supabase OAuth session sync
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      if (typeof window === 'undefined') return;

      const hasOAuthCallback = window.location.hash.includes('access_token') || 
                               window.location.search.includes('code=') ||
                               window.location.search.includes('error=');

      if (supabase) {
        // Listen to Auth State Changes
        supabase.auth.onAuthStateChange((event, session) => {
          if (session && session.user && mounted) {
            localStorage.setItem('pixelpage_authenticated', 'true');
            if (session.user.id) setUserId(session.user.id);
            if (session.user.email) {
              localStorage.setItem('pixelpage_user_email', session.user.email);
              setUserEmail(session.user.email);
            }
            setAuthLoading(false);
          }
        });

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session && session.user && mounted) {
            localStorage.setItem('pixelpage_authenticated', 'true');
            if (session.user.id) setUserId(session.user.id);
            if (session.user.email) {
              localStorage.setItem('pixelpage_user_email', session.user.email);
              setUserEmail(session.user.email);
            }
            setAuthLoading(false);
            return;
          }
        } catch (e) {
          console.error("Supabase getSession error:", e);
        }
      }

      // Check local storage fallback
      const isAuth = localStorage.getItem('pixelpage_authenticated') || localStorage.getItem('forge_authenticated');
      const email = localStorage.getItem('pixelpage_user_email') || localStorage.getItem('forge_user_email');

      if (isAuth && mounted) {
        if (email) setUserEmail(email);
        setAuthLoading(false);
        return;
      }

      // If OAuth callback is processing in URL, wait 4s before redirecting to /auth
      if (hasOAuthCallback) {
        setTimeout(() => {
          if (!mounted) return;
          const retryAuth = localStorage.getItem('pixelpage_authenticated');
          if (retryAuth) {
            setAuthLoading(false);
          } else {
            router.push('/auth');
          }
        }, 4000);
      } else {
        if (mounted) {
          router.push('/auth');
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!userEmail) return;
    let isCancelled = false;
    const loadUserHistory = async () => {
      try {
        const userPages = await getUserPages(userEmail);
        if (isCancelled) return;
        if (userPages && userPages.length > 0) {
          const latest = userPages[0];
          if (latest && latest.id) {
            setPageId(latest.id);
            // Populate versions instantly from latest.versions if returned
            if (Array.isArray(latest.versions) && latest.versions.length > 0) {
              setVersions(latest.versions);
              setCurrentVersionId(latest.versions[0].id);
            } else {
              fetchVersions(latest.id);
            }
            // Fetch page HTML in parallel
            getPage(latest.id).then(pData => {
              if (!isCancelled && pData && pData.html) {
                setHtml(pData.html);
                setIsGenerated(true);
              }
            }).catch(err => console.error("Error loading page HTML:", err));
          }
        }
      } catch (e) {
        console.error("Failed loading user history:", e);
      }
    };
    loadUserHistory();
    return () => { isCancelled = true; };
  }, [userEmail]);

  // Execute prompt entered on homepage if present
  useEffect(() => {
    if (typeof window === 'undefined' || !userEmail) return;
    const initialPrompt = localStorage.getItem('pixelpage_initial_prompt');
    if (initialPrompt && initialPrompt.trim()) {
      localStorage.removeItem('pixelpage_initial_prompt');
      handleGenerate(initialPrompt);
    }
  }, [userEmail, isProUser, isAdminUser]);

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
    // Non-pro / non-admin safeguard: prompt payment modal immediately!
    if (!isAdminUser && !isProUser) {
      setShowPricingModal(true);
      return;
    }

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
        created_by: userEmail || userId || undefined,
      };

      const trimmed = prompt.trim();
      const isUrl = /^https?:\/\//i.test(trimmed) || /^([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(trimmed);

      if (isUrl) {
        req.ad_url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        req.prompt = `Create a high-converting landing page for ${trimmed}`;
      } else {
        req.prompt = trimmed;
      }

      const res = await generatePage(req);
      
      setHtml(res.html);
      if (res.html_b) setHtmlB(res.html_b);
      setPageId(res.page_id);
      setComplianceFlags(res.flags || []);
      setIsGenerated(true);
      
      // Update chat with response
      setChatHistory(prev => prev.map(msg => 
        msg.id === msgId ? { ...msg, response: "I've generated your PixelPage landing page! You can preview it on the right. Let me know if you want to make any edits." } : msg
      ));

      if (res.versions && res.versions.length > 0) {
        setVersions(res.versions);
        setCurrentVersionId(res.versions[0].id);
      } else {
        await fetchVersions(res.page_id);
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      const errDetail = error.message || "Server error";
      setChatHistory(prev => prev.map(msg => 
        msg.id === msgId ? { ...msg, response: `Sorry, there was an error generating your page: ${errDetail}` } : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async (instruction: string) => {
    // Non-pro / non-admin safeguard: prompt payment modal immediately!
    if (!isAdminUser && !isProUser) {
      setShowPricingModal(true);
      return;
    }

    if (!pageId) return;
    setIsGenerating(true);
    
    const msgId = Date.now().toString();

    try {
      const req: EditRequest = {
        page_id: pageId,
        edit_instruction: instruction,
        created_by: userEmail || userId || undefined,
      };

      const res = await editPage(req);
      
      setHtml(res.html);
      setActiveVariant('A'); // Switch back to A if editing
      
      setChatHistory(prev => [...prev, {
        id: msgId,
        type: 'edit',
        instruction,
        response: "I've applied your edits.",
        timestamp: new Date()
      }]);

      if (res.versions && res.versions.length > 0) {
        setVersions(res.versions);
        setCurrentVersionId(res.versions[0].id);
      } else {
        await fetchVersions(pageId);
      }
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        id: msgId,
        type: 'edit',
        instruction,
        response: "Sorry, there was an error applying your edit.",
        timestamp: new Date()
      }]);
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
      const v = versions.find(ver => ver.id === versionId);
      if (v) {
        setHtml(v.html);
        setCurrentVersionId(v.id);
      }
      await revertVersion(pageId, versionId);
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

  const handleSignOut = async () => {
    localStorage.removeItem('pixelpage_authenticated');
    localStorage.removeItem('pixelpage_user_email');
    localStorage.removeItem('promtpage_authenticated');
    localStorage.removeItem('promtpage_user_email');
    localStorage.removeItem('promtpage_token');
    localStorage.removeItem('forge_authenticated');
    localStorage.removeItem('forge_user_email');
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error("Sign out error:", e);
      }
    }
    router.push('/auth');
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#0d0d14] text-white flex flex-col items-center justify-center font-sans">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-500 border-t-transparent"></div>
          <span className="text-sm font-semibold text-gray-300">Verifying session...</span>
        </div>
      </main>
    );
  }

  const handleStopGeneration = () => {
    setIsGenerating(false);
    setChatHistory(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'ai',
      response: 'Session stopped by user.',
      timestamp: new Date()
    }]);
  };

  return (
    <main className="flex flex-row w-full h-screen overflow-hidden bg-[#0d0d14] text-white relative font-sans">
      <ComplianceBanner flags={complianceFlags} />

      <ChatPanel 
        chatHistory={chatHistory}
        isGenerating={isGenerating}
        isGenerated={isGenerated}
        onGenerate={handleGenerate}
        onEdit={handleEdit}
        onStopGeneration={handleStopGeneration}
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
        onOpenPricing={() => setShowPricingModal(true)}
        userEmail={userEmail}
        onSignOut={handleSignOut}
        isAdmin={isAdminUser}
        isPro={isProUser}
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
                className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/25">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-sans">PixelPage Unlimited Plan</h3>
                <p className="text-xs text-gray-400 mt-1">Subscription required to start generating and editing pages.</p>
              </div>

              <div className="bg-[#161622] border border-violet-500/40 p-6 rounded-2xl mb-6 relative overflow-hidden">
                <div className="flex items-baseline gap-1 mb-4">
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

              {/* Continue Unlimited Generation Button (Dodo Payments Checkout with locked email) */}
              <button
                onClick={handleOpenCheckout}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mb-4"
              >
                <span>Continue unlimited generation</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-white/5">
                <span>Account: <strong className="text-violet-300">{userEmail || 'Authenticated'}</strong></span>
                {isAdminUser ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Access
                  </span>
                ) : isProUser ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Unlimited Plan Active
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Subscription Required
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
