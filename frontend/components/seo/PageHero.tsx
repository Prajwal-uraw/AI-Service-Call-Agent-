'use client';

import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

interface PageHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  trustIndicators?: string[];
  stats?: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
}

export default function PageHero({
  badge,
  title,
  subtitle,
  primaryCTA = { text: 'Schedule Demo', href: '/calendar' },
  secondaryCTA,
  trustIndicators = [],
  stats = []
}: PageHeroProps) {
  return (
    <section className="relative bg-white text-neutral-900 pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Animated floating orbs - Stripe style */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6 animate-fade-in">
                <span className="text-sm font-medium text-blue-900">{badge}</span>
              </div>
            )}
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight animate-fade-in">
              {title}
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-600 mb-10 leading-relaxed animate-fade-in" style={{animationDelay: '0.1s'}}>
              {subtitle}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <Link 
                href={primaryCTA.href}
                className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                {primaryCTA.text}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {secondaryCTA && (
                <Link 
                  href={secondaryCTA.href}
                  className="group inline-flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all"
                >
                  {secondaryCTA.text}
                </Link>
              )}
            </div>
            
            {/* Trust indicators */}
            {trustIndicators.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-600 animate-fade-in" style={{animationDelay: '0.3s'}}>
                {trustIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="text-green-600 w-5 h-5" />
                    <span>{indicator}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Stats Grid */}
          {stats.length > 0 && (
            <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-8 mt-16 pt-12 border-t border-neutral-200`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {stat.icon}
                    <div className="text-4xl font-bold text-neutral-900">{stat.value}</div>
                  </div>
                  <div className="text-sm text-neutral-600">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
