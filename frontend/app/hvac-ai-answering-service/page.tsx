import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import ComparisonTable from '@/components/seo/ComparisonTable';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Zap, Clock, TrendingUp, Shield, Phone, CheckCircle, DollarSign, Users, Calendar, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';

export const metadata: Metadata = {
  title: 'HVAC AI Answering Service | 24/7 Call Handling | Kestrel',
  description: 'AI-powered answering service for HVAC companies. Answer 100% of calls in 200ms, book appointments instantly, integrate with ServiceTitan. Save $42K/year vs hiring.',
  keywords: 'hvac answering service, hvac ai, 24/7 hvac calls, hvac call handling, servicetitan integration, hvac virtual receptionist',
  openGraph: {
    title: 'HVAC AI Answering Service | Never Miss Another Call',
    description: 'Answer every HVAC call in 200ms with AI. Book appointments instantly, handle emergencies 24/7, integrate with ServiceTitan.',
    type: 'website',
    url: 'https://kestrelai.com/hvac-ai-answering-service',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HVAC AI Answering Service | 24/7 Call Handling',
    description: 'AI-powered answering service for HVAC companies. 200ms response, 24/7 availability, ServiceTitan integration.',
  },
};

export default function HVACAIAnsweringService() {
  const stats = [
    { value: '200ms', label: 'Response time - 10x faster than competitors', icon: <Zap className="w-5 h-5 text-amber-500" /> },
    { value: '24/7', label: 'Never miss an emergency call', icon: <Clock className="w-5 h-5 text-blue-500" /> },
    { value: '40%', label: 'More booked appointments', icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
    { value: '$2M+', label: 'Revenue recovered for clients', icon: <DollarSign className="w-5 h-5 text-purple-500" /> }
  ];

  const comparisonRows = [
    { feature: 'Availability', kestrel: '24/7/365', competitor: 'Business hours only' },
    { feature: 'Response Time', kestrel: '200ms', competitor: '5-10 seconds' },
    { feature: 'Cost per Month', kestrel: '$1,497', competitor: '$3,000+' },
    { feature: 'Setup Time', kestrel: '48 hours', competitor: '2-4 weeks' },
    { feature: 'Emergency Routing', kestrel: true, competitor: false },
    { feature: 'ServiceTitan Integration', kestrel: true, competitor: false },
    { feature: 'Natural Interruptions', kestrel: true, competitor: false },
    { feature: 'Sick Days / Vacations', kestrel: 'Never', competitor: 'Frequent coverage gaps' }
  ];

  const faqItems = [
    {
      question: 'How does an AI answering service differ from a traditional answering service?',
      answer: 'Unlike traditional services that rely on human operators, Kestrel AI responds in 200ms, never takes breaks, and handles unlimited calls simultaneously. It integrates directly with your ServiceTitan or Jobber account, automatically books appointments, and routes emergencies based on your custom protocols.'
    },
    {
      question: 'Can the AI handle emergency HVAC calls?',
      answer: 'Absolutely. Kestrel AI is specifically trained on HVAC emergency protocols. It can identify urgent situations (no heat in winter, gas leaks, AC failures in extreme heat), triage based on severity, and immediately dispatch to your on-call technician or emergency line.'
    },
    {
      question: 'What happens if the AI doesn\'t understand a caller?',
      answer: 'Kestrel AI uses advanced natural language processing with 99.2% accuracy for HVAC-specific terminology. In rare cases where clarification is needed, it asks follow-up questions. You can also configure fallback routing to a human operator for complex scenarios.'
    },
    {
      question: 'How long does it take to set up?',
      answer: 'Most HVAC companies are live within 48 hours. Our white-glove onboarding includes: importing your service areas, configuring emergency protocols, integrating with ServiceTitan/Jobber, training the AI on your pricing, and testing with real call scenarios.'
    },
    {
      question: 'Does it integrate with ServiceTitan?',
      answer: 'Yes. Kestrel AI has native ServiceTitan integration. It automatically looks up existing customers, creates new customer records, books appointments in available time slots, and logs all call details with recordings and transcripts.'
    },
    {
      question: 'What\'s the ROI compared to hiring a 24/7 receptionist?',
      answer: 'A 24/7 human receptionist costs $60,000-$90,000/year plus benefits. Kestrel AI costs $17,964/year (at our Growth plan) and handles unlimited calls with zero sick days. Most clients see ROI within 60 days from recovered missed calls alone.'
    },
    {
      question: 'Can I customize what the AI says?',
      answer: 'Yes. You control greetings, hold messages, pricing quotes, service area responses, and emergency protocols. We provide templates based on top-performing HVAC companies, but everything is customizable to match your brand voice.'
    },
    {
      question: 'What if call volume exceeds my plan?',
      answer: 'We never cut off service. If you exceed your plan\'s call limit, we charge $2.50 per additional call. We\'ll also notify you and recommend upgrading to a higher tier if it makes financial sense.'
    },
    {
      question: 'Is my customer data secure?',
      answer: 'Yes. Kestrel is SOC 2 Type II certified, HIPAA compliant, and uses bank-level encryption. All call recordings and customer data are stored in secure US-based data centers with 99.9% uptime SLA.'
    },
    {
      question: 'Can I try it before committing?',
      answer: 'Yes. We offer a 14-day pilot program where we run Kestrel AI alongside your existing answering solution. You can compare call quality, booking rates, and customer satisfaction before making a decision.'
    }
  ];

  const benefits = [
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: '24/7 Availability',
      description: 'Never miss another emergency call. Kestrel answers every call in under 200ms, even at 3 AM on Christmas.'
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      title: 'Zero Missed Revenue',
      description: 'The average HVAC company loses $47,000/year to missed calls. Kestrel captures every opportunity, instantly.'
    },
    {
      icon: <Calendar className="w-8 h-8 text-purple-600" />,
      title: 'Instant Appointment Booking',
      description: 'Books appointments directly into ServiceTitan while the customer is on the phone. No callbacks, no delays.'
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: 'Emergency Protocol Routing',
      description: 'Automatically identifies emergencies and routes to your on-call tech based on custom rules you define.'
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: 'Cost vs. 24/7 Staff',
      description: 'Save $42,000+/year compared to hiring round-the-clock receptionists. No benefits, no turnover, no training.'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: 'Performance Analytics',
      description: 'Track call volume, booking rates, revenue per call, and customer satisfaction with real-time dashboards.'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="12" />
        </div>
        <PageHero
          badge="Proven in HVAC. Built for Service Industries."
          title="AI Answering Service for HVAC Companies"
          subtitle="Answer every call in 200ms. Book appointments instantly. Route emergencies automatically. Built specifically for HVAC contractors."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'See Pricing', href: '#pricing' }}
          trustIndicators={['Live in 48 hours', '99.9% Uptime SLA', 'SOC 2 Certified']}
          stats={stats}
        />

        <ContentSection
          id="what-is-it"
          title="What is an HVAC AI Answering Service?"
          subtitle="The modern alternative to traditional answering services and missed calls"
        >
          <div className="prose prose-lg max-w-none">
            <p className="text-neutral-700 leading-relaxed mb-6">
              An HVAC AI answering service is an autonomous voice agent that answers your business phone calls 24/7/365, 
              qualifies caller intent, books appointments, and routes emergencies—without human intervention. Unlike traditional 
              answering services that rely on offshore operators reading scripts, AI answering services use advanced natural 
              language processing to have natural conversations with your customers.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-6">
              For HVAC companies, this means never missing an emergency call at 2 AM, instantly booking maintenance appointments 
              during peak season, and eliminating the $60,000+/year cost of 24/7 human receptionists. The AI understands HVAC-specific 
              terminology like "no heat," "refrigerant leak," and "zone control issues," and can make intelligent routing decisions 
              based on urgency, customer status, and technician availability.
            </p>
            <p className="text-neutral-700 leading-relaxed">
              Modern AI answering services integrate directly with field service management platforms like ServiceTitan, Jobber, 
              and FieldEdge, automatically creating customer records, booking appointments in available time slots, and logging 
              detailed call notes with recordings and transcripts.
            </p>
          </div>
        </ContentSection>

        <ContentSection
          id="how-it-works"
          background="gray"
          title="How Kestrel's AI Receptionist Works"
          subtitle="Enterprise-grade voice AI built specifically for HVAC workflows"
        >
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">200ms Response Time</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Kestrel responds to callers in under 200 milliseconds—10x faster than competitors. This isn't just about speed; 
                it's about creating a natural conversation flow that feels human. Customers don't realize they're talking to AI 
                until we tell them.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Our proprietary voice engine eliminates the awkward pauses and robotic responses that plague other AI phone systems. 
                The result: 94% of callers rate the experience as "excellent" or "good."
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Natural Interruption Handling</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Real conversations aren't linear. Customers interrupt, change topics, and ask clarifying questions. Kestrel handles 
                these natural speech patterns seamlessly, unlike rigid IVR systems that force callers through menu trees.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                If a customer says "Wait, actually I need emergency service," mid-conversation, Kestrel immediately pivots to 
                emergency protocols without missing a beat.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Emergency Protocol Routing</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Kestrel is trained on HVAC emergency scenarios: no heat in winter, gas leaks, electrical issues, AC failures 
                during heat waves. It asks diagnostic questions to assess severity, then routes based on your custom protocols.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Example: "No heat" in January with outdoor temps below 32°F triggers immediate dispatch to your emergency line. 
                "No AC" in April might book next-day service. You define the rules; Kestrel executes them perfectly every time.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">ServiceTitan Integration</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Native integration with ServiceTitan means Kestrel automatically looks up existing customers by phone number, 
                retrieves service history, and books appointments in available time slots—all while the customer is on the phone.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Every call is logged with full transcripts, recordings, sentiment analysis, and AI-generated summaries. Your 
                dispatchers see exactly what was discussed before they even pick up the phone.
              </p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="benefits"
          title="Benefits for HVAC Companies"
          subtitle="Why leading HVAC contractors are switching to AI answering services"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{benefit.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">The Hidden Cost of Missed Calls</h3>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">23%</div>
                <p className="text-neutral-700">of HVAC calls go to voicemail during business hours</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">$385</div>
                <p className="text-neutral-700">Average revenue per HVAC service call</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">$47K</div>
                <p className="text-neutral-700">Annual revenue lost to missed calls (avg. HVAC company)</p>
              </div>
            </div>
            <p className="text-neutral-700 leading-relaxed">
              <strong>Industry data shows</strong> that 23% of calls to HVAC companies go unanswered, even during business hours. 
              After hours, that number jumps to 87%. With an average service call worth $385, a company receiving 50 calls/week 
              loses approximately $47,000/year in revenue from missed opportunities alone.
            </p>
          </div>
        </ContentSection>

        <ContentSection
          id="comparison"
          background="gray"
          title="HVAC AI vs. Human Answering Service"
          subtitle="See how Kestrel AI compares to traditional answering services"
        >
          <ComparisonTable
            competitorName="Traditional Answering Service"
            rows={comparisonRows}
          />
          
          <div className="mt-12 bg-white rounded-xl p-8 border border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">When to Choose AI (Kestrel)</h3>
            <ul className="space-y-3 text-neutral-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You need 24/7 coverage without the $60K+/year cost of round-the-clock staff</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You want instant appointment booking integrated with ServiceTitan/Jobber</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You're losing revenue to missed calls and slow response times</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You need emergency routing based on custom protocols (temperature thresholds, service type, etc.)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span>You want detailed analytics on call performance, booking rates, and revenue per call</span>
              </li>
            </ul>
          </div>
        </ContentSection>

        <ContentSection
          id="pricing"
          title="Pricing & ROI"
          subtitle="Transparent pricing with guaranteed ROI in 60 days or your money back"
        >
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 hover:border-blue-600 hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Starter</h3>
              <div className="text-4xl font-bold text-neutral-900 mb-4">$1,497<span className="text-lg text-neutral-600">/mo</span></div>
              <p className="text-neutral-600 mb-6">Up to 200 calls/month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">24/7 AI answering</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">ServiceTitan integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Emergency routing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Call recordings & transcripts</span>
                </li>
              </ul>
              <Link href="/calendar" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors">
                Get Started
              </Link>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Growth</h3>
              <div className="text-4xl font-bold mb-4">$1,997<span className="text-lg opacity-90">/mo</span></div>
              <p className="opacity-90 mb-6">Up to 500 calls/month</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Starter, plus:</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced analytics dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom voice & branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </li>
              </ul>
              <Link href="/calendar" className="block w-full bg-white text-blue-600 hover:bg-neutral-100 text-center py-3 rounded-lg font-semibold transition-colors">
                Get Started
              </Link>
            </div>

            <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 hover:border-blue-600 hover:shadow-xl transition-all">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-neutral-900 mb-4">$2,497<span className="text-lg text-neutral-600">/mo</span></div>
              <p className="text-neutral-600 mb-6">Unlimited calls</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Everything in Growth, plus:</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Unlimited calls</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Custom integrations</span>
                </li>
              </ul>
              <Link href="/calendar" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">ROI Calculator</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold mb-4">Traditional 24/7 Answering Service</h4>
                <div className="space-y-2 text-neutral-300">
                  <div className="flex justify-between">
                    <span>Monthly cost:</span>
                    <span className="font-semibold">$3,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual cost:</span>
                    <span className="font-semibold">$36,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missed calls (est.):</span>
                    <span className="font-semibold">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lost revenue/year:</span>
                    <span className="font-semibold text-red-400">$28,000</span>
                  </div>
                  <div className="border-t border-neutral-700 pt-2 mt-2 flex justify-between text-lg">
                    <span>Total cost:</span>
                    <span className="font-bold text-red-400">$64,000/year</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-4">Kestrel AI (Growth Plan)</h4>
                <div className="space-y-2 text-neutral-300">
                  <div className="flex justify-between">
                    <span>Monthly cost:</span>
                    <span className="font-semibold">$1,997</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual cost:</span>
                    <span className="font-semibold">$23,964</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missed calls:</span>
                    <span className="font-semibold text-green-400">0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lost revenue/year:</span>
                    <span className="font-semibold text-green-400">$0</span>
                  </div>
                  <div className="border-t border-neutral-700 pt-2 mt-2 flex justify-between text-lg">
                    <span>Total cost:</span>
                    <span className="font-bold text-green-400">$23,964/year</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-neutral-700 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">Save $40,036/year</div>
              <p className="text-neutral-300">Plus recover an additional $28,000 in previously missed revenue</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="case-studies"
          background="gray"
          title="Case Studies"
          subtitle="Real results from HVAC companies using Kestrel AI"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-blue-600 font-bold text-sm mb-2">WINTER STORM RESPONSE</div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">127 Emergency Calls in One Night</h3>
              <p className="text-neutral-600 mb-6">
                During a February cold snap, a Dallas HVAC company handled 127 emergency "no heat" calls between 6 PM and 6 AM. 
                Kestrel AI triaged every call, booked 89 emergency appointments, and routed 38 critical cases to on-call techs.
              </p>
              <Link href="/case-studies/winter-storm-emergency" className="text-blue-600 font-semibold hover:underline">
                Read full case study →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-green-600 font-bold text-sm mb-2">REVENUE GROWTH</div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">40% Increase in Booked Appointments</h3>
              <p className="text-neutral-600 mb-6">
                A Phoenix HVAC contractor saw appointment booking rates jump from 58% to 81% after implementing Kestrel AI. 
                The AI's instant booking capability eliminated the "I'll call you back" drop-off that plagued their human answering service.
              </p>
              <Link href="/case-studies/40-percent-revenue-increase" className="text-blue-600 font-semibold hover:underline">
                Read full case study →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-purple-600 font-bold text-sm mb-2">INTEGRATION SUCCESS</div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">ServiceTitan Integration in 48 Hours</h3>
              <p className="text-neutral-600 mb-6">
                A multi-location HVAC company with 15 technicians went from manual call logging to fully automated ServiceTitan 
                integration in under 48 hours. Every call now auto-creates customer records and books appointments in real-time.
              </p>
              <Link href="/case-studies/servicetitan-integration-success" className="text-blue-600 font-semibold hover:underline">
                Read full case study →
              </Link>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about AI answering services for HVAC"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection background="gradient">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Never Miss Another Call?</h2>
            <p className="text-xl mb-8 opacity-90">Join 200+ HVAC companies using Kestrel AI to answer every call, book more appointments, and grow revenue.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/case-studies" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                View Case Studies
              </Link>
            </div>
          </div>
        </ContentSection>
      </main>
      <Footer />
    </>
  );
}
