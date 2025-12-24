'use client';

import { X, Check, TrendingDown, PhoneOff, Clock, DollarSign } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: PhoneOff,
      stat: "30%",
      title: "Missed calls during peak hours",
      impact: "$2M+ lost annually"
    },
    {
      icon: Clock,
      stat: "48hrs",
      title: "Average follow-up delay",
      impact: "Customers already hired competitors"
    },
    {
      icon: TrendingDown,
      stat: "60%",
      title: "After-hours calls go to voicemail",
      impact: "Emergency revenue lost"
    }
  ];

  const solutions = [
    "Answer every call in under 200ms",
    "Book appointments instantly, 24/7",
    "Follow up automatically within minutes",
    "Handle emergency calls at 2 AM",
    "Qualify leads while you sleep",
    "Never pay overtime or benefits"
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          
          {/* Problem Side - Dark */}
          <div className="bg-neutral-900 rounded-2xl p-12 relative overflow-hidden">
            {/* Gradient orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-block px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full mb-6">
                <span className="text-sm font-medium text-red-300">The Problem</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                You're losing $2M+ per year
              </h2>
              
              <p className="text-xl text-neutral-300 mb-8">
                Every missed call, delayed follow-up, and after-hours voicemail is revenue walking out the door.
              </p>
              
              <div className="space-y-6">
                {problems.map((problem, index) => {
                  const Icon = problem.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-3xl font-bold text-white mb-1">{problem.stat}</div>
                        <div className="text-sm text-neutral-300 mb-1">{problem.title}</div>
                        <div className="text-xs text-red-400 font-medium">{problem.impact}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Solution Side - Light */}
          <div>
            <div className="inline-block px-4 py-2 bg-green-50 border border-green-200 rounded-full mb-6">
              <span className="text-sm font-medium text-green-900">The Solution</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
              AI that works while you sleep
            </h2>
            
            <p className="text-xl text-neutral-600 mb-8">
              Never miss revenue again. Our AI answers every call, books every appointment, and follows up instantly.
            </p>
            
            <div className="space-y-4">
              {solutions.map((solution, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-lg text-neutral-700 group-hover:text-neutral-900 transition-colors">
                    {solution}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-4">
                <DollarSign className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold text-neutral-900 mb-1">$180K+ recovered</div>
                  <div className="text-sm text-neutral-600">Average customer sees ROI in first 90 days</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
