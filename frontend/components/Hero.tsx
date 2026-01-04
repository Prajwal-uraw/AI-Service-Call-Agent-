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
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight tracking-tight">
              <span className="block mb-2 animate-fade-in" style={{animationDelay: '0.3s'}}>Autonomous Voice Operations Platform</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient animate-fade-in" style={{animationDelay: '0.4s'}}>
                for Service Businesses
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-neutral-600 mb-8 leading-relaxed max-w-3xl mx-auto animate-fade-in" style={{animationDelay: '0.5s'}}>
              <span className="font-semibold text-neutral-900">Proven in HVAC.</span> Built to answer every call, qualify intent, and resolve workflows without human lift.
            </p>
            
            {/* Trust indicators - moved above CTAs for mobile */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm mb-8 animate-fade-in" style={{animationDelay: '0.55s'}}>
              <div className="flex items-center gap-2">
                <Check className="text-green-600 w-5 h-5" />
                <span className="font-medium">Live in 48 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-600 w-5 h-5" />
                <span className="font-medium">200+ companies trust us</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-600 w-5 h-5" />
                <span className="font-medium">No credit card</span>
              </div>
            </div>
            
            {/* Primary CTA - Voice Agent */}
            <div className="mb-6 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-xl shadow-2xl">
                <div className="bg-white rounded-lg px-8 py-6">
                  <div className="text-sm font-semibold text-neutral-600 mb-2">Try Our AI Agent Right Now</div>
                  <a 
                    href="tel:+19388396504"
                    className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    (938) 839-6504
                  </a>
                  <div className="text-xs text-neutral-500 mt-2">Call now • Experience AI in 30 seconds • No signup required</div>
                </div>
              </div>
            </div>
            
            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in" style={{animationDelay: '0.7s'}}>
              <a 
                href="/calendar"
                className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Book Live Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="/demo"
                className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-200 hover:border-neutral-300 px-6 py-3 rounded-lg text-base font-semibold transition-all"
              >
                Watch Video Demo
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </a>
            </div>
            
            {/* Additional trust signals */}
            <div className="text-sm text-neutral-500 animate-fade-in" style={{animationDelay: '0.75s'}}>
              <span className="inline-block px-3 py-1 bg-neutral-100 rounded-full mr-2">Enterprise Security</span>
              <span className="inline-block px-3 py-1 bg-neutral-100 rounded-full">99.9% Uptime SLA</span>
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
