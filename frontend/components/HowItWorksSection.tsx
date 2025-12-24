'use client';

import { Phone, Settings, TestTube, Rocket } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Phone,
      number: "01",
      title: "Discovery Call",
      description: "30-minute call to understand your business, services, pricing, and scheduling needs.",
      time: "Day 1",
      duration: "30 min"
    },
    {
      icon: Settings,
      number: "02",
      title: "AI Configuration",
      description: "We build your custom AI: scripts, integrations, voice personality, emergency protocols.",
      time: "Day 1-2",
      duration: "Zero work from you"
    },
    {
      icon: TestTube,
      number: "03",
      title: "Test & Refine",
      description: "Run test scenarios together. You approve, we adjust until it's perfect.",
      time: "Day 2",
      duration: "1 hour"
    },
    {
      icon: Rocket,
      number: "04",
      title: "Go Live",
      description: "Forward calls and start capturing revenue. We monitor and optimize continuously.",
      time: "Day 2+",
      duration: "Fully managed"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-4">
            <span className="text-sm font-medium text-blue-900">Simple process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Live in 48 hours
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            We handle everything. You focus on running your business.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-neutral-200 -translate-x-1/2 z-0"></div>
                  )}
                  
                  <div className="relative bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-bold text-neutral-400">{step.number}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {step.title}
                    </h3>
                    
                    <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-500">{step.time}</span>
                      <span className="font-medium text-blue-600">{step.duration}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* CTA */}
          <div className="text-center mt-12">
            <a 
              href="/calendar"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              Start your 48-hour setup
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
