'use client';

import { ArrowRight, Check } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-neutral-900 text-white relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      
      <div className="container mx-auto px-6 text-center relative z-10">
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
          Deploy Voice Operations in 48 Hours
        </h2>
        
        <p className="text-xl md:text-2xl text-neutral-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Proven infrastructure handling thousands of calls monthly. Start with workflow validation.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <a 
            href="/calendar"
            className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Book Workflow Demo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a 
            href="#pricing"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-lg text-lg font-semibold transition-all backdrop-blur-sm"
          >
            See Platform Pricing
          </a>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <Check className="text-green-400 w-5 h-5" />
            <span>Demo + call analysis included</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="text-green-400 w-5 h-5" />
            <span>Deploy in 48 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="text-green-400 w-5 h-5" />
            <span>Cancel anytime</span>
          </div>
        </div>
        
      </div>
    </section>
  );
}
