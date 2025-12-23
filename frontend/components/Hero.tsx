'use client';

import { Phone, ArrowRight, Check, Zap, Clock, TrendingUp, Shield, Award, Lock, CheckCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20 md:py-32 mt-16 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 animate-gradient-x"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <p className="text-blue-200 text-sm uppercase tracking-wide mb-4 font-semibold">
              Kestrel Voice Operations
            </p>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                Stop Losing $2M+ In Revenue
              </span>
              <br/>
              <span className="text-white">From Missed Calls & Poor Follow-Ups</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              AI-powered voice operations that never miss a lead, automatically follow up, 
              and close more deals. Built for service businesses handling 100+ calls/month.
            </p>
            
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <div className="text-2xl md:text-3xl font-bold text-white">200ms</div>
                </div>
                <div className="text-xs text-slate-400">Response Time</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-green-400" />
                  <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
                </div>
                <div className="text-xs text-slate-400">Always Available</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <div className="text-2xl md:text-3xl font-bold text-white">40%</div>
                </div>
                <div className="text-xs text-slate-400">More Bookings</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a 
                href="/calendar"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Phone size={20} />
                Book a Demo
              </a>
              <a 
                href="/case-studies"
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-lg text-lg font-semibold transition-all"
              >
                See Case Studies
                <ArrowRight size={20} />
              </a>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-blue-200 mb-6">
              <div className="flex items-center gap-2">
                <Check className="text-green-400" size={18} />
                48-Hour Setup
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-400" size={18} />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-400" size={18} />
                Cancel Anytime
              </div>
            </div>
            
            {/* Security Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>SOC 2 Certified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Lock className="w-4 h-4 text-green-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Award className="w-4 h-4 text-green-400" />
                <span>99.9% Uptime SLA</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Animated Demo */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Demo Container */}
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
                {/* Animated Phone Call Visualization */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Incoming Call</div>
                      <div className="text-slate-400 text-sm">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  
                  {/* Conversation Bubbles */}
                  <div className="space-y-3">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 animate-in slide-in-from-left">
                      <p className="text-sm text-white">"Hi, I need emergency AC repair..."</p>
                    </div>
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 ml-8 animate-in slide-in-from-right" style={{animationDelay: '0.5s'}}>
                      <p className="text-sm text-white">"I can help! What's your address?"</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 animate-in slide-in-from-left" style={{animationDelay: '1s'}}>
                      <p className="text-sm text-white">"123 Main St, Phoenix AZ"</p>
                    </div>
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 ml-8 animate-in slide-in-from-right" style={{animationDelay: '1.5s'}}>
                      <p className="text-sm text-white">"Perfect! Scheduling technician..."</p>
                    </div>
                  </div>
                  
                  {/* Success Indicator */}
                  <div className="flex items-center gap-2 pt-4 border-t border-white/10 animate-in fade-in" style={{animationDelay: '2s'}}>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-400 font-semibold">Appointment Booked</span>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
                <span className="text-sm font-bold">+$2,400 Revenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
