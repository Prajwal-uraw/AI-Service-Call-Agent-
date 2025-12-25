'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ReportLeadForm from '@/components/ReportLeadForm';
import { FileText, CheckCircle, BarChart3, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function SampleReportPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Real Production Pilot Results</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Download Sample
                <span className="block mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Pilot Report
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-neutral-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                See exactly what you'll receive after your production pilot. Real data, real analysis, real revenue opportunity modeling.
              </p>
            </div>
          </div>
        </section>

        {/* What's Inside Section */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                  What's Inside the Report
                </h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
                  This sample report is based on an actual 7-day production pilot with a mid-sized HVAC company.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    icon: BarChart3,
                    title: 'Performance Metrics',
                    description: '127 calls analyzed with 100% answer rate and detailed handling times',
                    color: 'blue'
                  },
                  {
                    icon: TrendingUp,
                    title: 'Call Leakage Analysis',
                    description: 'Identified $1.5M+ in annual revenue exposure from missed calls',
                    color: 'green'
                  },
                  {
                    icon: DollarSign,
                    title: 'Financial Modeling',
                    description: 'Conservative ROI projections showing 9,604% return on investment',
                    color: 'purple'
                  },
                  {
                    icon: Clock,
                    title: 'Efficiency Gains',
                    description: '51% faster call handling and 9.5 hours of admin time saved weekly',
                    color: 'orange'
                  },
                  {
                    icon: CheckCircle,
                    title: 'Booking Performance',
                    description: '38% conversion rate vs. 18-22% industry average',
                    color: 'emerald'
                  },
                  {
                    icon: FileText,
                    title: 'Deployment Pathways',
                    description: 'Three clear options with pricing and expected outcomes',
                    color: 'indigo'
                  }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="bg-white p-8 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                      <div className={`bg-${item.color}-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className={`w-7 h-7 text-${item.color}-600`} />
                      </div>
                      <h3 className="text-xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                      <p className="text-neutral-600">{item.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
                <h3 className="text-3xl font-bold mb-4">
                  Real Results from a Real Business
                </h3>
                <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
                  This isn't a hypothetical case study. It's actual data from a 7-day production pilot on a live HVAC business phone line.
                </p>
                <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
                  <div>
                    <div className="text-4xl font-bold mb-2">127</div>
                    <div className="text-blue-200">Calls Analyzed</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">$18.7K</div>
                    <div className="text-blue-200">Revenue Booked</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">100%</div>
                    <div className="text-blue-200">Answer Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Report Preview Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                  Report Sections
                </h2>
                <p className="text-xl text-neutral-600">
                  Comprehensive analysis across 6 major sections
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    section: 'Section 1',
                    title: 'Call Leakage & Capacity Analysis',
                    details: 'Peak-hour patterns, after-hours handling, and modeled revenue exposure'
                  },
                  {
                    section: 'Section 2',
                    title: 'Qualification & Operational Efficiency',
                    details: 'Call quality metrics, booking velocity, and time savings analysis'
                  },
                  {
                    section: 'Section 3',
                    title: 'Conservative Financial Opportunity Model',
                    details: 'Revenue projections, ROI analysis, and sensitivity modeling'
                  },
                  {
                    section: 'Section 4',
                    title: 'Operational Insights & Recommendations',
                    details: 'Call patterns, service mix breakdown, and customer experience metrics'
                  },
                  {
                    section: 'Section 5',
                    title: 'Deployment Pathways',
                    details: 'Three clear options with pricing, features, and expected outcomes'
                  },
                  {
                    section: 'Section 6',
                    title: 'Technical Performance & Methodology',
                    details: 'System reliability, integration performance, and data integrity notes'
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-neutral-50 p-6 rounded-xl border border-neutral-200">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-blue-600 font-semibold mb-1">{item.section}</div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">{item.title}</h3>
                        <p className="text-neutral-600">{item.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-24 bg-gradient-to-b from-neutral-50 to-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              {!showForm ? (
                <div className="text-center">
                  <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                    Ready to See the Full Report?
                  </h2>
                  <p className="text-xl text-neutral-600 mb-8">
                    Enter your details below to download the complete sample pilot report.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-lg text-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <FileText className="w-6 h-6" />
                    Get Your Free Sample Report
                  </button>
                  <p className="text-sm text-neutral-500 mt-4">
                    No credit card required • Instant download
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border-2 border-neutral-200 p-8 md:p-12 shadow-xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-3">
                      Download Sample Report
                    </h2>
                    <p className="text-neutral-600">
                      Fill out the form below to receive your free sample pilot report
                    </p>
                  </div>
                  <ReportLeadForm reportTitle="Sample Production Pilot Report" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 bg-neutral-900 text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-12">
                Why HVAC Operators Trust KestrelVoice
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { stat: '500+', label: 'Active Businesses' },
                  { stat: '2M+', label: 'Calls Handled' },
                  { stat: '$50M+', label: 'Revenue Captured' }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {item.stat}
                    </div>
                    <div className="text-neutral-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
