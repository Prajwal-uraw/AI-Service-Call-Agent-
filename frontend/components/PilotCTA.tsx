'use client';

import { ArrowRight, Zap, Shield } from 'lucide-react';

interface PilotCTAProps {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export default function PilotCTA({ variant = 'default', className = '' }: PilotCTAProps) {
  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white ${className}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Try Production Pilot</h3>
            <p className="text-blue-100 text-sm">7-day live evaluation • $199</p>
          </div>
          <a 
            href="/production-pilot"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all whitespace-nowrap"
          >
            Learn More
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg ${className}`}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-neutral-900 font-semibold mb-1">
              Not ready to commit? Start with a Production Pilot.
            </p>
            <p className="text-neutral-700 text-sm mb-3">
              Test KestrelVoice on your live phone line for 7 days. $199 credited toward full deployment.
            </p>
            <a 
              href="/production-pilot"
              className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
            >
              Learn about Production Pilot
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white shadow-2xl ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-yellow-300" />
          <span className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Production Pilot Available</span>
        </div>
        
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Test KestrelVoice on Your Live Phone Line
        </h3>
        
        <p className="text-xl text-blue-100 mb-6 max-w-2xl">
          Deploy on your real business number for 7 days. Measure calls answered, jobs booked, 
          and revenue recovered. Get an executive report with ROI analysis.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-300" />
            <span className="text-blue-100">Live production evaluation</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-300" />
            <span className="text-blue-100">$199 (credited if you continue)</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-300" />
            <span className="text-blue-100">Executive report included</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <a 
            href="/production-pilot"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Production Pilot
            <ArrowRight className="w-5 h-5" />
          </a>
          <a 
            href="/calendar"
            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all"
          >
            Book Demo First
          </a>
        </div>
      </div>
    </div>
  );
}
