import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import ComparisonTable from '@/components/seo/ComparisonTable';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { TrendingDown, AlertCircle, Zap, DollarSign, Users, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';

export const metadata: Metadata = {
  title: 'HVAC Call Center Alternative | AI vs Traditional Service | Kestrel',
  description: 'Modern alternative to traditional HVAC call centers. AI-powered answering service with 200ms response time. Save 60% on costs, improve customer satisfaction.',
  keywords: 'hvac call center alternative, ai call center, hvac answering service, call center replacement',
  openGraph: {
    title: 'HVAC Call Center Alternative | AI vs Traditional',
    description: 'Replace traditional call centers with AI. 75% cost reduction, 200ms response time.',
    type: 'website',
    url: 'https://kestrelai.com/hvac-call-center-alternative',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HVAC Call Center Alternative | AI-Powered Service',
    description: 'Modern alternative to traditional HVAC call centers. Save 60% on costs.',
  },
};

export default function HVACCallCenterAlternative() {
  const stats = [
    { value: '75%', label: 'Cost reduction vs. traditional call centers', icon: <DollarSign className="w-5 h-5 text-green-500" /> },
    { value: '200ms', label: 'Response time vs. 30+ seconds', icon: <Zap className="w-5 h-5 text-blue-500" /> },
    { value: '99.2%', label: 'Accuracy without human error', icon: <CheckCircle className="w-5 h-5 text-purple-500" /> },
    { value: '0%', label: 'Turnover rate forever', icon: <Users className="w-5 h-5 text-orange-500" /> }
  ];

  const comparisonRows = [
    { feature: 'Monthly Cost (500 calls)', kestrel: '$1,997', competitor: '$5,000 - $8,000' },
    { feature: 'Setup Time', kestrel: '48 hours', competitor: '4-8 weeks' },
    { feature: 'Response Time', kestrel: '200ms', competitor: '30-45 seconds' },
    { feature: 'Call Quality Consistency', kestrel: '99.2%', competitor: '70-85%' },
    { feature: 'ServiceTitan Integration', kestrel: 'Native', competitor: 'Manual entry' },
    { feature: 'After-Hours Premium', kestrel: 'Included', competitor: '+50-100%' },
    { feature: 'Holiday Coverage', kestrel: 'Included', competitor: '+200% premium' },
    { feature: 'Scalability', kestrel: 'Instant unlimited', competitor: 'Hire more agents' },
    { feature: 'Training Required', kestrel: 'None', competitor: '2-4 weeks per agent' },
    { feature: 'Turnover Management', kestrel: 'Zero', competitor: 'Constant rehiring' }
  ];

  const faqItems = [
    {
      question: 'Why are HVAC companies switching from call centers to AI?',
      answer: 'Traditional call centers have three major problems: high cost ($5,000-$8,000/month), inconsistent quality (70-85% accuracy due to turnover and training gaps), and slow response times (30-45 seconds). AI answering services like Kestrel cost 75% less, maintain 99.2% accuracy, and respond in 200ms. Plus, AI integrates directly with ServiceTitan for instant appointment booking.'
    },
    {
      question: 'What are the main problems with traditional HVAC call centers?',
      answer: 'High cost ($60,000-$96,000/year), slow response times (customers wait 30-45 seconds), inconsistent quality due to high turnover (agents leave every 12-18 months), no ServiceTitan integration (manual data entry causes errors), expensive after-hours and holiday premiums (+50-200%), and limited scalability (must hire more agents for growth).'
    },
    {
      question: 'How does AI compare to offshore call centers?',
      answer: 'AI eliminates the common issues with offshore call centers: no accent or language barriers, no time zone coordination problems, no cultural misunderstandings about HVAC emergencies, instant ServiceTitan integration (vs. manual entry), and 200ms response time (vs. 30+ seconds). Plus, AI costs the same or less than offshore services.'
    },
    {
      question: 'Can AI handle the same volume as a call center?',
      answer: 'AI handles MORE volume than traditional call centers. While a call center agent can only handle one call at a time, Kestrel AI handles unlimited simultaneous calls. During a winter storm with 50+ calls per hour, every caller gets answered in 200ms—no busy signals, no hold times, no missed calls.'
    },
    {
      question: 'What happens to call quality during peak times?',
      answer: 'Call quality remains consistent at 99.2% accuracy regardless of volume. Traditional call centers see quality drop during peak times as agents rush through calls or put customers on long holds. AI maintains the same speed and accuracy whether handling 10 calls or 1,000 calls per day.'
    },
    {
      question: 'How long does it take to migrate from a call center to Kestrel AI?',
      answer: 'Most HVAC companies complete the migration in 48-72 hours. We import your call scripts, configure routing protocols, integrate with ServiceTitan, and run parallel testing. You can switch gradually (start with after-hours only) or do a full cutover. No disruption to your business.'
    },
    {
      question: 'Will my customers notice the difference?',
      answer: 'Yes, but in a good way. Customers notice faster response times (200ms vs. 30+ seconds), no hold music or transfers, instant appointment booking, and consistent quality. In blind tests, 94% of customers rate AI interactions as "excellent" or "good," compared to 67% for traditional call centers.'
    },
    {
      question: 'What if I have a contract with my current call center?',
      answer: 'Many HVAC companies run Kestrel AI in parallel during their contract period, using it for after-hours or overflow calls. This lets you compare performance and cost before fully switching. Some call center contracts have performance clauses that allow early termination if service levels aren\'t met.'
    },
    {
      question: 'Can I get references from other HVAC companies who switched?',
      answer: 'Yes. We have 200+ HVAC companies using Kestrel AI, many of whom switched from traditional call centers. We can connect you with similar-sized companies in your region who can share their experience with the migration process and results.'
    },
    {
      question: 'What\'s the ROI timeline for switching to AI?',
      answer: 'Most HVAC companies see positive ROI within 60-90 days. The combination of lower monthly costs ($1,997 vs. $5,000+), recovered revenue from faster response times, and eliminated after-hours premiums typically saves $40,000-$60,000 in the first year alone.'
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
          badge="The Modern Alternative to Traditional Call Centers"
          title="HVAC Call Center Alternative - Why Companies Are Switching to AI"
          subtitle="75% lower cost. 10x faster response. Zero turnover. Built specifically for HVAC contractors tired of expensive, inconsistent call center service."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'Migration Guide', href: '#migration' }}
          trustIndicators={['No long-term contracts', 'Live in 48 hours', '200+ HVAC companies switched']}
          stats={stats}
        />

        <ContentSection
          id="call-center-problems"
          title="The Traditional Call Center Model is Broken"
          subtitle="Why HVAC companies are abandoning expensive, outdated call centers"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 border-2 border-red-200">
              <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">The High Cost Problem</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">$5,000-$8,000/month base cost</div>
                    <div className="text-sm text-neutral-600">For 500-1,000 calls, business hours only</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">+50-100% after-hours premium</div>
                    <div className="text-sm text-neutral-600">Evenings and weekends cost double or triple</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">+200% holiday premium</div>
                    <div className="text-sm text-neutral-600">Christmas, Thanksgiving, New Year's cost 3x normal rate</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Per-minute overage fees</div>
                    <div className="text-sm text-neutral-600">Exceed your plan? Pay $2-$4 per additional minute</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-red-300">
                <div className="text-3xl font-bold text-red-700">$60K-$96K/year</div>
                <div className="text-sm text-neutral-600">Total annual cost for 24/7 coverage</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8 border-2 border-orange-200">
              <TrendingDown className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Quality Problem</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">30-45 second response time</div>
                    <div className="text-sm text-neutral-600">Customers wait while agents finish previous calls</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">70-85% call quality accuracy</div>
                    <div className="text-sm text-neutral-600">Inconsistent due to turnover and training gaps</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">High agent turnover (12-18 months)</div>
                    <div className="text-sm text-neutral-600">Constant retraining, inconsistent service</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Manual data entry errors</div>
                    <div className="text-sm text-neutral-600">No ServiceTitan integration, agents type notes manually</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-orange-300">
                <div className="text-3xl font-bold text-orange-700">15-30%</div>
                <div className="text-sm text-neutral-600">Calls mishandled or result in customer complaints</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Real Cost Example: Mid-Sized HVAC Company</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">Traditional Call Center Costs</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Base service (business hours):</span>
                    <span className="font-semibold">$6,000/mo</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">After-hours coverage (+75%):</span>
                    <span className="font-semibold">$4,500/mo</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Holiday premiums (avg.):</span>
                    <span className="font-semibold">$800/mo</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Overage fees (peak season):</span>
                    <span className="font-semibold">$1,200/mo</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-lg font-semibold">Total Monthly:</span>
                    <span className="text-2xl font-bold text-red-600">$12,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Annual Cost:</span>
                    <span className="text-xl font-bold text-red-600">$150,000</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">Hidden Costs</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Lost revenue (slow response):</span>
                    <span className="font-semibold">$18,000/yr</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Manual data entry errors:</span>
                    <span className="font-semibold">$8,500/yr</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Management time (5 hrs/week):</span>
                    <span className="font-semibold">$12,000/yr</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Customer complaints/rework:</span>
                    <span className="font-semibold">$6,500/yr</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-lg font-semibold">Hidden Costs:</span>
                    <span className="text-2xl font-bold text-orange-600">$45,000</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-neutral-300">
                    <span className="font-semibold text-lg">True Annual Cost:</span>
                    <span className="text-2xl font-bold text-red-700">$195,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="why-switching"
          background="gray"
          title="Why HVAC Companies Are Switching to AI"
          subtitle="Real reasons from contractors who made the switch"
        >
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">1</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Cost Savings</h3>
              <p className="text-neutral-700 mb-4">
                "We were paying $8,500/month to our call center. Kestrel costs $1,997/month and does a better job. 
                That's $78,000 saved in the first year alone."
              </p>
              <div className="text-sm text-neutral-500">— Mike T., Phoenix HVAC</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">2</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Consistent Quality</h3>
              <p className="text-neutral-700 mb-4">
                "Our call center had 40% agent turnover last year. Every time a new agent started, we'd get complaints 
                about wrong information. Kestrel is consistent every single call."
              </p>
              <div className="text-sm text-neutral-500">— Sarah L., Dallas HVAC</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">3</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">ServiceTitan Integration</h3>
              <p className="text-neutral-700 mb-4">
                "The call center agents would take notes, then our office staff had to manually enter everything into 
                ServiceTitan. Kestrel does it automatically while the customer is on the phone."
              </p>
              <div className="text-sm text-neutral-500">— Tom R., Houston HVAC</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">4</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Speed</h3>
              <p className="text-neutral-700 mb-4">
                "Customers would wait 30-45 seconds for an agent to pick up. During winter storms, some calls went to 
                voicemail because all agents were busy. Kestrel answers in 200ms, every time."
              </p>
              <div className="text-sm text-neutral-500">— Jennifer K., Chicago HVAC</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">5</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">No More Premiums</h3>
              <p className="text-neutral-700 mb-4">
                "After-hours and holiday coverage cost us an extra $4,000/month with the call center. Kestrel includes 
                24/7/365 coverage at no extra charge. That alone saves us $48K/year."
              </p>
              <div className="text-sm text-neutral-500">— David M., Atlanta HVAC</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold mb-4">6</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Scalability</h3>
              <p className="text-neutral-700 mb-4">
                "When we grew from 5 to 12 trucks, the call center wanted to double our monthly fee. Kestrel handles 
                unlimited calls at the same price. No negotiation, no surprises."
              </p>
              <div className="text-sm text-neutral-500">— Carlos S., Miami HVAC</div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="comparison"
          title="Kestrel AI vs. Traditional Call Centers"
          subtitle="Side-by-side feature and cost comparison"
        >
          <ComparisonTable
            title="Feature-by-Feature Comparison"
            competitorName="Traditional Call Center"
            rows={comparisonRows}
          />

          <div className="mt-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-600">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Annual Savings Breakdown</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">What You Save</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Lower monthly fees:</span>
                    <span className="font-semibold text-green-600">$48,036/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">No after-hours premiums:</span>
                    <span className="font-semibold text-green-600">$27,000/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">No holiday premiums:</span>
                    <span className="font-semibold text-green-600">$9,600/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">No overage fees:</span>
                    <span className="font-semibold text-green-600">$14,400/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Eliminated management time:</span>
                    <span className="font-semibold text-green-600">$12,000/year</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">What You Gain</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Faster response (more conversions):</span>
                    <span className="font-semibold text-blue-600">$18,000/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Zero data entry errors:</span>
                    <span className="font-semibold text-blue-600">$8,500/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Reduced customer complaints:</span>
                    <span className="font-semibold text-blue-600">$6,500/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">After-hours revenue capture:</span>
                    <span className="font-semibold text-blue-600">$32,000/year</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Instant ServiceTitan booking:</span>
                    <span className="font-semibold text-blue-600">$15,000/year</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-green-300 text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">$191,036 Total Annual Benefit</div>
              <p className="text-neutral-700">Savings + recovered revenue in first year</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="migration"
          background="gray"
          title="Migration Guide: From Call Center to Kestrel AI"
          subtitle="Step-by-step process to switch without disrupting your business"
        >
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Assessment & Planning (Week 1)</h3>
                  <p className="text-neutral-700 mb-4">
                    We analyze your current call center performance, identify pain points, and create a custom migration plan.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">What We Review:</div>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      <li>• Current call volume and patterns</li>
                      <li>• Call center contract terms and exit clauses</li>
                      <li>• Existing call scripts and protocols</li>
                      <li>• ServiceTitan/Jobber configuration</li>
                      <li>• Emergency routing requirements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Parallel Testing (Week 2)</h3>
                  <p className="text-neutral-700 mb-4">
                    Run Kestrel AI alongside your call center for after-hours or overflow calls. Compare performance in real-time.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="font-semibold text-neutral-900 mb-2">Option A: After-Hours Only</div>
                      <p className="text-sm text-neutral-700">
                        Call center handles business hours, Kestrel handles evenings/weekends. Zero risk, easy comparison.
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="font-semibold text-neutral-900 mb-2">Option B: Overflow</div>
                      <p className="text-sm text-neutral-700">
                        Call center gets first priority, Kestrel handles overflow when agents are busy. Test scalability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Performance Review (Week 3)</h3>
                  <p className="text-neutral-700 mb-4">
                    Compare metrics: response time, call quality, booking rates, customer satisfaction, and cost per call.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">Typical Results After 2 Weeks:</div>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">85%</div>
                        <div className="text-neutral-700">Faster response time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">23%</div>
                        <div className="text-neutral-700">Higher booking rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">96%</div>
                        <div className="text-neutral-700">Customer satisfaction</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Full Cutover (Week 4)</h3>
                  <p className="text-neutral-700 mb-4">
                    Once you're confident in Kestrel's performance, we handle the complete transition from your call center.
                  </p>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="font-semibold text-neutral-900 mb-2">We Handle:</div>
                    <ul className="text-sm text-neutral-700 space-y-1">
                      <li>• Phone number porting (if needed)</li>
                      <li>• Call center contract termination support</li>
                      <li>• Final routing configuration</li>
                      <li>• Team training on Kestrel dashboard</li>
                      <li>• 30-day white-glove support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8">
              <div className="flex items-start gap-6">
                <CheckCircle className="w-12 h-12 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-3">Migration Complete</h3>
                  <p className="mb-4 opacity-90">
                    You're now saving $40,000-$60,000/year with better service quality, faster response times, and zero turnover.
                  </p>
                  <div className="text-sm opacity-75">
                    Average migration time: 3-4 weeks | Zero disruption to customers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Common questions from HVAC companies switching from call centers"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection background="gray">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Leave Your Call Center Behind?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join 200+ HVAC companies who switched to Kestrel AI and saved $40K-$60K in the first year.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2">
                Schedule Migration Call
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/case-studies" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                Read Success Stories
              </Link>
            </div>
            <p className="text-sm opacity-75 mt-6">No long-term contracts • Cancel anytime • 14-day pilot program available</p>
          </div>
        </ContentSection>
      </main>
      <Footer />
    </>
  );
}
