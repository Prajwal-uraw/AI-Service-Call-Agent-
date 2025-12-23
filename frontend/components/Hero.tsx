'use client';

import { ArrowRight, Check, Zap, Clock, TrendingUp, Shield, Sparkles, BarChart3 } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-white text-neutral-900 pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Animated floating orbs - Stripe style */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-gradient-to-br from-pink-500/15 to-orange-500/15 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Center-aligned hero content */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-blue-900">Proven in HVAC. Scaling to Service Industries.</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
              <span className="block mb-2 animate-fade-in" style={{animationDelay: '0.3s'}}>Autonomous Voice Operations Platform</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient animate-fade-in" style={{animationDelay: '0.4s'}}>
                for Service Businesses
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-600 mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.5s'}}>
              <span className="font-semibold text-neutral-900">Proven in HVAC.</span> Built to answer every call, qualify intent, and resolve workflows without human lift.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <a 
                href="/calendar"
                className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Book Workflow Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#demo"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-200 hover:border-neutral-300 px-8 py-4 rounded-lg text-lg font-semibold transition-all"
              >
                See Platform in 48 Hours
              </a>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Check className="text-green-600 w-5 h-5" />
                Enterprise-Grade Security
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-600 w-5 h-5" />
                <span className="font-medium">99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-600 w-5 h-5" />
                <span className="font-medium">Setup in 24 hours</span>
              </div>
            </div>
          </div>
          
          {/* Stats Grid - Stripe style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-neutral-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <div className="text-4xl font-bold text-neutral-900">200ms</div>
              </div>
              <div className="text-sm text-neutral-600">Response Speed — Enterprise-grade</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <div className="text-4xl font-bold text-neutral-900">24/7</div>
              </div>
              <div className="text-sm text-neutral-600">Coverage — No missed calls, no overtime</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div className="text-4xl font-bold text-neutral-900">40%</div>
              </div>
              <div className="text-sm text-neutral-600">Outcome — More booked appointments</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <div className="text-4xl font-bold text-neutral-900">$2M+</div>
              </div>
              <div className="text-sm text-neutral-600">Economic Impact — Revenue leakage recovered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
