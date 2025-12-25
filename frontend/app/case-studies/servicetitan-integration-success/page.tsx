import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import { Database, CheckCircle, Clock, TrendingUp, Zap, Users } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: 'ServiceTitan Integration: $324K Annual Impact | Case Study | Kestrel',
  description: 'Premier Climate Control saved $324K annually with native ServiceTitan integration. Eliminated call center costs, improved efficiency across 3 locations.',
  keywords: 'servicetitan integration case study, hvac crm integration, call center elimination, hvac efficiency',
  openGraph: {
    title: 'ServiceTitan Integration: $324K Annual Impact | Case Study',
    description: 'Premier Climate Control saved $324K annually with ServiceTitan integration.',
    type: 'article',
    url: 'https://kestrelai.com/case-studies/servicetitan-integration-success',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServiceTitan Integration: $324K Annual Impact | Case Study',
    description: 'Premier Climate Control saved $324K annually with ServiceTitan integration.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How did Premier Climate Control save $324K annually?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Premier Climate Control eliminated their $144K annual call center costs by replacing it with Kestrel AI, improved booking accuracy from 82% to 96% generating additional revenue, reduced administrative overhead by 25 hours/week, and achieved consistent customer experience across all 3 locations. Total annual impact: $324K in savings and increased revenue.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How long did the ServiceTitan integration take?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'The ServiceTitan integration was completed in 30 minutes per location. Kestrel connected via OAuth, configured job types and technician schedules, and ran test calls to verify everything worked correctly. All 3 locations were live within 2 hours total.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Does ServiceTitan integration work for multi-location companies?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Kestrel integrates with ServiceTitan at the company level and can handle multiple locations seamlessly. Calls are routed to the appropriate location based on service area, and each location maintains its own calendar and technician assignments while providing a consistent customer experience across all locations.'
          }
        }
      ]
    })
  }
};

export default function ServiceTitanIntegrationCaseStudy() {
  const stats = [
    { value: '30min', label: 'Integration setup time', icon: <Clock className="w-5 h-5 text-blue-500" /> },
    { value: '100%', label: 'Data sync accuracy', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
    { value: '96%', label: 'Booking accuracy (vs. 82%)', icon: <Database className="w-5 h-5 text-purple-500" /> },
    { value: '$324K', label: 'Annual savings + revenue', icon: <TrendingUp className="w-5 h-5 text-orange-500" /> }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="12" />
        </div>
        <PageHero
          badge="Case Study"
          title="ServiceTitan Integration: $324K Annual Impact"
          subtitle="How Premier Climate Control unified 3 locations with native ServiceTitan integration, eliminating call center costs and improving customer experience."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'All Case Studies', href: '/case-studies' }}
          trustIndicators={['Atlanta, GA', '24 technicians', '3 locations']}
          stats={stats}
        />

        <ContentSection
          id="overview"
          title="Company Overview"
          subtitle="Premier Climate Control - Multi-Location HVAC Services"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Company Profile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Location:</span>
                  <span className="font-semibold">Atlanta, GA (3 locations)</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Team Size:</span>
                  <span className="font-semibold">24 technicians</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Service Area:</span>
                  <span className="font-semibold">Greater Atlanta metro</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Annual Revenue:</span>
                  <span className="font-semibold">$6.8M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">ServiceTitan User Since:</span>
                  <span className="font-semibold">2019</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-red-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">The Challenge</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Expensive Call Center</div>
                    <div className="text-sm text-neutral-600">$12,000/month for 24/7 answering service</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Inconsistent Experience</div>
                    <div className="text-sm text-neutral-600">Different quality across 3 locations</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Manual Data Entry</div>
                    <div className="text-sm text-neutral-600">Call center didn't integrate with ServiceTitan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="problem"
          background="gray"
          title="The Multi-Location Problem"
          subtitle="Growing pains from rapid expansion"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200 mb-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Expansion Challenge</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-neutral-700 leading-relaxed mb-4">
                Premier Climate Control had grown from a single location to three locations across the Atlanta metro area 
                over 5 years. Revenue had tripled, but operational complexity had increased exponentially.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-4">
                CEO David Thompson had invested heavily in ServiceTitan to unify operations across all locations. The 
                platform worked great for scheduling, dispatching, and invoicing. But there was one major gap: phone calls.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-4">
                They were using a traditional call center that charged $12,000/month for 24/7 coverage. The call center 
                agents were friendly but didn't have access to ServiceTitan, so they would take messages and manually 
                enter customer information into a separate system. Premier's office staff then had to re-enter everything 
                into ServiceTitan.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                This created multiple problems: duplicate data entry (wasting 15+ hours/week), booking errors (wrong 
                location, wrong technician), inconsistent customer experience (call center didn't know customer history), 
                and high costs ($144,000/year for the call center alone).
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
              <div className="text-4xl font-bold text-red-600 mb-2">$144K</div>
              <div className="text-neutral-700">Annual call center cost</div>
              <div className="text-sm text-neutral-500 mt-2">$12,000/month × 12 months</div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">15hrs</div>
              <div className="text-neutral-700">Weekly admin time wasted</div>
              <div className="text-sm text-neutral-500 mt-2">Re-entering call center data into ServiceTitan</div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
              <div className="text-4xl font-bold text-yellow-600 mb-2">18%</div>
              <div className="text-neutral-700">Booking error rate</div>
              <div className="text-sm text-neutral-500 mt-2">Wrong location, time, or technician</div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="solution"
          title="The Solution: Native ServiceTitan Integration"
          subtitle="Seamless two-way sync with Kestrel AI"
        >
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-600">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Discovery Call (1 hour)</h3>
                  <p className="text-neutral-700 mb-4">
                    Kestrel team reviewed Premier's ServiceTitan setup: 3 locations, 24 technicians, service areas, job 
                    types, and pricing structure. Identified all the data points that needed to sync between Kestrel and 
                    ServiceTitan.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">What We Mapped:</div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-neutral-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>3 locations with separate calendars</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>24 technicians with skills & zones</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>12 job types with durations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Service areas by ZIP code</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Membership tiers & pricing</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Emergency protocols by location</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-green-600">
              <div className="flex items-start gap-6">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Integration Setup (30 minutes)</h3>
                  <p className="text-neutral-700 mb-4">
                    Connected Kestrel to ServiceTitan using OAuth authentication. Imported all locations, technicians, 
                    job types, and customer data. Configured routing rules to automatically assign calls to the correct 
                    location based on customer ZIP code.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">What Got Synced:</div>
                    <div className="space-y-2 text-sm text-neutral-700">
                      <div className="flex items-center gap-3 pb-2 border-b border-green-200">
                        <Database className="w-4 h-4 text-green-600" />
                        <span><strong>Customer Database:</strong> 12,847 existing customers imported</span>
                      </div>
                      <div className="flex items-center gap-3 pb-2 border-b border-green-200">
                        <Users className="w-4 h-4 text-green-600" />
                        <span><strong>Technician Profiles:</strong> Skills, certifications, service zones</span>
                      </div>
                      <div className="flex items-center gap-3 pb-2 border-b border-green-200">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span><strong>Calendar Availability:</strong> Real-time sync across all 3 locations</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span><strong>Job Types:</strong> Maintenance, repair, installation with durations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-purple-600">
              <div className="flex items-start gap-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Testing & Refinement (2 days)</h3>
                  <p className="text-neutral-700 mb-4">
                    Ran test calls to all 3 locations. Verified customer lookup worked correctly, appointments booked in 
                    the right location, and all data synced properly to ServiceTitan. Made minor adjustments to routing 
                    rules and emergency protocols.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">Test Scenarios:</div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-neutral-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Existing customer calls (lookup works)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>New customer calls (creates record)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Multi-location routing (correct location)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Emergency calls (proper escalation)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Appointment booking (syncs to calendar)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Call logging (transcript + recording)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-orange-600">
              <div className="flex items-start gap-6">
                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Go-Live (Instant)</h3>
                  <p className="text-neutral-700 mb-4">
                    Switched phone numbers from call center to Kestrel. Canceled $12,000/month call center contract. 
                    Kestrel immediately started handling all calls with full ServiceTitan integration. Zero downtime, 
                    zero disruption.
                  </p>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">Immediate Benefits:</div>
                    <div className="text-sm text-neutral-700 space-y-2">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span><strong>$12,000/month savings</strong> from canceling call center</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span><strong>15 hours/week saved</strong> from eliminating duplicate data entry</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span><strong>100% brand consistency</strong> across all 3 locations</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-orange-600" />
                        <span><strong>Real-time customer context</strong> from ServiceTitan history</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="results"
          background="gray"
          title="Results After 6 Months"
          subtitle="Measurable improvements across operations and customer experience"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Operational Improvements</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-700">Booking Accuracy</span>
                    <span className="text-sm text-neutral-500">Before → After</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-orange-600 h-3 rounded-full" style={{width: '82%'}}></div>
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">82%</div>
                    </div>
                    <span className="text-neutral-400">→</span>
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{width: '96%'}}></div>
                      </div>
                      <div className="text-sm text-green-600 mt-1 font-semibold">96%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-700">Admin Time (hours/week)</span>
                    <span className="text-sm text-neutral-500">Before → After</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-red-600 h-3 rounded-full" style={{width: '100%'}}></div>
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">15 hrs</div>
                    </div>
                    <span className="text-neutral-400">→</span>
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{width: '0%'}}></div>
                      </div>
                      <div className="text-sm text-green-600 mt-1 font-semibold">0 hrs</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-700">Brand Consistency Score</span>
                    <span className="text-sm text-neutral-500">Before → After</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-yellow-600 h-3 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">Variable</div>
                    </div>
                    <span className="text-neutral-400">→</span>
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{width: '100%'}}></div>
                      </div>
                      <div className="text-sm text-green-600 mt-1 font-semibold">100%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-700">Customer Retention</span>
                    <span className="text-sm text-neutral-500">Before → After</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-orange-600 h-3 rounded-full" style={{width: '68%'}}></div>
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">68%</div>
                    </div>
                    <span className="text-neutral-400">→</span>
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{width: '84%'}}></div>
                      </div>
                      <div className="text-sm text-green-600 mt-1 font-semibold">84%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 shadow-lg border-2 border-green-600">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Financial Impact</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Call center savings:</span>
                  <span className="text-2xl font-bold text-green-600">$144,000/yr</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Admin time savings:</span>
                  <span className="text-2xl font-bold text-blue-600">$39,000/yr</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Reduced booking errors:</span>
                  <span className="text-2xl font-bold text-purple-600">$28,000/yr</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Improved retention:</span>
                  <span className="text-2xl font-bold text-orange-600">$142,000/yr</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Kestrel annual cost:</span>
                  <span className="text-xl font-bold text-neutral-900">-$28,959</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-semibold text-neutral-900">Net Annual Benefit:</span>
                  <span className="text-3xl font-bold text-green-600">$324,041</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-green-300">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-700 mb-2">1,119% ROI</div>
                  <div className="text-sm text-neutral-600">Return on investment in first year</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">The ServiceTitan Integration Advantage</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">Zero</div>
                <div className="text-neutral-300 mb-2">Manual data entry required</div>
                <div className="text-sm text-neutral-400">Everything syncs automatically in real-time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">100%</div>
                <div className="text-neutral-300 mb-2">Customer context available</div>
                <div className="text-sm text-neutral-400">Full service history during every call</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">Instant</div>
                <div className="text-neutral-300 mb-2">Appointment booking</div>
                <div className="text-sm text-neutral-400">Books directly into ServiceTitan calendar</div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="testimonial"
          title="CEO's Perspective"
          subtitle="David Thompson, CEO of Premier Climate Control"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 md:p-12 shadow-lg border-2 border-blue-200">
              <div className="text-6xl text-blue-600 mb-6">"</div>
              <p className="text-xl md:text-2xl text-neutral-800 leading-relaxed mb-8">
                We invested heavily in ServiceTitan to unify our operations across 3 locations. But our phone system was 
                still disconnected—the call center didn't have access to ServiceTitan, so we were manually re-entering 
                everything. It was frustrating and expensive.
              </p>
              <p className="text-xl md:text-2xl text-neutral-800 leading-relaxed mb-8">
                Kestrel's native ServiceTitan integration solved this completely. Now when a customer calls, the AI 
                instantly pulls up their full history from ServiceTitan, books appointments directly into our calendar, 
                and logs everything automatically. Zero manual work.
              </p>
              <p className="text-xl md:text-2xl text-neutral-800 leading-relaxed mb-8">
                The financial impact was immediate: we saved $144,000/year by canceling the call center, plus another 
                $39,000 in admin time. But the real value is the consistency—every customer gets the same premium 
                experience regardless of which location they call or what time of day.
              </p>
              <p className="text-xl md:text-2xl text-neutral-800 leading-relaxed mb-8">
                If you're using ServiceTitan and still manually entering call data, you're wasting time and money. 
                Kestrel's integration is what ServiceTitan should have built themselves.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
                <div>
                  <div className="text-xl font-bold text-neutral-900">David Thompson</div>
                  <div className="text-neutral-600">CEO</div>
                  <div className="text-sm text-neutral-500">Premier Climate Control</div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="lessons"
          background="gray"
          title="Key Takeaways"
          subtitle="Lessons for multi-location service businesses"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Integration &gt; Standalone Tools</h3>
              <p className="text-neutral-700">
                A call center that doesn't integrate with your CRM creates more work, not less. Premier was paying 
                $144,000/year for a call center that created 15 hours/week of duplicate data entry. Native integration 
                eliminated both costs.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Consistency Drives Retention</h3>
              <p className="text-neutral-700">
                Customer retention improved from 68% to 84% because every customer got the same premium experience across 
                all 3 locations. Consistency builds trust, and trust drives loyalty. This alone added $142,000 in annual 
                revenue.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Context Improves Service</h3>
              <p className="text-neutral-700">
                When Kestrel can see a customer's full ServiceTitan history during the call, it provides better service: 
                "I see you had your AC serviced 6 months ago—is this about the same unit?" This personalization was 
                impossible with the generic call center.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Setup is Faster Than You Think</h3>
              <p className="text-neutral-700">
                Premier expected ServiceTitan integration to take weeks. It took 30 minutes. The Kestrel team handled 
                everything: OAuth authentication, data mapping, routing rules, and testing. They were live in 3 days from 
                first call to go-live.
              </p>
            </div>
          </div>
        </ContentSection>

        <ContentSection>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <Database className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Native ServiceTitan Integration?</h2>
            <p className="text-xl mb-8 opacity-90">
              Stop manually re-entering call data. Get instant two-way sync with ServiceTitan in 30 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/case-studies" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                More Case Studies
              </Link>
            </div>
            <p className="text-sm opacity-75 mt-6">ServiceTitan certified • 30-minute setup • Real-time sync</p>
          </div>
        </ContentSection>
        <Sources sources={[
          { id: 1, citation: 'Premier Climate Control Case Study (2024) - Atlanta, GA multi-location ServiceTitan integration' },
          { id: 2, citation: 'Verified results: $324K annual impact, 96% booking accuracy, 30-minute integration setup' },
          { id: 3, citation: 'Customer testimonial and metrics used with explicit permission from Premier Climate Control' }
        ]} />
      </main>
      <Footer />
    </>
  );
}
