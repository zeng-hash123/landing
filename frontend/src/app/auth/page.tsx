"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getTargetUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_CHAT_UI_URL;
    if (!envUrl) return '/chat';
    if (envUrl.includes('/chat')) {
      return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;
    }
    return '/chat';
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');

    if (supabase) {
      try {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://pixelpage.site';
        const redirectUrl = `${currentOrigin}/chat`;

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });

        if (error) {
          console.error("Supabase Google OAuth error:", error);
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      } catch (e: any) {
        console.error("Google OAuth error:", e);
        setErrorMessage(e.message || "Failed to initiate Google OAuth sign-in");
        setIsLoading(false);
        return;
      }
    } else {
      localStorage.setItem('pixelpage_authenticated', 'true');
      localStorage.setItem('pixelpage_user_email', 'google.user@pixelpage.site');
      window.location.href = '/chat';
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (supabase) {
      try {
        if (mode === 'signup') {
          const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
          const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: `${currentOrigin}/chat`
            }
          });
          if (error) {
            setErrorMessage(error.message);
            setIsLoading(false);
            return;
          }
          if (data.session) {
            localStorage.setItem('pixelpage_authenticated', 'true');
            if (data.user?.email) localStorage.setItem('pixelpage_user_email', data.user.email);
            const targetUrl = getTargetUrl();
            if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
              window.location.href = targetUrl;
            } else {
              router.push(targetUrl);
            }
            return;
          } else {
            setErrorMessage("Confirmation email sent! Please check your inbox to complete sign up.");
            setIsLoading(false);
            return;
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            setErrorMessage(error.message);
            setIsLoading(false);
            return;
          }
          if (data.session) {
            localStorage.setItem('pixelpage_authenticated', 'true');
            if (data.user?.email) localStorage.setItem('pixelpage_user_email', data.user.email);
            const targetUrl = getTargetUrl();
            if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
              window.location.href = targetUrl;
            } else {
              router.push(targetUrl);
            }
            return;
          }
        }
      } catch (e: any) {
        console.error("Email auth error:", e);
        setErrorMessage(e.message || "Authentication failed");
        setIsLoading(false);
        return;
      }
    } else {
      // Fallback for local testing when Supabase env variables are not present
      const userEmail = email || 'user@pixelpage.com';
      localStorage.setItem('pixelpage_authenticated', 'true');
      localStorage.setItem('pixelpage_user_email', userEmail);
      localStorage.setItem('pixelpage_token', 'pixelpage_email_token_' + Date.now());
      
      const targetUrl = getTargetUrl();
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        window.location.href = targetUrl;
      } else {
        router.push(targetUrl);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d14] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Radial Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Back Link */}
      <div className="absolute top-6 left-6 sm:left-10 z-20">
        <a href="/" className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
          <span>← Back to PixelPage Home</span>
        </a>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#13131a] border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 p-2.5 flex items-center justify-center shadow-xl shadow-violet-500/20 mb-3 group hover:scale-105 transition-transform">
            <img src="/logo.jpg" alt="PixelPage Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
            PixelPage <span className="text-[10px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">AI</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {mode === 'signin' 
              ? 'Sign in to access your landing page generator studio' 
              : 'Create your account to start generating high-converting pages'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 text-center leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Auth Mode Toggle */}
        <div className="flex bg-[#161622] p-1 rounded-xl border border-white/10 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${mode === 'signin' ? 'bg-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${mode === 'signup' ? 'bg-violet-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-6">
          <button 
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] hover:border-white/20 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-[11px] text-gray-500 uppercase tracking-wider">or email</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                className="w-full bg-[#161622] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#161622] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/60 transition-all"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                <span>Processing...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>{mode === 'signin' ? 'Sign In & Launch Studio' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
