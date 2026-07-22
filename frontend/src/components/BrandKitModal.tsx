"use client";

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { BrandKit } from '../types';

interface BrandKitModalProps {
  onClose: () => void;
  onSave: (kit: BrandKit) => void;
  initialKit?: BrandKit;
}

export function BrandKitModal({ onClose, onSave, initialKit }: BrandKitModalProps) {
  const [kit, setKit] = useState<BrandKit>(initialKit || {
    primary_color: '#6366f1',
    secondary_color: '#a855f7',
    text_color: '#f8fafc',
    font_heading: 'Inter',
    font_body: 'Inter',
    logo_url: ''
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKit(prev => ({ ...prev, logo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-text transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 gradient-text">Brand Kit</h2>

        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Colors</h3>
            
            <div className="flex items-center gap-3">
              <input type="color" value={kit.primary_color} onChange={e => setKit({...kit, primary_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
              <div className="flex-1">
                <label className="text-xs text-text-muted block mb-1">Primary Color</label>
                <input type="text" value={kit.primary_color} onChange={e => setKit({...kit, primary_color: e.target.value})} className="w-full bg-surface/50 border border-border rounded px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="color" value={kit.secondary_color} onChange={e => setKit({...kit, secondary_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
              <div className="flex-1">
                <label className="text-xs text-text-muted block mb-1">Secondary Color</label>
                <input type="text" value={kit.secondary_color} onChange={e => setKit({...kit, secondary_color: e.target.value})} className="w-full bg-surface/50 border border-border rounded px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="color" value={kit.text_color} onChange={e => setKit({...kit, text_color: e.target.value})} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0" />
              <div className="flex-1">
                <label className="text-xs text-text-muted block mb-1">Text Color</label>
                <input type="text" value={kit.text_color} onChange={e => setKit({...kit, text_color: e.target.value})} className="w-full bg-surface/50 border border-border rounded px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Typography</h3>
            
            <div>
              <label className="text-xs text-text-muted block mb-1">Heading Font</label>
              <input type="text" placeholder="e.g. Inter, Roboto" value={kit.font_heading} onChange={e => setKit({...kit, font_heading: e.target.value})} className="w-full bg-surface/50 border border-border rounded px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none" />
            </div>
            
            <div>
              <label className="text-xs text-text-muted block mb-1">Body Font</label>
              <input type="text" placeholder="e.g. Inter, Roboto" value={kit.font_body} onChange={e => setKit({...kit, font_body: e.target.value})} className="w-full bg-surface/50 border border-border rounded px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Logo</h3>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer bg-surface/30 hover:bg-surface/50 transition-colors">
              {kit.logo_url ? (
                <div className="h-full w-full flex items-center justify-center p-2 relative">
                  <img src={kit.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-background/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white">Change Logo</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-text-muted">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-sm">Click to upload logo</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:text-text hover:bg-surface transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(kit)} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
            Save Brand Kit
          </button>
        </div>
      </div>
    </div>
  );
}
