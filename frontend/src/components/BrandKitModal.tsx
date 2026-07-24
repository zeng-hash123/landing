"use client";

import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
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
    logo_url: '',
    reference_images: []
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

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

  const handleReferenceImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setKit(prev => ({
              ...prev,
              reference_images: [...(prev.reference_images || []), reader.result as string]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setKit(prev => ({
      ...prev,
      reference_images: [...(prev.reference_images || []), imageUrlInput.trim()]
    }));
    setImageUrlInput('');
  };

  const handleRemoveReferenceImage = (index: number) => {
    setKit(prev => ({
      ...prev,
      reference_images: (prev.reference_images || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-[#13131a] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-bold text-white tracking-tight mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500"></span>
          Brand Kit & Assets
        </h2>

        <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
          {/* Colors Section */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Brand Colors</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={kit.primary_color || '#7c3aed'} onChange={e => setKit({...kit, primary_color: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5 shrink-0" />
                  <input type="text" value={kit.primary_color || ''} onChange={e => setKit({...kit, primary_color: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 block">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={kit.secondary_color || '#d946ef'} onChange={e => setKit({...kit, secondary_color: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5 shrink-0" />
                  <input type="text" value={kit.secondary_color || ''} onChange={e => setKit({...kit, secondary_color: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 block">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={kit.text_color || '#ffffff'} onChange={e => setKit({...kit, text_color: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-white/10 p-0.5 shrink-0" />
                  <input type="text" value={kit.text_color || ''} onChange={e => setKit({...kit, text_color: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Typography</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Heading Font</label>
                <input type="text" placeholder="e.g. Epilogue, Inter, Outfit" value={kit.font_heading || ''} onChange={e => setKit({...kit, font_heading: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
              </div>
              
              <div>
                <label className="text-xs text-gray-400 block mb-1">Body Font</label>
                <input type="text" placeholder="e.g. Epilogue, Inter, Roboto" value={kit.font_body || ''} onChange={e => setKit({...kit, font_body: e.target.value})} className="w-full bg-[#161622] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-violet-500/80 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Brand Logo</h3>
            <label className="flex flex-col items-center justify-center w-full h-20 border border-dashed border-white/15 rounded-xl cursor-pointer bg-[#161622]/50 hover:bg-[#161622] transition-colors">
              {kit.logo_url ? (
                <div className="h-full w-full flex items-center justify-center p-2 relative">
                  <img src={kit.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="text-xs text-white font-medium">Change Logo</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400">
                  <Upload className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-medium">Click to upload logo image</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>

          {/* NEW: Reference Images Upload & Gallery */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
                Reference Images for AI
              </h3>
              <span className="text-[10px] text-gray-500">AI can use these in hero, feature & showcase sections</span>
            </div>

            {/* Upload Box */}
            <div className="flex flex-col gap-2">
              <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-violet-500/30 rounded-xl cursor-pointer bg-violet-500/5 hover:bg-violet-500/10 transition-colors group">
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <Upload className="w-5 h-5 mb-1 text-violet-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-white">Upload Reference Images</span>
                  <span className="text-[10px] text-gray-400">Select single or multiple image files</span>
                </div>
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleReferenceImagesUpload} />
              </label>

              {/* Paste URL Option */}
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Or paste image URL (https://...)" 
                  value={imageUrlInput}
                  onChange={e => setImageUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                  className="flex-1 bg-[#161622] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-violet-500/80 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3 py-1.5 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-200 text-xs font-medium hover:bg-violet-600/50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Image Gallery Thumbnails */}
            {kit.reference_images && kit.reference_images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {kit.reference_images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl bg-[#161622] border border-white/10 overflow-hidden shadow-sm">
                    <img src={imgUrl} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveReferenceImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-black/70 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
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
