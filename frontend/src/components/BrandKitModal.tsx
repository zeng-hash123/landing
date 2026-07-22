"use client";

import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrandKit } from '../types';

interface BrandKitModalProps {
  onClose: () => void;
  onSave: (kit: BrandKit) => void;
  initialKit?: BrandKit;
}

export function BrandKitModal({ onClose, onSave, initialKit }: BrandKitModalProps) {
  const [kit, setKit] = useState<BrandKit>(initialKit || {
    primary_color: '#7c3aed',
    secondary_color: '#d946ef',
    text_color: '#ffffff',
    font_heading: 'Epilogue',
    font_body: 'Epilogue',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-[#13131a] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-bold text-white tracking-tight mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500"></span>
          Brand Kit Settings
        </h2>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Colors</h3>
            
            <div className="flex items-center gap-3">
              <input type="color" value={kit.primary_color} onChange={e => setKit({...kit, primary_color: e.target.value})} className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border border-white/10 p-0.5" />
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Primary Color</label>
                <input type="text" value={kit.primary_color} onChange={e => setKit({...kit, primary_color: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="color" value={kit.secondary_color} onChange={e => setKit({...kit, secondary_color: e.target.value})} className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border border-white/10 p-0.5" />
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Secondary Color</label>
                <input type="text" value={kit.secondary_color} onChange={e => setKit({...kit, secondary_color: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="color" value={kit.text_color} onChange={e => setKit({...kit, text_color: e.target.value})} className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border border-white/10 p-0.5" />
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                <input type="text" value={kit.text_color} onChange={e => setKit({...kit, text_color: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Typography</h3>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1">Heading Font</label>
              <input type="text" placeholder="e.g. Inter, Roboto" value={kit.font_heading} onChange={e => setKit({...kit, font_heading: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 block mb-1">Body Font</label>
              <input type="text" placeholder="e.g. Inter, Roboto" value={kit.font_body} onChange={e => setKit({...kit, font_body: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Logo</h3>
            <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/15 rounded-xl cursor-pointer bg-[#161622]/50 hover:bg-[#161622] transition-colors">
              {kit.logo_url ? (
                <div className="h-full w-full flex items-center justify-center p-2 relative">
                  <img src={kit.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="text-xs text-white font-medium">Change Logo</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Upload className="w-5 h-5 mb-1.5 text-violet-400" />
                  <span className="text-xs font-medium">Click to upload logo</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={() => onSave(kit)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-95 transition-all shadow-md shadow-violet-500/25 cursor-pointer">
            Save Brand Kit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
