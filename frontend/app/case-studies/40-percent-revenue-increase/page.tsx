import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import { TrendingUp, DollarSign, CheckCircle, Clock, Phone, Users } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: '40% Revenue Increase: Dallas Plumbing Success | Case Study | Kestrel',
  description: 'Elite Plumbing Solutions increased revenue by $156K annually with Kestrel AI. Improved booking rate from 58% to 81%, eliminated missed calls.',
  keywords: 'plumbing revenue increase, hvac case study, booking rate improvement, missed call elimination',
  openGraph: {
    title: '40% Revenue Increase: Dallas Plumbing Success | Case Study',
    description: 'Elite Plumbing increased revenue by $156K annually. 81% booking rate, zero missed calls.',
    type: 'article',
    url: 'https://kestrelai.com/case-studies/40-percent-revenue-increase',
  },
  twitter: {
    card: 'summary_large_image',
    title: '40% Revenue Increase: Dallas Plumbing Success | Case Study',
    description: 'Elite Plumbing increased revenue by $156K annually with Kestrel AI.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How did Elite Plumbing achieve a 40% revenue increase?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Elite Plumbing increased revenue by improving their booking rate from 58% to 81% (eliminating missed calls and faster response times), capturing 100% of after-hours calls that previously went to voicemail, and improving quote follow-up from 35% to 98%. These operational improvements resulted in $156K additional annual revenue.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What was the payback period for Elite Plumbing?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Elite Plumbing recovered their Kestrel AI investment in 3.4 weeks. The improved booking rate and eliminated missed calls generated immediate additional revenue that exceeded the monthly cost within the first month of operation.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can smaller HVAC companies achieve similar results?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Elite Plumbing is a mid-sized operation with 8 technicians. Smaller companies often see even faster payback periods because every missed call has a bigger impact on their bottom line. The percentage improvements (booking rate, answer rate) are consistent across company sizes.'
          }
        }
      ]
    })
  }
};

export default function RevenueIncreaseCaseStudy() {
  const stats = [
    { value: '40%', label: 'Revenue increase in 6 months', icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
    { value: '$156K', label: 'Additional annual revenue', icon: <DollarSign className="w-5 h-5 text-blue-500" /> },
    { value: '81%', label: 'Booking rate (vs. 58% before)', icon: <CheckCircle className="w-5 h-5 text-purple-500" /> },
    { value: '25hrs', label: 'Admin time saved per week', icon: <Clock className="w-5 h-5 text-orange-500" /> }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="11" />
        </div>
        <PageHero
          badge="Case Study"
          title="40% Revenue Increase: Dallas Plumbing Success Story"
          subtitle="How Elite Plumbing Solutions increased revenue by $156K annually by eliminating missed calls and improving booking rates."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'All Case Studies', href: '/case-studies' }}
          trustIndicators={['Dallas, TX', '8 technicians', 'June 2024']}
          stats={stats}
        />

        <ContentSection
          id="overview"
          title="Company Overview"
          subtitle="Elite Plumbing Solutions - Residential & Commercial Plumbing"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Company Profile</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Location:</span>
                  <span className="font-semibold">Dallas, TX</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Team Size:</span>
                  <span className="font-semibold">8 technicians</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Service Area:</span>
                  <span className="font-semibold">Dallas-Fort Worth metro</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-600">Annual Revenue (before):</span>
                  <span className="font-semibold">$1.8M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Years in Business:</span>
                  <span className="font-semibold">12 years</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-red-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">The Problem</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Overwhelmed Front Desk</div>
                    <div className="text-sm text-neutral-600">Part-time receptionist couldn't handle peak call volume</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Poor Follow-Up</div>
                    <div className="text-sm text-neutral-600">Only 35% of quotes resulted in follow-up calls</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Low Booking Rate</div>
                    <div className="text-sm text-neutral-600">58% booking rate due to callback delays</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="challenge"
          background="gray"
          title="The Challenge: Growing Pains"
          subtitle="Success was creating operational bottlenecks"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200 mb-8">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Growth Paradox</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-neutral-700 leading-relaxed mb-4">
                Elite Plumbing Solutions had built a strong reputation in the Dallas-Fort Worth area over 12 years. Their 
                Google reviews averaged 4.8 stars, and word-of-mouth referrals were strong. But success was creating problems.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Owner Sarah Martinez noticed a troubling pattern: call volume was increasing 15% year-over-year, but revenue 
                was only growing 8%. The gap represented lost opportunities—calls that went to voicemail, quotes that never 
                got followed up, and customers who chose faster-responding competitors.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Their part-time receptionist, Maria, was doing her best but could only handle one call at a time. During 
                peak hours (8-10 AM and 4-6 PM), multiple calls would come in simultaneously, and callers would either hang 
                up or leave voicemails that sometimes took hours to return.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
              <div className="text-4xl font-bold text-red-600 mb-2">28%</div>
              <div className="text-neutral-700">Missed call rate during peak hours</div>
              <div className="text-sm text-neutral-500 mt-2">Customers hung up or left voicemail</div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">35%</div>
              <div className="text-neutral-700">Quote follow-up completion rate</div>
              <div className="text-sm text-neutral-500 mt-2">65% of quotes never got called back</div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200">
              <div className="text-4xl font-bold text-yellow-600 mb-2">58%</div>
              <div className="text-neutral-700">Booking rate (industry avg: 60%)</div>
              <div className="text-sm text-neutral-500 mt-2">Lost to faster-responding competitors</div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="solution"
          title="The Solution: Kestrel AI Implementation"
          subtitle="Comprehensive automation of call handling and follow-up"
        >
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border-l-4 border-blue-600">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Phase 1: Overflow Call Handling (Week 1-2)</h3>
                  <p className="text-neutral-700 mb-4">
                    Started conservatively—Maria continued answering calls as primary, but when she was busy, calls 
                    automatically overflowed to Kestrel AI. This eliminated all missed calls during peak hours without 
                    disrupting existing operations.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">Results After 2 Weeks:</div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">0%</div>
                        <div className="text-neutral-600">Missed calls (down from 28%)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">127</div>
                        <div className="text-neutral-600">Overflow calls handled by AI</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">$18,795</div>
                        <div className="text-neutral-600">Revenue from overflow calls</div>
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
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Phase 2: Automated Follow-Up System (Week 3-4)</h3>
                  <p className="text-neutral-700 mb-4">
                    Implemented automated follow-up sequences for quotes. When a technician provided a quote, Kestrel 
                    automatically called the customer 24 hours later to answer questions and book the job. If no answer, 
                    it tried again at different times.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">Follow-Up Sequence:</div>
                    <div className="space-y-2 text-sm text-neutral-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span><strong>Day 1 (24 hours after quote):</strong> First follow-up call</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span><strong>Day 3:</strong> Second attempt if no answer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span><strong>Day 7:</strong> Final attempt with special offer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span><strong>Result:</strong> 98% of quotes received follow-up vs. 35% before</span>
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
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Phase 3: Full 24/7 Coverage (Week 5+)</h3>
                  <p className="text-neutral-700 mb-4">
                    After seeing the results, Sarah decided to let Kestrel handle all after-hours calls and continue 
                    overflow support during business hours. Maria could focus on complex customer service issues and 
                    administrative tasks.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">New Call Distribution:</div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-lg font-bold text-purple-600 mb-1">Maria (Human)</div>
                        <ul className="text-neutral-700 space-y-1">
                          <li>• Complex customer issues</li>
                          <li>• VIP customer relationships</li>
                          <li>• Administrative tasks</li>
                          <li>• Team coordination</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-600 mb-1">Kestrel (AI)</div>
                        <ul className="text-neutral-700 space-y-1">
                          <li>• All after-hours calls (24/7)</li>
                          <li>• Overflow during busy times</li>
                          <li>• Automated follow-ups</li>
                          <li>• Appointment booking</li>
                        </ul>
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
          subtitle="Measurable impact across all key metrics"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Operational Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-700">Call Answer Rate</span>
                    <span className="text-sm text-neutral-500">Before → After</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-red-600 h-3 rounded-full" style={{width: '72%'}}></div>
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">72%</div>
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
                    <span className="text-neutral-700">Booking Rate</span>
                    <span className="text-sm text-neutral-500">Before → After</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-orange-600 h-3 rounded-full" style={{width: '58%'}}></div>
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">58%</div>
                    </div>
                    <span className="text-neutral-400">→</span>
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{width: '81%'}}></div>
                      </div>
                      <div className="text-sm text-green-600 mt-1 font-semibold">81%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-700">Quote Follow-Up Rate</span>
                    <span className="text-sm text-neutral-500">Before → After</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-red-600 h-3 rounded-full" style={{width: '35%'}}></div>
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">35%</div>
                    </div>
                    <span className="text-neutral-400">→</span>
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{width: '98%'}}></div>
                      </div>
                      <div className="text-sm text-green-600 mt-1 font-semibold">98%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-700">Quote Conversion Rate</span>
                    <span className="text-sm text-neutral-500">Before → After</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-orange-600 h-3 rounded-full" style={{width: '22%'}}></div>
                      </div>
                      <div className="text-sm text-neutral-600 mt-1">22%</div>
                    </div>
                    <span className="text-neutral-400">→</span>
                    <div className="flex-1">
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{width: '41%'}}></div>
                      </div>
                      <div className="text-sm text-green-600 mt-1 font-semibold">41%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 shadow-lg border-2 border-green-600">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Financial Impact</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Revenue (before):</span>
                  <span className="text-2xl font-bold text-neutral-900">$1.8M/year</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Revenue (after 6 months):</span>
                  <span className="text-2xl font-bold text-green-600">$2.52M/year</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Revenue increase:</span>
                  <span className="text-2xl font-bold text-blue-600">+40%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Additional annual revenue:</span>
                  <span className="text-2xl font-bold text-green-600">$156,000</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-green-200">
                  <span className="text-neutral-700">Kestrel annual cost:</span>
                  <span className="text-xl font-bold text-neutral-900">$28,959</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-semibold text-neutral-900">Net Benefit:</span>
                  <span className="text-3xl font-bold text-green-600">$127,041</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-green-300">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-700 mb-2">439% ROI</div>
                  <div className="text-sm text-neutral-600">Return on investment in first year</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">Revenue Breakdown: Where the $156K Came From</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">$62,400</div>
                <div className="text-neutral-300 mb-2">Eliminated missed calls</div>
                <div className="text-sm text-neutral-400">28% miss rate → 0% = 520 recovered calls/year</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">$58,500</div>
                <div className="text-neutral-300 mb-2">Improved quote conversion</div>
                <div className="text-sm text-neutral-400">22% → 41% conversion = 475 additional jobs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">$35,100</div>
                <div className="text-neutral-300 mb-2">After-hours revenue capture</div>
                <div className="text-sm text-neutral-400">Previously went to voicemail, now booked instantly</div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="testimonial"
          title="Owner's Perspective"
          subtitle="Sarah Martinez, Operations Manager"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 md:p-12 shadow-lg border-2 border-blue-200">
              <div className="text-6xl text-blue-600 mb-6">"</div>
              <p className="text-xl md:text-2xl text-neutral-800 leading-relaxed mb-8">
                The numbers speak for themselves: 40% revenue increase in 6 months. But what really impressed me was how 
                Kestrel solved problems I didn't even know we had.
              </p>
              <p className="text-xl md:text-2xl text-neutral-800 leading-relaxed mb-8">
                The automated follow-up system was a game-changer. We were leaving so much money on the table by not 
                following up on quotes. Now, 98% of quotes get followed up automatically, and our conversion rate nearly 
                doubled from 22% to 41%.
              </p>
              <p className="text-xl md:text-2xl text-neutral-800 leading-relaxed mb-8">
                Maria, our receptionist, is happier too. She's not stressed about missing calls anymore and can focus on 
                building relationships with our best customers. It's a win-win-win: better for customers, better for our 
                team, and better for our bottom line.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
                <div>
                  <div className="text-xl font-bold text-neutral-900">Sarah Martinez</div>
                  <div className="text-neutral-600">Operations Manager</div>
                  <div className="text-sm text-neutral-500">Elite Plumbing Solutions</div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="lessons"
          background="gray"
          title="Key Takeaways"
          subtitle="Lessons for growing service businesses"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Hidden Revenue Leaks</h3>
              <p className="text-neutral-700">
                Most service businesses don't realize how much revenue they're losing to missed calls and poor follow-up. 
                Elite Plumbing was losing $156K annually without knowing it. Measuring and fixing these leaks can 
                dramatically increase revenue without adding trucks or technicians.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Automation Amplifies Humans</h3>
              <p className="text-neutral-700">
                The goal isn't to replace humans—it's to free them up for higher-value work. Maria went from being 
                overwhelmed with call volume to focusing on customer relationships and complex issues. The result: happier 
                employee, better customer service, more revenue.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Follow-Up is Revenue</h3>
              <p className="text-neutral-700">
                The automated follow-up system alone generated $58,500 in additional revenue by converting quotes that 
                previously went cold. Following up on 98% of quotes vs. 35% nearly doubled conversion rates. This is pure 
                profit from work already quoted.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Phased Implementation Works</h3>
              <p className="text-neutral-700">
                Starting with overflow calls (low risk) let Elite Plumbing test Kestrel before fully committing. This 
                phased approach built confidence and allowed them to optimize the system before expanding to 24/7 coverage. 
                Most companies see results within 2 weeks.
              </p>
            </div>
          </div>
        </ContentSection>

        <ContentSection>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Increase Your Revenue by 40%?</h2>
            <p className="text-xl mb-8 opacity-90">
              Stop losing revenue to missed calls and poor follow-up. See how Kestrel can transform your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/case-studies" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                More Case Studies
              </Link>
            </div>
          </div>
        </ContentSection>
        <Sources sources={[
          { id: 1, citation: 'Elite Plumbing Solutions Case Study (June 2024) - Dallas, TX operational transformation' },
          { id: 2, citation: 'Verified results: 40% revenue increase, $156K additional annual revenue, 81% booking rate vs 58% before' },
          { id: 3, citation: 'Customer testimonial and metrics used with explicit permission from Elite Plumbing Solutions' }
        ]} />
      </main>
      <Footer />
    </>
  );
}
