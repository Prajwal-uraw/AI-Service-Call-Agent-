"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { TrendingUp, Phone, Clock, DollarSign, CheckCircle, ArrowRight } from "lucide-react";

const caseStudies = [
  {
    id: 1,
    company: "Comfort Pro HVAC",
    location: "Phoenix, AZ",
    industry: "HVAC Services",
    size: "12 technicians",
    challenge: "Missing 30% of after-hours calls, losing $180K annually in emergency service revenue",
    solution: "Deterministic workflows with outcome-anchored routing and enterprise-grade availability",
    results: [
      { metric: "Call Answer Rate", before: "70%", after: "99.8%", improvement: "+42%" },
      { metric: "After-Hours Bookings", before: "$15K/mo", after: "$38K/mo", improvement: "+153%" },
      { metric: "Response Time", before: "4.2 min", after: "12 sec", improvement: "-97%" },
      { metric: "Customer Satisfaction", before: "3.8/5", after: "4.7/5", improvement: "+24%" }
    ],
    testimonial: {
      quote: "Platform infrastructure that works. Deterministic workflows eliminated revenue leakage from missed calls. ROI was immediate and measurable.",
      author: "Michael Chen",
      role: "Owner, Comfort Pro HVAC"
    },
    roi: "$276K additional annual revenue",
    payback: "2.1 weeks"
  },
  {
    id: 2,
    company: "Elite Plumbing Solutions",
    location: "Dallas, TX",
    industry: "Plumbing Services",
    size: "8 technicians",
    challenge: "Overwhelmed front desk during peak hours, inconsistent follow-up on quotes",
    solution: "Platform integration with workflow orchestration and automated follow-up sequences",
    results: [
      { metric: "Quote Conversion", before: "22%", after: "41%", improvement: "+86%" },
      { metric: "Follow-up Completion", before: "35%", after: "98%", improvement: "+180%" },
      { metric: "Admin Time Saved", before: "0 hrs", after: "25 hrs/wk", improvement: "25 hrs" },
      { metric: "Booking Rate", before: "58%", after: "79%", improvement: "+36%" }
    ],
    testimonial: {
      quote: "Workflow orchestration paid for itself. We're capturing opportunities that previously went to competitors with faster response times.",
      author: "Sarah Martinez",
      role: "Operations Manager, Elite Plumbing"
    },
    roi: "$156K additional annual revenue",
    payback: "3.4 weeks"
  },
  {
    id: 3,
    company: "Premier Climate Control",
    location: "Atlanta, GA",
    industry: "HVAC Services",
    size: "24 technicians, 3 locations",
    challenge: "Inconsistent customer experience across locations, high call center costs",
    solution: "Multi-location platform deployment with deterministic workflows and ServiceTitan integration",
    results: [
      { metric: "Call Center Costs", before: "$12K/mo", after: "$3K/mo", improvement: "-75%" },
      { metric: "Brand Consistency", before: "Variable", after: "100%", improvement: "100%" },
      { metric: "Booking Accuracy", before: "82%", after: "96%", improvement: "+17%" },
      { metric: "Customer Retention", before: "68%", after: "84%", improvement: "+24%" }
    ],
    testimonial: {
      quote: "Consistent operational outcomes across all locations. Platform ensures deterministic workflows regardless of call volume or time of day.",
      author: "David Thompson",
      role: "CEO, Premier Climate Control"
    },
    roi: "$324K annual savings + increased revenue",
    payback: "1.8 weeks"
  }
];

export default function CaseStudiesPage() {
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
                Real Results from Real Businesses
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                HVAC-validated voice operations platform delivering measurable outcomes: 
                resolution rate, escalation load, revenue impact.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">40%</div>
                <div className="text-sm md:text-base text-gray-600">Avg. Revenue Increase</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">99.8%</div>
                <div className="text-sm md:text-base text-gray-600">Call Answer Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">2.3</div>
                <div className="text-sm md:text-base text-gray-600">Weeks Avg. Payback</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">$250K+</div>
                <div className="text-sm md:text-base text-gray-600">Avg. Annual Impact</div>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto space-y-16">
              {caseStudies.map((study, index) => (
                <div key={study.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  {/* Header */}
                  <div className={`p-8 md:p-12 ${
                    index % 2 === 0 ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-gradient-to-br from-purple-50 to-purple-100'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">{study.company}</h2>
                        <div className="flex flex-wrap gap-4 text-sm md:text-base text-gray-700">
                          <span>{study.location}</span>
                          <span>•</span>
                          <span>{study.industry}</span>
                          <span>•</span>
                          <span>{study.size}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end">
                        <div className="text-sm font-semibold text-gray-600 mb-1">ROI</div>
                        <div className="text-2xl md:text-3xl font-bold text-green-600">{study.roi}</div>
                        <div className="text-sm text-gray-600">Payback: {study.payback}</div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 md:p-12">
                    {/* Challenge & Solution */}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                      <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-600 font-bold">!</span>
                          </div>
                          Challenge
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{study.challenge}</p>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          Solution
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{study.solution}</p>
                      </div>
                    </div>

                    {/* Results Grid */}
                    <div className="mb-12">
                      <h3 className="text-2xl font-bold mb-6">Results</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {study.results.map((result, idx) => (
                          <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <div className="text-sm font-semibold text-gray-600 mb-3">{result.metric}</div>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-sm text-gray-500">Before:</span>
                              <span className="text-lg font-bold text-gray-700">{result.before}</span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-sm text-gray-500">After:</span>
                              <span className="text-lg font-bold text-blue-600">{result.after}</span>
                            </div>
                            <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                              <TrendingUp className="w-4 h-4" />
                              {result.improvement}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-xl border-l-4 border-blue-600">
                      <p className="text-lg md:text-xl text-gray-800 italic mb-6 leading-relaxed">
                        "{study.testimonial.quote}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
                        <div>
                          <div className="font-bold text-gray-900">{study.testimonial.author}</div>
                          <div className="text-sm text-gray-600">{study.testimonial.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Write Your Success Story?</h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Deploy voice operations infrastructure proven in HVAC, ready for your service vertical.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/calendar"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all duration-200 hover:shadow-xl hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  Book Workflow Demo
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="/contact"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Request Validation
                </a>
              </div>
              <p className="mt-6 text-blue-100 text-sm">
                48-hour deployment • Workflow validation included • Month-to-month terms
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
