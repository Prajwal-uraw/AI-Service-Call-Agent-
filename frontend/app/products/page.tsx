'use client';

import { 
  Phone, Video, BarChart3, Users, Zap, Brain, 
  Headphones, Target, TrendingUp, Shield, Clock, 
  CheckCircle, ArrowRight, Sparkles, MessageSquare,
  PhoneCall, Calendar, Database, LineChart
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ProductsPage() {
  const coreProducts = [
    {
      icon: Phone,
      name: "AI Voice Agent",
      tagline: "24/7 Intelligent Call Handling",
      description: "Autonomous voice agent that answers calls, qualifies leads, books appointments, and handles customer inquiries with human-like conversation.",
      features: [
        "200ms response time",
        "Natural language understanding",
        "Multi-language support",
        "Emergency detection & routing",
        "Appointment scheduling",
        "CRM integration"
      ],
      pricing: "Starting at $199/mo",
      highlight: true
    },
    {
      icon: BarChart3,
      name: "Call Monitoring Dashboard",
      tagline: "Real-Time Call Intelligence",
      description: "Comprehensive dashboard for monitoring all calls, analyzing performance, and gaining insights into customer interactions.",
      features: [
        "Live call monitoring",
        "Call recordings & transcripts",
        "Performance analytics",
        "Sentiment analysis",
        "Custom reporting",
        "Team performance metrics"
      ],
      pricing: "Included in all plans"
    },
    {
      icon: Video,
      name: "Video Calling Platform",
      tagline: "Seamless Video Consultations",
      description: "Integrated video calling powered by Daily.co for remote consultations, demos, and customer support.",
      features: [
        "One-click room creation",
        "Screen sharing",
        "Call recording",
        "Calendar integration",
        "Mobile-friendly",
        "HD quality"
      ],
      pricing: "Starting at $49/mo"
    }
  ];

  const advancedFeatures = [
    {
      icon: PhoneCall,
      name: "Outbound Calling",
      description: "Automated outbound calling for follow-ups, reminders, and customer outreach campaigns.",
      capabilities: [
        "Appointment reminders",
        "Follow-up campaigns",
        "Lead nurturing",
        "Survey collection",
        "Payment reminders"
      ]
    },
    {
      icon: Brain,
      name: "AI Coach for Staff",
      description: "Real-time AI coaching that helps your team handle calls more effectively with live suggestions.",
      capabilities: [
        "Live call guidance",
        "Script suggestions",
        "Objection handling",
        "Upsell prompts",
        "Performance feedback"
      ]
    },
    {
      icon: Headphones,
      name: "Live Call Assist",
      description: "AI-powered assistance during live calls with real-time information lookup and response suggestions.",
      capabilities: [
        "Customer history lookup",
        "Product recommendations",
        "Pricing information",
        "Knowledge base search",
        "Next-best-action suggestions"
      ]
    },
    {
      icon: Target,
      name: "Lead Scraping & Qualification",
      description: "AI-powered lead generation and qualification engine that identifies hot prospects automatically.",
      capabilities: [
        "Automated lead discovery",
        "Hot vs. cold classification",
        "Intent detection",
        "Lead scoring",
        "Enrichment & validation"
      ]
    },
    {
      icon: LineChart,
      name: "Call Intelligence",
      description: "Advanced analytics and insights from every customer conversation to improve operations.",
      capabilities: [
        "Conversation analytics",
        "Trend identification",
        "Customer sentiment tracking",
        "Competitor mentions",
        "Revenue attribution"
      ]
    },
    {
      icon: MessageSquare,
      name: "Multi-Channel Support",
      description: "Extend AI capabilities to SMS, email, and chat for unified customer communication.",
      capabilities: [
        "SMS automation",
        "Email responses",
        "Live chat integration",
        "WhatsApp support",
        "Unified inbox"
      ]
    }
  ];

  const integrations = [
    { name: "ServiceTitan" },
    { name: "Salesforce" },
    { name: "HubSpot" },
    { name: "Twilio" },
    { name: "Stripe" },
    { name: "Cal.com" },
    { name: "Daily.co" },
    { name: "OpenAI" }
  ];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Complete Voice Operations Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Everything You Need to Automate Voice Operations
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                From AI voice agents to call intelligence, we provide the complete stack for modern service businesses.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:+19388396504"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <Phone className="w-5 h-5" />
                  Try AI Agent: (938) 839-6504
                </a>
                <a 
                  href="/calendar"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
                >
                  Schedule Demo
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Core Products */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Core Products
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Enterprise-grade solutions that work together seamlessly
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {coreProducts.map((product, index) => {
                const Icon = product.icon;
                return (
                  <div 
                    key={index}
                    className={`relative bg-white rounded-2xl p-8 transition-all ${
                      product.highlight 
                        ? 'border-2 border-blue-500 shadow-2xl scale-105' 
                        : 'border border-neutral-200 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {product.highlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-blue-600" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm font-semibold text-blue-600 mb-4">
                      {product.tagline}
                    </p>
                    
                    <p className="text-neutral-600 mb-6">
                      {product.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-neutral-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-neutral-200">
                      <div className="text-2xl font-bold text-neutral-900 mb-4">
                        {product.pricing}
                      </div>
                      <a 
                        href="/calendar"
                        className={`block text-center px-6 py-3 rounded-lg font-semibold transition-all ${
                          product.highlight
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900'
                        }`}
                      >
                        Get Started
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Advanced Features
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Powerful capabilities included in your subscription
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {advancedFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {feature.name}
                    </h3>
                    
                    <p className="text-neutral-600 mb-4 text-sm">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2">
                      {feature.capabilities.map((capability, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                          <span className="text-sm text-neutral-700">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Seamless Integrations
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                Works with the tools you already use
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {integrations.map((integration, index) => (
                <div 
                  key={index}
                  className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center hover:shadow-md transition-all"
                >
                  <div className="font-semibold text-neutral-900 text-lg">{integration.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Operations?
            </h2>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join 200+ service businesses using Kestrel AI to handle thousands of calls monthly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+19388396504"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg"
              >
                <Phone className="w-5 h-5" />
                Call AI Agent: (938) 839-6504
              </a>
              <a 
                href="/calendar"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
              >
                Schedule Demo
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
