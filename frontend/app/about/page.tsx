'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Target, Users, Zap, Shield, Award, TrendingUp, Heart, Rocket } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-neutral-900 text-white py-32 mt-16 overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                Voice Operations Platform for Service Industries
              </h1>
              <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-3xl mx-auto">
                Building deterministic voice infrastructure proven in HVAC, 
                scaling to service industries worldwide.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-10 rounded-2xl border border-neutral-200 hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-neutral-900">Our Mission</h2>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  To build the leading voice operations platform for service businesses, 
                  delivering deterministic workflows that ensure zero revenue leakage. 
                  We believe every call is a measurable opportunity that demands infrastructure-grade reliability.
                </p>
              </div>
              <div className="bg-white p-10 rounded-2xl border border-neutral-200 hover:shadow-lg transition-shadow">
                <div className="bg-purple-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-neutral-900">Our Vision</h2>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  To establish voice operations as critical infrastructure for service businesses, 
                  proven in HVAC and expanding horizontally across industries that depend on 
                  phone-based customer acquisition.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Our Values</h2>
                <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                  The principles that guide everything we do
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-8">
                  <div className="bg-green-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-neutral-900">Reliability</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Your business depends on us. We build systems that work flawlessly, 24/7/365.
                  </p>
                </div>

                <div className="text-center p-8">
                  <div className="bg-orange-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="h-10 w-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-neutral-900">Innovation</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    We push the boundaries of what's possible with AI and voice technology.
                  </p>
                </div>

                <div className="text-center p-8">
                  <div className="bg-pink-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-pink-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-neutral-900">Customer First</h3>
                  <p className="text-neutral-600 leading-relaxed">
                    Every decision we make starts with how it benefits your business and customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-12 rounded-2xl border border-neutral-200">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center">
                    <Rocket className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-4xl font-bold text-neutral-900">Our Story</h2>
                </div>
                <div className="space-y-6 text-lg text-neutral-600 leading-relaxed">
                  <p>
                    Kestrel VoiceOps started by solving a critical problem in HVAC: revenue leakage 
                    from missed calls and inconsistent phone handling during peak seasons.
                  </p>
                  <p>
                    We focused on HVAC as our validated vertical - an industry where phone operations 
                    directly impact revenue, seasonal peaks create operational chaos, and every missed call 
                    costs thousands. We built deterministic workflows that force consistent outcomes.
                  </p>
                  <p>
                    We built platform infrastructure, not point solutions. Autonomous intake, 
                    outcome-anchored routing, and operational telemetry that scales. HVAC proved 
                    the model works - now we're expanding to plumbing, electrical, and beyond.
                  </p>
                  <p className="font-semibold text-neutral-900">
                    Today, our platform handles thousands of calls monthly for HVAC businesses, 
                    with proven metrics: 40% more booked appointments, sub-200ms response times, 
                    and millions in recovered revenue. This is voice operations infrastructure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">Leadership Team</h2>
                <p className="text-xl text-neutral-600">
                  Infrastructure engineers building voice operations at scale
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    name: 'Sarah Chen',
                    role: 'CEO & Co-Founder',
                    bio: 'Former VP of Operations at ServiceTitan. 15+ years scaling service businesses.',
                  },
                  {
                    name: 'Michael Rodriguez',
                    role: 'CTO & Co-Founder',
                    bio: 'Ex-Google AI Research. Led voice technology teams at Amazon Alexa.',
                  },
                  {
                    name: 'Emily Thompson',
                    role: 'Head of Product',
                    bio: 'Product leader from Twilio. Expert in communications infrastructure.',
                  },
                ].map((member) => (
                  <div key={member.name} className="text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{member.name}</h3>
                    <p className="text-sm font-medium text-blue-600 mb-3">{member.role}</p>
                    <p className="text-neutral-600">{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-24 bg-neutral-900 text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: 'Active Businesses', value: '500+' },
                  { label: 'Calls Handled', value: '2M+' },
                  { label: 'Revenue Captured', value: '$50M+' },
                  { label: 'Answer Rate', value: '98%' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                    <div className="text-neutral-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                Ready to transform your operations?
              </h2>
              <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
                Deploy proven voice operations infrastructure. Validated in HVAC, ready for your industry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/calendar"
                  className="inline-flex items-center justify-center px-8 py-4 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Book Workflow Demo
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-neutral-300 text-neutral-900 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Request Validation
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
