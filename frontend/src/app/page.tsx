"use client";

import React from 'react';
import { Nav } from '../components/landing/Nav';
import { Hero } from '../components/landing/Hero';
import { SocialProof } from '../components/landing/SocialProof';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FeaturesGrid } from '../components/landing/FeaturesGrid';
import { BuiltForAgencies } from '../components/landing/BuiltForAgencies';
import { Testimonials } from '../components/landing/Testimonials';
import { PricingTeaser } from '../components/landing/PricingTeaser';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Footer } from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0d0d14] text-white flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      <Nav />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <FeaturesGrid />
      <BuiltForAgencies />
      <Testimonials />
      <PricingTeaser />
      <FinalCTA />
      <Footer />
    </main>
  );
}
