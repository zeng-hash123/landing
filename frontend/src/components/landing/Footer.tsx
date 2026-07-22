"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#0a0a0f] border-t border-white/10 text-gray-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight font-sans">
                Forge AI
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Landing pages that convert visitors into customers. Multi-agent AI built for marketing agencies.
            </p>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#agencies" className="hover:text-white transition-colors">For Agencies</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">App & Tools</h4>
            <ul className="space-y-2">
              <li><a href="/auth" className="hover:text-white transition-colors">Sign In</a></li>
              <li><a href="/auth" className="hover:text-white transition-colors">Sign Up Free</a></li>
              <li><a href="/chat" className="hover:text-white transition-colors">Generator Studio</a></li>
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ad Compliance Rules</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500">
          <p>© {new Date().getFullYear()} Forge AI Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Twitter</a>
            <a href="#" className="hover:text-gray-300">LinkedIn</a>
            <a href="#" className="hover:text-gray-300">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
