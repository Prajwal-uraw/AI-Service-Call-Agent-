"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Target, Users, Zap, Shield, Award, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-24 mt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Transforming Service Operations with AI
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                We're on a mission to help service businesses capture every opportunity, 
                never miss a call, and scale operations without scaling overhead.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To empower service businesses with AI-powered voice operations that work 24/7, 
                  ensuring no customer inquiry goes unanswered and every opportunity is captured. 
                  We believe every call is a potential revenue opportunity that deserves professional handling.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To become the leading AI voice operations platform for service industries, 
                  enabling businesses to scale efficiently while maintaining exceptional customer 
                  service. We envision a future where AI seamlessly augments human teams.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-8 text-center">Our Story</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Kestrel was born from a simple observation: service businesses lose millions in 
                  revenue every year from missed calls, poor follow-ups, and after-hours inquiries. 
                  Traditional solutions were either too expensive, too complex, or simply didn't work.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Our founders, veterans of both the HVAC industry and enterprise software, saw an 
                  opportunity to leverage cutting-edge AI technology to solve this problem. Not with 
                  generic chatbots or DIY platforms that leave you struggling, but with custom-built, 
                  industry-specific AI agents that actually understand your business.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Today, we serve service businesses across North America, handling thousands of calls 
                  daily and helping our clients capture opportunities they would have otherwise missed. 
                  Our AI agents don't just answer phones—they understand context, handle emergencies, 
                  schedule appointments, and integrate seamlessly with existing workflows.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Speed & Reliability</h3>
                <p className="text-gray-600">
                  We deploy in 48 hours and maintain 99.9% uptime. Your business can't wait, 
                  and neither do we.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Trust & Security</h3>
                <p className="text-gray-600">
                  Enterprise-grade security, HIPAA-compliant infrastructure, and transparent 
                  operations you can rely on.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Excellence</h3>
                <p className="text-gray-600">
                  We don't do generic solutions. Every AI agent is custom-built for your specific 
                  business needs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
              <h2 className="text-4xl font-bold mb-12 text-center">Impact by the Numbers</h2>
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold mb-2">500+</div>
                  <div className="text-blue-100">Businesses Served</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">1M+</div>
                  <div className="text-blue-100">Calls Handled</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">99.9%</div>
                  <div className="text-blue-100">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">40%</div>
                  <div className="text-blue-100">Avg. Booking Increase</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-4 text-center">Leadership Team</h2>
            <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
              Industry veterans combining deep domain expertise with cutting-edge AI technology
            </p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-bold mb-2">Leadership Team</h3>
                <p className="text-blue-600 font-semibold mb-4">Founders & Executives</p>
                <p className="text-gray-600">
                  Combined 40+ years of experience in service industries, enterprise software, 
                  and AI/ML engineering.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-bold mb-2">Engineering Team</h3>
                <p className="text-purple-600 font-semibold mb-4">AI & Voice Technology</p>
                <p className="text-gray-600">
                  World-class engineers from leading tech companies, specializing in conversational 
                  AI and real-time voice systems.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6"></div>
                <h3 className="text-xl font-bold mb-2">Customer Success</h3>
                <p className="text-green-600 font-semibold mb-4">Support & Deployment</p>
                <p className="text-gray-600">
                  Dedicated team ensuring seamless deployment, ongoing optimization, and 
                  exceptional customer outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Operations?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join hundreds of service businesses that never miss an opportunity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/calendar"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  Schedule a Demo
                </a>
                <a
                  href="/contact"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Contact Us
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
