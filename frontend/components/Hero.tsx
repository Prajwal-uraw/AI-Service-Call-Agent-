'use client';

import { Phone, ArrowRight, Check, Zap, Clock, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-32 mt-16 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-gradient-x"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        
        <p className="text-blue-200 text-sm uppercase tracking-wide mb-4">
          Kestrel - Custom-Built HVAC AI Call Agent
        </p>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
            Stop Losing $2M+ In Revenue
          </span>
          <br/>
          <span className="text-white">From Missed Calls & Poor Follow-Ups</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl leading-relaxed">
          AI-powered voice operations that never miss a lead, automatically follow up, 
          and close more deals. Built for service businesses handling 100+ calls/month.
        </p>
        
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mb-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div className="text-3xl font-bold text-white">200ms</div>
            </div>
            <div className="text-sm text-slate-400">Response Time</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-green-400" />
              <div className="text-3xl font-bold text-white">24/7</div>
            </div>
            <div className="text-sm text-slate-400">Always Available</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <div className="text-3xl font-bold text-white">40%</div>
            </div>
            <div className="text-sm text-slate-400">More Bookings</div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <a 
            href="/login"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Get Started Free
            <ArrowRight size={20} />
          </a>
          <a 
            href="/calendar"
            className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-lg text-lg font-semibold transition-all"
          >
            <Phone size={20} />
            Book a Demo
          </a>
        </div>
        
        <div className="flex flex-wrap items-center gap-8 text-sm text-blue-200">
          <div className="flex items-center gap-2">
            <Check className="text-green-400" size={20} />
            48-Hour Setup
          </div>
          <div className="flex items-center gap-2">
            <Check className="text-green-400" size={20} />
            Zero Technical Knowledge
          </div>
          <div className="flex items-center gap-2">
            <Check className="text-green-400" size={20} />
            We Do Everything For You
          </div>
        </div>
        
      </div>
    </section>
  );
}
