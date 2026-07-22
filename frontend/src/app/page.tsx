"use client";

import React, { useState } from 'react';
import { ChatPanel } from '../components/ChatPanel';
import { PreviewPanel } from '../components/PreviewPanel';
import { BrandKitModal } from '../components/BrandKitModal';
import { VersionHistory } from '../components/VersionHistory';
import { ComplianceBanner } from '../components/ComplianceBanner';
import { ChatLogEntry, BrandKit, VersionEntry, GenerateRequest, EditRequest } from '../types';
import { generatePage, editPage, getVersions, revertVersion, getPage } from '../lib/api';

export default function Home() {
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
        msg.id === msgId ? { ...msg, response: "I've generated your landing page! You can preview it on the right. Let me know if you want to make any edits." } : msg
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
      // Wait, we need the HTML of that version. Revert endpoint makes it active.
      // But getPage might not return pure HTML, we might need to find it from versions array
      const v = versions.find(ver => ver.id === versionId);
      if (v) {
        setHtml(v.html);
        setCurrentVersionId(v.id);
      }
      await fetchVersions(pageId); // Refresh versions list
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
    <main className="flex flex-row w-full h-screen overflow-hidden bg-background text-text">
      <ComplianceBanner flags={complianceFlags} />
      
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
    </main>
  );
}
