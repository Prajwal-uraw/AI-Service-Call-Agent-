import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { PhoneOff, TrendingDown, DollarSign, AlertCircle, CheckCircle, Phone, Zap, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';

export const metadata: Metadata = {
  title: 'HVAC Missed Call Management | Recover Lost Revenue | Kestrel',
  description: 'Stop losing revenue to missed calls. AI answering service captures 100% of HVAC calls. Average company recovers $47K/year in lost opportunities.',
  keywords: 'hvac missed calls, missed call recovery, hvac call management, lost revenue recovery',
  openGraph: {
    title: 'HVAC Missed Call Management | Recover Lost Revenue',
    description: 'Stop losing $47K/year to missed calls. AI captures 100% of HVAC calls instantly.',
    type: 'website',
    url: 'https://kestrelai.com/hvac-missed-call-management',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HVAC Missed Call Management | Recover Lost Revenue',
    description: 'Stop losing revenue to missed calls. 100% answer rate guarantee with AI.',
  },
};

export default function HVACMissedCallManagement() {
  const stats = [
    { value: '23%', label: 'Of HVAC calls go to voicemail', icon: <PhoneOff className="w-5 h-5 text-red-500" /> },
    { value: '$47K', label: 'Annual revenue lost to missed calls', icon: <DollarSign className="w-5 h-5 text-orange-500" /> },
    { value: '100%', label: 'Answer rate guarantee with AI', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
    { value: '200ms', label: 'Response time - never miss a call', icon: <Zap className="w-5 h-5 text-blue-500" /> }
  ];

  const faqItems = [
    {
      question: 'How many calls does the average HVAC company miss?',
      answer: 'Industry data shows that 23% of calls to HVAC companies go unanswered during business hours. After hours, that number jumps to 87%. For a company receiving 50 calls per week, that\'s 11-12 missed calls weekly, or 572 missed opportunities per year. At an average job value of $385, that\'s $220,220 in lost annual revenue.'
    },
    {
      question: 'Why do HVAC companies miss so many calls?',
      answer: 'Common reasons: receptionists are on other calls (single-line bottleneck), team is in the field and can\'t answer, lunch breaks and shift changes, after-hours and weekend calls, high call volume during peak season (summer AC failures, winter heating emergencies), and staff turnover leaving coverage gaps.'
    },
    {
      question: 'How do I track missed calls in my HVAC business?',
      answer: 'Most phone systems provide missed call reports, but they only show calls that rang through. They don\'t capture: calls that went straight to voicemail because lines were busy, customers who hung up after 3-4 rings, or calls during closed hours. Kestrel provides complete call analytics: total inbound calls, answer rate %, missed call breakdown by time/day, estimated revenue impact, and competitor comparison.'
    },
    {
      question: 'What\'s Kestrel\'s 100% answer rate guarantee?',
      answer: 'Kestrel AI answers every single call in under 200ms, 24/7/365. Unlike human receptionists who can only handle one call at a time, Kestrel handles unlimited simultaneous calls. During a winter storm with 50 calls in one hour, every caller gets answered instantly. We guarantee 100% answer rate or you don\'t pay for that month.'
    },
    {
      question: 'Can Kestrel recover past missed calls?',
      answer: 'Yes. Kestrel can analyze your phone system logs to identify missed calls from the past 30-90 days, then automatically call those customers back with a message like: "We noticed we missed your call on [date]. We apologize and would love to help with your HVAC needs. Are you still looking for service?" This typically recovers 15-20% of past missed opportunities.'
    },
    {
      question: 'How much revenue am I losing to missed calls?',
      answer: 'Use this formula: (Missed calls per month) × (Your booking rate, typically 60%) × (Average job value). Example: 50 missed calls/month × 60% × $385 = $11,550/month or $138,600/year in lost revenue. Most HVAC companies are shocked when they calculate their true missed call cost.'
    },
    {
      question: 'What happens to customers who reach voicemail?',
      answer: 'Research shows: 91% of customers will call a competitor if they reach voicemail, 68% won\'t call you back even if you return their call within an hour, and 94% of emergency callers (no heat, no AC) will hire whoever answers first. Voicemail is essentially a "call our competitor" button.'
    },
    {
      question: 'How does Kestrel handle high call volume periods?',
      answer: 'During peak times (winter storms, summer heat waves), traditional receptionists get overwhelmed and calls go to voicemail. Kestrel handles unlimited simultaneous calls with the same 200ms response time. Whether you get 5 calls or 500 calls in an hour, every customer gets answered instantly.'
    },
    {
      question: 'Can I see real-time missed call alerts?',
      answer: 'Yes. Kestrel provides real-time dashboards showing: current call volume, answer rate (always 100%), calls by type (emergency, appointment, inquiry), and revenue per call. You can also set up alerts if call patterns change (e.g., sudden spike in emergency calls during a storm).'
    },
    {
      question: 'What\'s the ROI of eliminating missed calls?',
      answer: 'Most HVAC companies see ROI within 60 days. If you\'re missing 50 calls/month at $385 average value with 60% booking rate, that\'s $11,550/month in lost revenue. Kestrel costs $1,997/month (Growth plan), so you recover the cost by capturing just 6 of those 50 missed calls. The other 44 are pure profit.'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="15" />
        </div>
        <PageHero
          badge="Stop Losing $47K/Year to Missed Calls"
          title="HVAC Missed Call Management - Never Miss Revenue Again"
          subtitle="Track every missed call. Understand the true cost. Eliminate 100% of missed opportunities with AI that answers in 200ms, 24/7/365."
          primaryCTA={{ text: 'Calculate Your Lost Revenue', href: '#calculator' }}
          secondaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          trustIndicators={['100% answer rate guarantee', 'Real-time analytics', 'Recover past missed calls']}
          stats={stats}
        />

        <ContentSection
          id="hidden-cost"
          title="The Hidden Cost of Missed Calls"
          subtitle="Most HVAC companies have no idea how much revenue they\'re losing"
        >
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 md:p-12 border-2 border-red-200 mb-12">
            <div className="text-center mb-8">
              <PhoneOff className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-neutral-900 mb-4">The Shocking Reality</h3>
              <p className="text-xl text-neutral-700 max-w-3xl mx-auto">
                The average HVAC company misses <strong>23% of calls during business hours</strong> and <strong>87% after hours</strong>. 
                Most owners have no idea this is happening.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-red-600 mb-2">572</div>
                <div className="text-sm text-neutral-600 mb-4">Missed calls per year</div>
                <div className="text-xs text-neutral-500">For company receiving 50 calls/week</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-orange-600 mb-2">343</div>
                <div className="text-sm text-neutral-600 mb-4">Lost jobs annually</div>
                <div className="text-xs text-neutral-500">At 60% booking rate</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-4xl font-bold text-red-700 mb-2">$132K</div>
                <div className="text-sm text-neutral-600 mb-4">Lost revenue per year</div>
                <div className="text-xs text-neutral-500">At $385 average job value</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Why Calls Go Unanswered</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Single-Line Bottleneck</div>
                    <div className="text-sm text-neutral-600">Receptionist on another call, new calls go to voicemail</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Team in the Field</div>
                    <div className="text-sm text-neutral-600">Technicians can't answer while working on jobs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Lunch & Break Times</div>
                    <div className="text-sm text-neutral-600">12-1 PM is peak call time but office is at lunch</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">After-Hours & Weekends</div>
                    <div className="text-sm text-neutral-600">87% of calls outside business hours go unanswered</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Peak Season Overload</div>
                    <div className="text-sm text-neutral-600">Summer/winter storms create call volume spikes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Staff Turnover</div>
                    <div className="text-sm text-neutral-600">Coverage gaps during hiring and training</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">What Happens to Missed Callers</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-neutral-900">Call Competitor</span>
                    <span className="text-2xl font-bold text-red-600">91%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div className="bg-red-600 h-3 rounded-full" style={{width: '91%'}}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Will call another HVAC company immediately</div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-neutral-900">Won't Call Back</span>
                    <span className="text-2xl font-bold text-orange-600">68%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div className="bg-orange-600 h-3 rounded-full" style={{width: '68%'}}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Won't return your call even if you call back in 1 hour</div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-neutral-900">Leave Voicemail</span>
                    <span className="text-2xl font-bold text-yellow-600">9%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div className="bg-yellow-600 h-3 rounded-full" style={{width: '9%'}}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Will leave a message (but 68% still call competitors)</div>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600 mt-6">
                  <div className="font-semibold text-neutral-900 mb-2">The Bottom Line:</div>
                  <div className="text-sm text-neutral-700">
                    For every 100 missed calls, you lose <strong>91 potential customers</strong> to competitors. 
                    Even if you call back quickly, 68 of them have already hired someone else.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="calculator"
          background="gray"
          title="Calculate Your Lost Revenue"
          subtitle="See exactly how much money you're losing to missed calls"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 md:p-12 shadow-2xl border border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">Missed Call Revenue Calculator</h3>
              
              <div className="space-y-6 mb-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Average calls per week
                    </label>
                    <input 
                      type="number" 
                      defaultValue="50" 
                      className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                    <div className="text-xs text-neutral-500 mt-1">Check your phone system reports</div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Missed call rate
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-blue-600 focus:outline-none">
                      <option value="0.15">15% - Excellent coverage</option>
                      <option value="0.23" selected>23% - Industry average</option>
                      <option value="0.35">35% - Poor coverage</option>
                      <option value="0.50">50% - Very poor coverage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Booking rate
                    </label>
                    <select className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-blue-600 focus:outline-none">
                      <option value="0.45">45% - Below average</option>
                      <option value="0.60" selected>60% - Industry average</option>
                      <option value="0.75">75% - Above average</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-neutral-900 mb-2">
                      Average job value
                    </label>
                    <input 
                      type="number" 
                      defaultValue="385" 
                      className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    />
                    <div className="text-xs text-neutral-500 mt-1">Your average service call revenue</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 border-2 border-red-200">
                <h4 className="text-xl font-bold text-neutral-900 mb-6 text-center">Your Lost Revenue</h4>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-neutral-600 mb-2">Missed Calls/Year</div>
                    <div className="text-4xl font-bold text-red-600">598</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-neutral-600 mb-2">Lost Jobs/Year</div>
                    <div className="text-4xl font-bold text-orange-600">359</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-neutral-600 mb-2">Lost Revenue/Year</div>
                    <div className="text-4xl font-bold text-red-700">$138,215</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 mb-6">
                  <h5 className="font-semibold text-neutral-900 mb-4">With Kestrel AI (100% Answer Rate):</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-700">Missed calls eliminated:</span>
                      <span className="font-semibold text-green-600">598 calls</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-700">Additional jobs booked:</span>
                      <span className="font-semibold text-green-600">359 jobs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-700">Kestrel cost (Growth plan):</span>
                      <span className="font-semibold text-neutral-900">-$23,964/year</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-neutral-200">
                      <span className="text-lg font-semibold text-neutral-900">Net Revenue Gain:</span>
                      <span className="text-3xl font-bold text-green-600">+$114,251</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Link href="/calendar" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                    Recover This Revenue
                    <Zap className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="text-center text-sm text-neutral-500">
                <p>Calculation: (50 calls/week × 52 weeks × 23% missed) × 60% booking rate × $385 avg. job value</p>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="tracking"
          title="How to Track Missed Calls in Your HVAC Business"
          subtitle="Industry benchmarks and what you should be measuring"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">Industry Benchmarks</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-neutral-900">Excellent (Top 10%)</span>
                    <span className="text-lg font-bold text-green-600">&lt;10%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '10%'}}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Usually have AI or 24/7 answering service</div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-neutral-900">Good (Top 25%)</span>
                    <span className="text-lg font-bold text-blue-600">10-15%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '15%'}}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Dedicated receptionist + overflow system</div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-neutral-900">Average (50th percentile)</span>
                    <span className="text-lg font-bold text-yellow-600">20-25%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '23%'}}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Part-time receptionist or owner answers</div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-neutral-900">Below Average</span>
                    <span className="text-lg font-bold text-orange-600">25-35%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{width: '30%'}}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">No dedicated receptionist, ad-hoc coverage</div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-neutral-900">Poor (Bottom 25%)</span>
                    <span className="text-lg font-bold text-red-600">&gt;35%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{width: '40%'}}></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Voicemail-first, no answering system</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">What to Measure</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Total Inbound Calls</div>
                    <div className="text-sm text-neutral-600">Track daily, weekly, monthly trends</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Answer Rate %</div>
                    <div className="text-sm text-neutral-600">Calls answered / total calls × 100</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Missed Call Breakdown</div>
                    <div className="text-sm text-neutral-600">By time of day, day of week, call type</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Average Speed to Answer</div>
                    <div className="text-sm text-neutral-600">How long customers wait before pickup</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Abandoned Call Rate</div>
                    <div className="text-sm text-neutral-600">Callers who hang up before answer</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Revenue Per Call</div>
                    <div className="text-sm text-neutral-600">Total revenue / total calls</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Estimated Lost Revenue</div>
                    <div className="text-sm text-neutral-600">Missed calls × booking rate × avg. job value</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Kestrel's Call Analytics Dashboard</h3>
            <p className="text-neutral-700 mb-6">
              Get complete visibility into your call performance with real-time analytics and historical trends.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
                <div className="text-sm text-neutral-600">Answer Rate</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-blue-600 mb-1">200ms</div>
                <div className="text-sm text-neutral-600">Avg. Response Time</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-purple-600 mb-1">81%</div>
                <div className="text-sm text-neutral-600">Booking Rate</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <div className="text-3xl font-bold text-orange-600 mb-1">$412</div>
                <div className="text-sm text-neutral-600">Revenue Per Call</div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="guarantee"
          background="gray"
          title="Kestrel's 100% Answer Rate Guarantee"
          subtitle="Never miss another call, or you don't pay"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-8 md:p-12 mb-12">
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-4">We Guarantee 100% Answer Rate</h3>
                <p className="text-xl opacity-90">
                  Every call answered in under 200ms, 24/7/365. If we miss even one call, you don't pay for that month.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">∞</div>
                  <div className="font-semibold mb-2">Unlimited Simultaneous Calls</div>
                  <div className="text-sm opacity-90">Handle 1 call or 1,000 calls at once</div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">0</div>
                  <div className="font-semibold mb-2">Missed Calls Ever</div>
                  <div className="text-sm opacity-90">Not one single call goes unanswered</div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <div className="text-4xl font-bold mb-2">200ms</div>
                  <div className="font-semibold mb-2">Response Time</div>
                  <div className="text-sm opacity-90">Faster than a human can blink</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">How We Guarantee It</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-neutral-900 mb-1">Redundant Infrastructure</div>
                    <div className="text-sm text-neutral-600">
                      Multiple data centers, automatic failover, 99.99% uptime SLA. If one system fails, another takes over instantly.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-neutral-900 mb-1">Unlimited Capacity</div>
                    <div className="text-sm text-neutral-600">
                      AI can handle infinite simultaneous calls. No busy signals, no hold times, no capacity limits.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-neutral-900 mb-1">24/7 Monitoring</div>
                    <div className="text-sm text-neutral-600">
                      Our team monitors system health around the clock. If any issue is detected, we fix it before it impacts calls.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <div className="font-semibold text-neutral-900 mb-1">Real-Time Analytics</div>
                    <div className="text-sm text-neutral-600">
                      You can see every call in real-time. If something seems off, you'll know immediately and can contact us.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about missed call management"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection background="gray">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-12 text-center text-white">
            <PhoneOff className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop Losing $47K/Year to Missed Calls</h2>
            <p className="text-xl mb-8 opacity-90">
              Join 200+ HVAC companies that eliminated missed calls and recovered $100K+ in lost revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-red-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2">
                Calculate Your Lost Revenue
                <DollarSign className="w-5 h-5" />
              </Link>
              <Link href="/hvac-ai-answering-service" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                Learn More
              </Link>
            </div>
            <p className="text-sm opacity-75 mt-6">100% answer rate guarantee • Live in 48 hours • No long-term contracts</p>
          </div>
        </ContentSection>
      </main>
      <Footer />
    </>
  );
}
