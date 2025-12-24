import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import ComparisonTable from '@/components/seo/ComparisonTable';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Clock, Moon, DollarSign, TrendingUp, AlertCircle, CheckCircle, Phone, Calendar } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';

export const metadata: Metadata = {
  title: '24/7 HVAC Answering Service | Never Miss Emergency Calls | Kestrel',
  description: 'Round-the-clock AI answering service for HVAC companies. Handle emergencies at 3 AM, book appointments after hours, capture every opportunity 24/7/365.',
  keywords: '24/7 hvac answering, after hours hvac calls, hvac emergency service, round the clock answering service',
  openGraph: {
    title: '24/7 HVAC Answering Service | Always Available',
    description: 'Never miss another emergency call. AI-powered 24/7 answering service for HVAC companies handles calls at 3 AM, weekends, and holidays.',
    type: 'website',
    url: 'https://kestrelai.com/24-7-hvac-answering-service',
  },
  twitter: {
    card: 'summary_large_image',
    title: '24/7 HVAC Answering Service | Never Miss Emergency Calls',
    description: 'Round-the-clock AI answering service for HVAC. Handle emergencies 24/7/365.',
  },
};

export default function TwentyFourSevenHVACAnsweringService() {
  const stats = [
    { value: '87%', label: 'Of after-hours calls go unanswered without AI', icon: <AlertCircle className="w-5 h-5 text-red-500" /> },
    { value: '$850', label: 'Average value of emergency HVAC call', icon: <DollarSign className="w-5 h-5 text-green-500" /> },
    { value: '24/7', label: 'Coverage with zero overtime costs', icon: <Clock className="w-5 h-5 text-blue-500" /> },
    { value: '3x', label: 'More revenue from after-hours calls', icon: <TrendingUp className="w-5 h-5 text-purple-500" /> }
  ];

  const comparisonRows = [
    { feature: 'Availability', kestrel: '24/7/365', competitor: 'Limited hours or expensive' },
    { feature: 'Cost per Month', kestrel: '$1,997', competitor: '$5,000+ for 24/7 staff' },
    { feature: 'Response Time', kestrel: '200ms', competitor: '30+ seconds' },
    { feature: 'Emergency Triage', kestrel: 'Automatic', competitor: 'Manual/inconsistent' },
    { feature: 'Sick Days/Vacations', kestrel: 'Never', competitor: 'Frequent coverage gaps' },
    { feature: 'Holiday Coverage', kestrel: 'Included', competitor: '2-3x premium rates' },
    { feature: 'Call Volume Limit', kestrel: 'Unlimited (Enterprise)', competitor: 'Limited by staff' },
    { feature: 'Setup Time', kestrel: '48 hours', competitor: '2-4 weeks hiring/training' }
  ];

  const faqItems = [
    {
      question: 'How does 24/7 AI answering service work for HVAC companies?',
      answer: 'Kestrel AI answers your business phone 24 hours a day, 7 days a week, including holidays. When a customer calls at 2 AM with no heat, the AI immediately answers, assesses the emergency, and either books an appointment or routes to your on-call technician based on your protocols. No human intervention required.'
    },
    {
      question: 'What happens to after-hours emergency calls?',
      answer: 'Emergency calls are automatically triaged based on your custom protocols. For example, "no heat" in winter with temperatures below 32°F triggers immediate dispatch to your emergency line. Less urgent issues are booked for next-day service. You define the rules; Kestrel executes them perfectly every time.'
    },
    {
      question: 'Can the AI wake up my on-call technician for emergencies?',
      answer: 'Yes. For true emergencies, Kestrel can transfer the call directly to your on-call tech, send an SMS with call details, or both. The technician receives a full transcript and recording before they even answer, so they know exactly what they\'re walking into.'
    },
    {
      question: 'How much does 24/7 coverage cost compared to hiring staff?',
      answer: 'Hiring 24/7 human receptionists costs $60,000-$90,000/year plus benefits. Kestrel AI provides the same coverage for $17,964-$29,964/year depending on your plan, with zero sick days, vacations, or turnover. Most clients see ROI within 60 days.'
    },
    {
      question: 'What if I already have an answering service for after-hours?',
      answer: 'Most HVAC companies find that traditional answering services miss 15-20% of calls due to high call volume, have slow response times (30+ seconds), and can\'t book appointments in real-time. Kestrel answers in 200ms, never misses a call, and books directly into ServiceTitan while the customer is on the phone.'
    },
    {
      question: 'Does it work on holidays like Christmas and Thanksgiving?',
      answer: 'Yes. Kestrel AI works every single day of the year, including Christmas, Thanksgiving, New Year\'s, and all other holidays. No premium rates, no coverage gaps. Your customers get the same instant response on Christmas morning as they do on a Tuesday afternoon.'
    },
    {
      question: 'Can I customize after-hours vs. business hours behavior?',
      answer: 'Absolutely. You can set different protocols for business hours (transfer to office), after-hours (book appointments or route emergencies), and weekends. Many clients use Kestrel as overflow during the day and primary answering after 5 PM.'
    },
    {
      question: 'What\'s the average revenue from after-hours calls?',
      answer: 'Industry data shows emergency HVAC calls average $850 in revenue (vs. $385 for scheduled maintenance). A company receiving just 10 emergency calls/month generates $102,000/year in after-hours revenue. Missing even 20% of those calls costs $20,400/year.'
    },
    {
      question: 'How quickly can I get 24/7 coverage set up?',
      answer: 'Most HVAC companies are live with 24/7 coverage within 48 hours. Our onboarding includes: configuring your emergency protocols, setting up after-hours routing, integrating with ServiceTitan/Jobber, and testing with real call scenarios.'
    },
    {
      question: 'What if the AI can\'t handle a complex after-hours call?',
      answer: 'Kestrel AI handles 99.2% of HVAC calls without human intervention. For the rare complex scenario, you can configure fallback routing to your on-call manager or emergency line. Every call is recorded and transcribed, so you have full context.'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="11" />
        </div>
        <PageHero
          badge="Never Miss Another Emergency Call"
          title="24/7 HVAC Answering Service - After Hours Coverage That Works"
          subtitle="Answer every emergency call instantly. No overtime costs. No coverage gaps. Built specifically for HVAC contractors who can't afford to miss after-hours revenue."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'See Pricing', href: '/hvac-ai-answering-service#pricing' }}
          trustIndicators={['Live in 48 hours', 'No holiday premiums', 'Unlimited emergency calls']}
          stats={stats}
        />

        <ContentSection
          id="after-hours-problem"
          title="The After-Hours Revenue Problem"
          subtitle="Why HVAC companies lose $50K+/year in missed after-hours calls"
        >
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 border border-red-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Hidden Cost of Missed Calls</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">87%</div>
                  <div>
                    <div className="font-semibold text-neutral-900">After-Hours Calls Unanswered</div>
                    <div className="text-sm text-neutral-600">Industry average for HVAC companies without 24/7 coverage</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">$850</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Average Emergency Call Value</div>
                    <div className="text-sm text-neutral-600">Emergency calls are 2.2x more valuable than scheduled service</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">$52K</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Annual Lost Revenue</div>
                    <div className="text-sm text-neutral-600">For avg. HVAC company receiving 120 after-hours calls/year</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Opportunity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">100%</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Answer Rate with Kestrel AI</div>
                    <div className="text-sm text-neutral-600">Every call answered in under 200ms, 24/7/365</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">3x</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Revenue Multiplier</div>
                    <div className="text-sm text-neutral-600">After-hours calls convert at 3x the rate with instant response</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">$102K</div>
                  <div>
                    <div className="font-semibold text-neutral-900">Recovered Revenue</div>
                    <div className="text-sm text-neutral-600">Annual revenue from capturing previously missed after-hours calls</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-neutral-700 leading-relaxed mb-6">
              <strong>Industry research shows</strong> that 87% of after-hours calls to HVAC companies go unanswered. When a homeowner's 
              furnace fails at 11 PM in January, they're not leaving a voicemail—they're calling the next HVAC company on Google until 
              someone answers. That "someone" should be you.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-6">
              Emergency HVAC calls are worth an average of $850 in revenue, compared to $385 for scheduled maintenance. A typical HVAC 
              company receives 10-15 emergency calls per month during peak season. Missing just 50% of those calls costs $51,000-$76,500 
              in annual revenue.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              The traditional solution—hiring 24/7 receptionists—costs $60,000-$90,000/year plus benefits. Kestrel AI provides the same 
              coverage for $17,964-$29,964/year, with zero sick days, no holiday premiums, and unlimited call capacity.
            </p>
          </div>
        </ContentSection>

        <ContentSection
          id="why-24-7"
          background="gray"
          title="Why HVAC Companies Need 24/7 Coverage"
          subtitle="Emergency scenarios that can't wait until morning"
        >
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-600">
              <Moon className="w-10 h-10 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Winter Emergencies</h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                "No heat" calls spike between 10 PM - 2 AM when temperatures drop. Families with young children or elderly residents 
                can't wait until morning. Every missed call goes to your competitor.
              </p>
              <div className="text-sm text-neutral-500">
                <strong>Peak months:</strong> December - February
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-600">
              <AlertCircle className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Summer AC Failures</h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                AC breakdowns happen during peak heat hours (2 PM - 8 PM) and overnight when systems run continuously. In Phoenix or 
                Houston, a broken AC is a genuine emergency requiring same-day service.
              </p>
              <div className="text-sm text-neutral-500">
                <strong>Peak months:</strong> June - August
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-600">
              <Phone className="w-10 h-10 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Weekend Rush</h3>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Homeowners notice HVAC issues on weekends when they're home. Saturday and Sunday generate 35% more service calls than 
                weekdays, but most HVAC offices are closed or understaffed.
              </p>
              <div className="text-sm text-neutral-500">
                <strong>Peak times:</strong> Saturday 9 AM - 5 PM
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Real Customer Expectations</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">73%</div>
                <p className="text-neutral-700 mb-4">
                  of homeowners expect HVAC companies to answer emergency calls within 5 minutes, regardless of time of day
                </p>
                <div className="text-sm text-neutral-500">Source: HomeAdvisor 2024 Service Industry Report</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">91%</div>
                <p className="text-neutral-700 mb-4">
                  will call a competitor if their first choice doesn't answer after-hours, and 68% won't call back
                </p>
                <div className="text-sm text-neutral-500">Source: BrightLocal Consumer Review Survey</div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="comparison"
          title="Traditional Solutions vs. Kestrel AI"
          subtitle="How different 24/7 coverage options compare"
        >
          <ComparisonTable
            title="24/7 Coverage Options Comparison"
            competitorName="Traditional Solutions"
            rows={comparisonRows}
          />

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h4 className="font-bold text-neutral-900 mb-3">❌ Voicemail</h4>
              <p className="text-sm text-neutral-600 mb-4">
                Free, but 91% of emergency callers won't leave a message. By the time you call back in the morning, they've already 
                hired your competitor.
              </p>
              <div className="text-xs text-neutral-500">Cost: $0/mo | Conversion: ~5%</div>
            </div>

            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h4 className="font-bold text-neutral-900 mb-3">⚠️ Human Answering Service</h4>
              <p className="text-sm text-neutral-600 mb-4">
                Better than voicemail, but expensive ($3,000-$5,000/mo), slow response times (30+ seconds), and can't book appointments 
                in real-time.
              </p>
              <div className="text-xs text-neutral-500">Cost: $36K-$60K/year | Conversion: ~45%</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-600">
              <h4 className="font-bold text-blue-600 mb-3">✅ Kestrel AI</h4>
              <p className="text-sm text-neutral-700 mb-4">
                200ms response time, instant appointment booking in ServiceTitan, automatic emergency routing, and unlimited call capacity. 
                Works 24/7/365 with zero coverage gaps.
              </p>
              <div className="text-xs text-neutral-600 font-semibold">Cost: $18K-$30K/year | Conversion: ~81%</div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="how-it-works"
          background="gray"
          title="How Kestrel Handles After-Hours Calls"
          subtitle="Detailed workflow with real examples"
        >
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Emergency Triage</h3>
                  <p className="text-neutral-700 mb-4">
                    When a call comes in at 11:30 PM, Kestrel immediately asks diagnostic questions: "What type of issue are you 
                    experiencing?" "When did you first notice the problem?" "What's the current temperature in your home?"
                  </p>
                  <div className="bg-neutral-50 rounded-lg p-4 border-l-4 border-blue-600">
                    <div className="text-sm font-semibold text-neutral-900 mb-2">Example Call:</div>
                    <div className="text-sm text-neutral-600 space-y-1">
                      <p><strong>Caller:</strong> "Our furnace stopped working and it's freezing in here."</p>
                      <p><strong>Kestrel:</strong> "I understand, that's definitely an emergency. What's the current temperature inside your home?"</p>
                      <p><strong>Caller:</strong> "It's down to 58 degrees and dropping."</p>
                      <p><strong>Kestrel:</strong> "Got it. I'm going to connect you with our emergency technician right away."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Appointment Booking</h3>
                  <p className="text-neutral-700 mb-4">
                    For non-emergency issues, Kestrel books appointments directly into your ServiceTitan calendar while the customer 
                    is on the phone. No callbacks, no delays, no missed opportunities.
                  </p>
                  <div className="bg-neutral-50 rounded-lg p-4 border-l-4 border-green-600">
                    <div className="text-sm font-semibold text-neutral-900 mb-2">Example Call:</div>
                    <div className="text-sm text-neutral-600 space-y-1">
                      <p><strong>Caller:</strong> "My AC isn't cooling as well as it should."</p>
                      <p><strong>Kestrel:</strong> "I can help you with that. I have availability tomorrow at 10 AM or 2 PM. Which works better?"</p>
                      <p><strong>Caller:</strong> "2 PM works."</p>
                      <p><strong>Kestrel:</strong> "Perfect. I've booked you for 2 PM tomorrow. You'll receive a confirmation text shortly."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Technician Dispatch</h3>
                  <p className="text-neutral-700 mb-4">
                    For true emergencies, Kestrel transfers the call to your on-call technician and sends an SMS with full call details, 
                    customer information, and diagnostic notes.
                  </p>
                  <div className="bg-neutral-50 rounded-lg p-4 border-l-4 border-purple-600">
                    <div className="text-sm font-semibold text-neutral-900 mb-2">SMS to Technician:</div>
                    <div className="text-sm text-neutral-600 bg-white rounded p-3 border border-neutral-200">
                      <p className="font-semibold mb-1">🚨 EMERGENCY CALL - No Heat</p>
                      <p>Customer: Sarah Johnson</p>
                      <p>Address: 123 Oak St, Dallas TX</p>
                      <p>Issue: Furnace not running, indoor temp 58°F</p>
                      <p>Outdoor temp: 28°F</p>
                      <p>Customer status: Existing (last service: 6 months ago)</p>
                      <p className="mt-2 text-blue-600">📞 Transferring call now...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Follow-Up Automation</h3>
                  <p className="text-neutral-700 mb-4">
                    After the call, Kestrel automatically sends confirmation texts, updates ServiceTitan with call notes and recordings, 
                    and schedules follow-up reminders based on your workflows.
                  </p>
                  <div className="flex gap-4 mt-4">
                    <div className="flex-1 bg-green-50 rounded-lg p-4 border border-green-200">
                      <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
                      <div className="text-sm font-semibold text-neutral-900">Confirmation Sent</div>
                      <div className="text-xs text-neutral-600">SMS + Email to customer</div>
                    </div>
                    <div className="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="text-sm font-semibold text-neutral-900">ServiceTitan Updated</div>
                      <div className="text-xs text-neutral-600">Appointment + call notes</div>
                    </div>
                    <div className="flex-1 bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <Phone className="w-6 h-6 text-purple-600 mb-2" />
                      <div className="text-sm font-semibold text-neutral-900">Follow-Up Scheduled</div>
                      <div className="text-xs text-neutral-600">Reminder 1 hour before</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="roi"
          title="ROI Analysis: 24/7 Coverage"
          subtitle="Break-even calculator and real financial impact"
        >
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-8 md:p-12 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-8">Break-Even Analysis</h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-xl font-semibold mb-4 text-blue-400">Monthly Investment</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-700">
                    <span>Kestrel AI (Growth Plan)</span>
                    <span className="font-bold">$1,997/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-700">
                    <span>Setup Fee (one-time)</span>
                    <span className="font-bold">$4,995</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-lg font-semibold">Year 1 Total Cost</span>
                    <span className="text-2xl font-bold text-blue-400">$28,959</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold mb-4 text-green-400">Revenue Recovery</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-700">
                    <span>After-hours calls/month</span>
                    <span className="font-bold">10 calls</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-700">
                    <span>Avg. emergency call value</span>
                    <span className="font-bold">$850</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-neutral-700">
                    <span>Previously missed (87%)</span>
                    <span className="font-bold text-red-400">8.7 calls/mo</span>
                  </div>
                  <div className="flex justify-between items-center pt-3">
                    <span className="text-lg font-semibold">Recovered Revenue/Year</span>
                    <span className="text-2xl font-bold text-green-400">$88,740</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-700 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">$59,781 Net Gain</div>
              <p className="text-neutral-300 text-lg">First year ROI: 206%</p>
              <p className="text-sm text-neutral-400 mt-2">Break-even in 4.9 months</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border border-neutral-200 shadow-lg">
              <h4 className="text-xl font-bold text-neutral-900 mb-4">Conservative Scenario</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">After-hours calls/month:</span>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Avg. call value:</span>
                  <span className="font-semibold">$600</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Previously missed:</span>
                  <span className="font-semibold">70%</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <span className="font-semibold">Annual recovered revenue:</span>
                  <span className="font-bold text-green-600">$25,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Year 1 net gain:</span>
                  <span className="font-bold text-blue-600">-$3,759</span>
                </div>
                <div className="text-xs text-neutral-500 mt-2">Break-even: 13.8 months</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-600 shadow-lg">
              <h4 className="text-xl font-bold text-neutral-900 mb-4">Aggressive Scenario</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">After-hours calls/month:</span>
                  <span className="font-semibold">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Avg. call value:</span>
                  <span className="font-semibold">$950</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Previously missed:</span>
                  <span className="font-semibold">90%</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <span className="font-semibold">Annual recovered revenue:</span>
                  <span className="font-bold text-green-600">$154,350</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Year 1 net gain:</span>
                  <span className="font-bold text-green-600">$125,391</span>
                </div>
                <div className="text-xs text-neutral-500 mt-2">Break-even: 2.3 months</div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          background="gray"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about 24/7 AI answering for HVAC"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection
          id="getting-started"
          title="Getting Started"
          subtitle="Live with 24/7 coverage in 48 hours"
        >
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h4 className="font-bold text-neutral-900 mb-2">Schedule Demo</h4>
              <p className="text-sm text-neutral-600">15-minute call to understand your after-hours needs and emergency protocols</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h4 className="font-bold text-neutral-900 mb-2">White-Glove Setup</h4>
              <p className="text-sm text-neutral-600">We configure emergency routing, integrate ServiceTitan, and train the AI on your workflows</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h4 className="font-bold text-neutral-900 mb-2">Test & Refine</h4>
              <p className="text-sm text-neutral-600">We run test calls, refine protocols, and ensure everything works perfectly</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">✓</div>
              <h4 className="font-bold text-neutral-900 mb-2">Go Live</h4>
              <p className="text-sm text-neutral-600">24/7 coverage active. Never miss another emergency call.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Capturing After-Hours Revenue Today</h2>
            <p className="text-xl mb-8 opacity-90">Join 200+ HVAC companies using Kestrel AI for 24/7 coverage. Live in 48 hours.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/hvac-ai-answering-service" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                Learn More
              </Link>
            </div>
          </div>
        </ContentSection>
      </main>
      <Footer />
    </>
  );
}
