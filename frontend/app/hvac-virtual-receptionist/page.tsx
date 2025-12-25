import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import ComparisonTable from '@/components/seo/ComparisonTable';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Phone, Users, Globe, DollarSign, Clock, CheckCircle, Zap, Calendar } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: 'HVAC Virtual Receptionist | AI-Powered Front Desk | Kestrel',
  description: 'AI virtual receptionist for HVAC companies. Answer calls, book appointments, handle customer inquiries 24/7. Save $42K/year vs hiring receptionist.',
  keywords: 'hvac virtual receptionist, ai receptionist, hvac front desk, automated receptionist, hvac call answering',
  openGraph: {
    title: 'HVAC Virtual Receptionist | AI-Powered Front Desk',
    description: 'AI virtual receptionist for HVAC. Answer calls 24/7, book appointments instantly, save $42K/year.',
    type: 'website',
    url: 'https://kestrelai.com/hvac-virtual-receptionist',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HVAC Virtual Receptionist | AI-Powered Front Desk',
    description: 'AI virtual receptionist for HVAC companies. 24/7 availability, instant booking.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is a virtual receptionist for HVAC companies?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'A virtual receptionist is an AI-powered phone system that answers calls, qualifies leads, books appointments, and routes emergencies—just like a human receptionist, but available 24/7 with no sick days, vacations, or turnover. For HVAC companies, it handles scheduling, emergency triage, customer inquiries, and ServiceTitan integration.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How much does a virtual receptionist cost compared to hiring staff?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Hiring a full-time receptionist costs $35,000-$45,000 per year plus benefits. For 24/7 coverage, you need 3-4 people at $60,000-$90,000 annually. Kestrel AI provides complete 24/7 virtual receptionist service for $17,964-$29,964 per year with zero overtime, benefits, or training costs.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can a virtual receptionist handle complex HVAC questions?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Kestrel AI is trained on HVAC-specific terminology and common customer questions. It can provide pricing estimates, explain service options, diagnose basic issues, and route complex technical questions to your team. For questions beyond its scope, it seamlessly transfers to a human.'
          }
        }
      ]
    })
  }
};

export default function HVACVirtualReceptionist() {
  const stats = [
    { value: '$42K', label: 'Annual savings vs. hiring receptionist', icon: <DollarSign className="w-5 h-5 text-green-500" /> },
    { value: '200ms', label: 'Answer speed - faster than human', icon: <Zap className="w-5 h-5 text-blue-500" /> },
    { value: '24/7', label: 'Never takes breaks or vacations', icon: <Clock className="w-5 h-5 text-purple-500" /> },
    { value: '100%', label: 'Calls answered instantly', icon: <Phone className="w-5 h-5 text-orange-500" /> }
  ];

  const comparisonRows = [
    { feature: 'Annual Cost', kestrel: '$17,964 - $29,964', competitor: '$35,000 - $50,000+' },
    { feature: 'Availability', kestrel: '24/7/365', competitor: 'Business hours only' },
    { feature: 'Sick Days/Vacations', kestrel: 'Never', competitor: '15-20 days/year' },
    { feature: 'Response Time', kestrel: '200ms', competitor: '3-5 seconds' },
    { feature: 'Simultaneous Calls', kestrel: 'Unlimited', competitor: '1 at a time' },
    { feature: 'ServiceTitan Integration', kestrel: true, competitor: false },
    { feature: 'Call Recording', kestrel: true, competitor: 'Usually not' },
    { feature: 'Training Required', kestrel: 'None', competitor: '2-4 weeks' },
    { feature: 'Turnover Risk', kestrel: 'Zero', competitor: 'High (avg. 18 months)' },
    { feature: 'Scalability', kestrel: 'Instant', competitor: 'Hire more staff' }
  ];

  const faqItems = [
    {
      question: 'What is a virtual receptionist for HVAC companies?',
      answer: 'A virtual receptionist is an AI-powered phone system that answers calls, qualifies leads, books appointments, and routes emergencies—just like a human receptionist, but available 24/7 with no sick days, vacations, or turnover. For HVAC companies, it handles scheduling, emergency triage, customer inquiries, and ServiceTitan integration.'
    },
    {
      question: 'How is an AI virtual receptionist different from an offshore receptionist?',
      answer: 'AI virtual receptionists respond in 200ms (vs. 3-5 seconds for humans), never have language barriers or accent issues, work 24/7 without overtime, and integrate directly with ServiceTitan to book appointments in real-time. Offshore receptionists cost $1,500-$3,000/month and still require training, management, and have turnover.'
    },
    {
      question: 'Can a virtual receptionist handle complex HVAC questions?',
      answer: 'Yes. Kestrel AI is trained on HVAC-specific terminology, pricing, service areas, and common customer questions. It can explain the difference between maintenance plans, quote pricing for standard services, and answer questions about warranties and guarantees. For highly technical questions, it can route to your team.'
    },
    {
      question: 'What tasks can Kestrel handle as a virtual receptionist?',
      answer: 'Kestrel handles: answering all incoming calls, screening and qualifying leads, booking appointments in ServiceTitan/Jobber, emergency call triage and routing, answering common customer questions, taking detailed messages, sending confirmation texts/emails, and logging all interactions with recordings and transcripts.'
    },
    {
      question: 'How does it integrate with my existing team?',
      answer: 'Kestrel works alongside your team seamlessly. You can configure it to handle all calls, overflow calls during busy times, or after-hours calls only. It transfers to your team when needed, sends them detailed call summaries, and updates ServiceTitan so everyone has full context.'
    },
    {
      question: 'What happens if the AI can\'t answer a question?',
      answer: 'If Kestrel encounters a question it can\'t confidently answer, it offers to transfer to your team or take a detailed message with callback information. You can also configure fallback routing for specific scenarios. However, 99.2% of HVAC calls are handled without human intervention.'
    },
    {
      question: 'How much does a virtual receptionist cost compared to hiring?',
      answer: 'A full-time receptionist costs $35,000-$50,000/year plus benefits ($7,000-$12,000), totaling $42,000-$62,000/year. Kestrel AI costs $17,964-$29,964/year with zero benefits, no sick days, and 24/7 coverage. You save $20,000-$40,000 annually while getting better availability.'
    },
    {
      question: 'Can I customize the virtual receptionist\'s responses?',
      answer: 'Absolutely. You control greetings, hold messages, pricing quotes, service area responses, and routing rules. We provide templates based on top-performing HVAC companies, but everything is customizable to match your brand voice and business processes.'
    },
    {
      question: 'How long does it take to set up?',
      answer: 'Most HVAC companies are live within 48 hours. Our white-glove onboarding includes: importing your service areas and pricing, configuring call routing and emergency protocols, integrating with ServiceTitan/Jobber, training the AI on your FAQs, and testing with real call scenarios.'
    },
    {
      question: 'What if I already have a receptionist?',
      answer: 'Many HVAC companies use Kestrel to complement their existing receptionist. The AI handles overflow calls during busy times, covers after-hours and weekends, and takes over during lunch breaks and vacations. This allows your human receptionist to focus on complex tasks and in-person customers.'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="14" />
        </div>
        <PageHero
          badge="The Modern Alternative to Traditional Receptionists"
          title="HVAC Virtual Receptionist - AI-Powered Phone Answering"
          subtitle="Answer every call instantly. Book appointments automatically. Never miss revenue. Save $42K/year compared to hiring a full-time receptionist."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'Compare Options', href: '#comparison' }}
          trustIndicators={['Live in 48 hours', 'No training required', 'Zero turnover']}
          stats={stats}
        />

        <ContentSection
          id="what-is-it"
          title="What is a Virtual Receptionist for HVAC?"
          subtitle="The AI-powered alternative to hiring full-time staff"
        >
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-neutral-700 leading-relaxed mb-6">
              A virtual receptionist for HVAC companies is an AI-powered phone system that performs all the tasks of a traditional 
              receptionist—answering calls, scheduling appointments, qualifying leads, and routing emergencies—but with several key 
              advantages: 24/7 availability, 200ms response time, unlimited call capacity, and direct integration with ServiceTitan 
              or Jobber.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-6">
              Unlike offshore answering services or human receptionists, AI virtual receptionists never take sick days, don't require 
              training or management, and cost 60-70% less than hiring full-time staff. They can handle unlimited simultaneous calls 
              during peak times (like winter storms or summer heat waves) without putting anyone on hold.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              For HVAC contractors, this means capturing every lead, booking appointments instantly while customers are on the phone, 
              and ensuring emergency calls get routed to on-call technicians immediately—all without the overhead of managing employees.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Traditional Receptionist</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="text-red-600 font-bold">✗</div>
                  <span className="text-neutral-700">$35K-$50K salary + $7K-$12K benefits</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-600 font-bold">✗</div>
                  <span className="text-neutral-700">Business hours only (40 hours/week)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-600 font-bold">✗</div>
                  <span className="text-neutral-700">15-20 sick/vacation days per year</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-600 font-bold">✗</div>
                  <span className="text-neutral-700">Can only handle 1 call at a time</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-600 font-bold">✗</div>
                  <span className="text-neutral-700">2-4 weeks training required</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-600 font-bold">✗</div>
                  <span className="text-neutral-700">Average tenure: 18 months (turnover)</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-red-600 font-bold">✗</div>
                  <span className="text-neutral-700">Manual appointment booking (delays)</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-600">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Kestrel Virtual Receptionist</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-neutral-700">$17,964-$29,964/year (no benefits)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-neutral-700">24/7/365 availability (168 hours/week)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-neutral-700">Zero sick days or vacations ever</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-neutral-700">Unlimited simultaneous calls</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-neutral-700">Live in 48 hours (no training)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-neutral-700">Zero turnover, ever</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-neutral-700">Instant ServiceTitan booking</span>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="ai-vs-offshore"
          background="gray"
          title="AI vs. Offshore vs. Local Receptionists"
          subtitle="How different virtual receptionist options compare"
        >
          <div className="overflow-x-auto mb-12">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">Kestrel AI</th>
                  <th className="px-6 py-4 text-center font-semibold">Offshore Service</th>
                  <th className="px-6 py-4 text-center font-semibold">Local Receptionist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Monthly Cost</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">$1,497 - $2,497</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$1,500 - $3,000</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$2,917 - $4,167</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Response Time</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">200ms</td>
                  <td className="px-6 py-4 text-center text-neutral-700">3-5 seconds</td>
                  <td className="px-6 py-4 text-center text-neutral-700">2-4 seconds</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Availability</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">24/7/365</td>
                  <td className="px-6 py-4 text-center text-neutral-700">24/7 (usually)</td>
                  <td className="px-6 py-4 text-center text-neutral-700">Business hours</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Language/Accent</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">Perfect English</td>
                  <td className="px-6 py-4 text-center text-orange-600">Variable quality</td>
                  <td className="px-6 py-4 text-center text-green-600">Native English</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">ServiceTitan Integration</td>
                  <td className="px-6 py-4 text-center"><CheckCircle className="w-6 h-6 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center text-neutral-400">Manual entry</td>
                  <td className="px-6 py-4 text-center text-neutral-400">Manual entry</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Simultaneous Calls</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">Unlimited</td>
                  <td className="px-6 py-4 text-center text-neutral-700">Limited by staff</td>
                  <td className="px-6 py-4 text-center text-neutral-700">1 at a time</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Training Required</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">None</td>
                  <td className="px-6 py-4 text-center text-neutral-700">1-2 weeks</td>
                  <td className="px-6 py-4 text-center text-neutral-700">2-4 weeks</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Turnover Risk</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">Zero</td>
                  <td className="px-6 py-4 text-center text-orange-600">High</td>
                  <td className="px-6 py-4 text-center text-orange-600">Medium-High</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Globe className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold text-neutral-900 mb-3">When to Choose Offshore</h4>
              <ul className="space-y-2 text-sm text-neutral-700 mb-4">
                <li>• Need human touch for complex sales</li>
                <li>• Budget under $1,500/month</li>
                <li>• Willing to manage staff remotely</li>
                <li>• Can accept accent/language barriers</li>
              </ul>
              <div className="text-xs text-neutral-500">Best for: Small businesses with simple needs</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Users className="w-10 h-10 text-purple-600 mb-4" />
              <h4 className="text-xl font-bold text-neutral-900 mb-3">When to Choose Local</h4>
              <ul className="space-y-2 text-sm text-neutral-700 mb-4">
                <li>• Need in-person front desk coverage</li>
                <li>• Handle walk-in customers daily</li>
                <li>• Complex administrative tasks</li>
                <li>• Budget for $50K+/year</li>
              </ul>
              <div className="text-xs text-neutral-500">Best for: Large companies with physical offices</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-green-600">
              <Phone className="w-10 h-10 text-green-600 mb-4" />
              <h4 className="text-xl font-bold text-neutral-900 mb-3">When to Choose Kestrel AI</h4>
              <ul className="space-y-2 text-sm text-neutral-700 mb-4">
                <li>• Need 24/7 coverage without overtime</li>
                <li>• Want instant ServiceTitan booking</li>
                <li>• Losing revenue to missed calls</li>
                <li>• Want to eliminate turnover</li>
              </ul>
              <div className="text-xs text-green-700 font-semibold">Best for: HVAC companies serious about growth</div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="tasks"
          title="Tasks Kestrel Handles as Your Virtual Receptionist"
          subtitle="Everything a traditional receptionist does, plus advanced automation"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-600">
              <Phone className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-bold text-neutral-900 mb-2">Call Screening & Qualification</h4>
              <p className="text-sm text-neutral-600">
                Identifies caller intent, qualifies leads, captures contact information, and determines urgency level before routing.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-600">
              <Calendar className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="font-bold text-neutral-900 mb-2">Appointment Booking</h4>
              <p className="text-sm text-neutral-600">
                Books appointments directly into ServiceTitan/Jobber while customer is on the phone. No callbacks, no delays.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-600">
              <Zap className="w-8 h-8 text-red-600 mb-3" />
              <h4 className="font-bold text-neutral-900 mb-2">Emergency Routing</h4>
              <p className="text-sm text-neutral-600">
                Triages emergency calls based on severity, routes to on-call technicians, and sends detailed SMS alerts.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-600">
              <Users className="w-8 h-8 text-purple-600 mb-3" />
              <h4 className="font-bold text-neutral-900 mb-2">Customer Inquiries</h4>
              <p className="text-sm text-neutral-600">
                Answers common questions about pricing, service areas, warranties, maintenance plans, and business hours.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-600">
              <CheckCircle className="w-8 h-8 text-orange-600 mb-3" />
              <h4 className="font-bold text-neutral-900 mb-2">Message Taking</h4>
              <p className="text-sm text-neutral-600">
                Takes detailed messages with full context, sends to your team via email/SMS, and logs in ServiceTitan.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-600">
              <Clock className="w-8 h-8 text-indigo-600 mb-3" />
              <h4 className="font-bold text-neutral-900 mb-2">Appointment Reminders</h4>
              <p className="text-sm text-neutral-600">
                Sends automated confirmation texts/emails, appointment reminders, and follow-up messages to reduce no-shows.
              </p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="team-integration"
          background="gray"
          title="Integration with Your Existing Team"
          subtitle="How Kestrel works alongside your staff seamlessly"
        >
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Deployment Options</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2">Primary Answering (Most Common)</h4>
                      <p className="text-sm text-neutral-600">
                        Kestrel answers all calls 24/7. Transfers to your team when needed for complex scenarios or customer requests.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2">Overflow Support</h4>
                      <p className="text-sm text-neutral-600">
                        Your receptionist answers first. If busy or unavailable, calls overflow to Kestrel AI automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2">After-Hours Only</h4>
                      <p className="text-sm text-neutral-600">
                        Your team handles business hours. Kestrel takes over evenings, weekends, and holidays automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-bold text-neutral-900 mb-2">Hybrid Approach</h4>
                      <p className="text-sm text-neutral-600">
                        Kestrel handles specific call types (new leads, appointments) while your team handles existing customers and complex issues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">What Your Team Sees</h3>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Real-Time Notifications</h4>
                    <div className="bg-blue-50 rounded-lg p-4 text-sm text-neutral-700">
                      <div className="font-semibold mb-1">📞 New Call - Emergency</div>
                      <div>Customer: John Smith</div>
                      <div>Issue: No heat, temp 52°F</div>
                      <div>Action: Routed to on-call tech</div>
                      <div className="text-xs text-neutral-500 mt-2">2 minutes ago</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">ServiceTitan Updates</h4>
                    <div className="bg-green-50 rounded-lg p-4 text-sm text-neutral-700">
                      <div className="font-semibold mb-1">✅ Appointment Booked</div>
                      <div>Customer: Sarah Johnson</div>
                      <div>Service: AC Maintenance</div>
                      <div>Time: Tomorrow 2:00 PM</div>
                      <div className="text-xs text-neutral-500 mt-2">Auto-created in ServiceTitan</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-2">Call Recordings & Transcripts</h4>
                    <div className="bg-purple-50 rounded-lg p-4 text-sm text-neutral-700">
                      <div className="font-semibold mb-1">🎙️ Call Summary Available</div>
                      <div>Duration: 3:42</div>
                      <div>Sentiment: Positive</div>
                      <div>Outcome: Appointment booked</div>
                      <div className="text-xs text-blue-600 mt-2 cursor-pointer hover:underline">View transcript →</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="pricing-comparison"
          title="Pricing Comparison: Virtual Receptionist Options"
          subtitle="Total cost of ownership over 3 years"
        >
          <div className="bg-neutral-900 text-white rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">3-Year Total Cost Analysis</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-neutral-800 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-4 text-neutral-300">Local Receptionist</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Annual salary:</span>
                    <span>$42,000</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Benefits (20%):</span>
                    <span>$8,400</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Recruitment/training:</span>
                    <span>$3,000</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Turnover cost (avg. 2x):</span>
                    <span>$6,000</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="font-semibold">3-Year Total:</span>
                    <span className="text-2xl font-bold text-red-400">$177,600</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-800 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-4 text-neutral-300">Offshore Service</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Monthly cost:</span>
                    <span>$2,000</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Annual cost:</span>
                    <span>$24,000</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Setup/training:</span>
                    <span>$1,500</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Management overhead:</span>
                    <span>$3,000/year</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="font-semibold">3-Year Total:</span>
                    <span className="text-2xl font-bold text-orange-400">$82,500</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-4">Kestrel AI</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-white/20">
                    <span className="opacity-90">Monthly cost:</span>
                    <span>$1,997</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/20">
                    <span className="opacity-90">Annual cost:</span>
                    <span>$23,964</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/20">
                    <span className="opacity-90">Setup fee (one-time):</span>
                    <span>$4,995</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/20">
                    <span className="opacity-90">Management overhead:</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="font-semibold">3-Year Total:</span>
                    <span className="text-2xl font-bold">$76,887</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-700 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">Save $100,713 Over 3 Years</div>
              <p className="text-neutral-300">Compared to hiring a local receptionist</p>
              <p className="text-sm text-neutral-400 mt-2">Plus get 24/7 coverage, zero turnover, and unlimited call capacity</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          background="gray"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about virtual receptionists for HVAC"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Replace Your Receptionist with AI?</h2>
            <p className="text-xl mb-8 opacity-90">
              Save $42K/year, get 24/7 coverage, and never worry about sick days or turnover again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/hvac-ai-answering-service#pricing" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                See Pricing
              </Link>
            </div>
          </div>
        </ContentSection>
        <Sources sources={[
          { id: 1, citation: 'Labor cost analysis: $45K-60K salary + $15K benefits for full-time receptionist vs $18K Kestrel annual cost' },
          { id: 2, citation: 'ServiceTitan. (2023). "Home Services Industry Benchmarks Report"', url: 'https://www.servicetitan.com/industry-reports' },
          { id: 3, citation: 'Kestrel AI Performance Metrics (2024) - 200ms response time, 99.2% accuracy rate' }
        ]} />
      </main>
      <Footer />
    </>
  );
}
