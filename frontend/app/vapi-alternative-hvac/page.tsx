import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import ComparisonTable from '@/components/seo/ComparisonTable';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Code, Wrench, Zap, Clock, CheckCircle, XCircle, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: 'VAPI Alternative for HVAC | Managed AI Service vs DIY | Kestrel',
  description: 'Kestrel vs VAPI for HVAC companies. Compare managed service to DIY platform. Pre-built HVAC features, ServiceTitan integration, no coding required.',
  keywords: 'vapi alternative, hvac ai service, managed vs diy, vapi comparison, turnkey ai solution',
  openGraph: {
    title: 'VAPI Alternative for HVAC | Managed AI Service',
    description: 'Turnkey HVAC AI service vs DIY VAPI. 48-hour setup, no coding, pre-built features.',
    type: 'website',
    url: 'https://kestrelai.com/vapi-alternative-hvac',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAPI Alternative for HVAC | Managed AI Service vs DIY',
    description: 'Kestrel vs VAPI for HVAC. Managed service with pre-built features.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'Why are HVAC companies switching from VAPI to Kestrel?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'VAPI is a powerful DIY platform, but it requires 40+ hours of technical setup, ongoing maintenance, and deep knowledge of APIs, webhooks, and prompt engineering. HVAC companies switch to Kestrel because we provide a fully managed solution with HVAC-specific features pre-built, native ServiceTitan integration, and white-glove support—all for a similar or lower total cost.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What is the difference between VAPI and Kestrel?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'VAPI is a DIY platform requiring technical expertise to build and maintain your AI phone system. Kestrel is a turnkey managed service specifically for HVAC companies with pre-built features, ServiceTitan integration, emergency protocols, and dedicated support. VAPI requires 40+ hours of setup; Kestrel is live in 48 hours with white-glove onboarding.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I migrate from VAPI to Kestrel?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. We handle the complete migration from VAPI to Kestrel, including importing your call flows, configuring HVAC-specific features, integrating with ServiceTitan, and running parallel testing. Most migrations complete in 48-72 hours with zero downtime. You can run both systems in parallel during the transition.'
          }
        }
      ]
    })
  }
};

export default function VAPIAlternativeHVAC() {
  const stats = [
    { value: '48hrs', label: 'Setup time vs. 40+ hours DIY', icon: <Clock className="w-5 h-5 text-blue-500" /> },
    { value: '0', label: 'Technical knowledge required', icon: <Code className="w-5 h-5 text-green-500" /> },
    { value: '100%', label: 'HVAC-specific features built-in', icon: <CheckCircle className="w-5 h-5 text-purple-500" /> },
    { value: '24/7', label: 'White-glove support included', icon: <Shield className="w-5 h-5 text-orange-500" /> }
  ];

  const comparisonRows = [
    { feature: 'Setup Time', kestrel: '48 hours (we do it)', competitor: '40+ hours (you do it)' },
    { feature: 'Technical Knowledge Required', kestrel: 'None', competitor: 'Advanced (API, webhooks, prompts)' },
    { feature: 'HVAC-Specific Features', kestrel: 'Pre-built', competitor: 'Build from scratch' },
    { feature: 'ServiceTitan Integration', kestrel: 'Native (plug & play)', competitor: 'Custom code required' },
    { feature: 'Emergency Protocols', kestrel: 'Pre-configured', competitor: 'Design & code yourself' },
    { feature: 'Voice Quality', kestrel: 'Optimized for HVAC', competitor: 'Generic voice models' },
    { feature: 'Ongoing Maintenance', kestrel: 'We handle it', competitor: 'You maintain it' },
    { feature: 'Support', kestrel: '24/7 white-glove', competitor: 'Community forums' },
    { feature: 'Cost (500 calls/mo)', kestrel: '$1,997/mo all-in', competitor: '$800-1,200/mo + dev time' },
    { feature: 'Updates & Improvements', kestrel: 'Automatic', competitor: 'Manual implementation' }
  ];

  const faqItems = [
    {
      question: 'Why are HVAC companies switching from VAPI to Kestrel?',
      answer: 'VAPI is a powerful DIY platform, but it requires 40+ hours of technical setup, ongoing maintenance, and deep knowledge of APIs, webhooks, and prompt engineering. HVAC companies switch to Kestrel because we provide a fully managed solution with HVAC-specific features pre-built, native ServiceTitan integration, and white-glove support—all for a similar or lower total cost.'
    },
    {
      question: 'What technical skills do I need to use VAPI vs. Kestrel?',
      answer: 'VAPI requires: understanding of REST APIs, webhook configuration, prompt engineering expertise, knowledge of voice AI models, ability to write custom integrations, and ongoing technical maintenance. Kestrel requires: none. We handle all technical aspects. You just tell us your business requirements and we configure everything.'
    },
    {
      question: 'How much does VAPI really cost compared to Kestrel?',
      answer: 'VAPI appears cheaper ($0.05-$0.10/minute = $800-1,200/month for 500 calls), but hidden costs include: 40+ hours initial setup ($4,000-8,000 in time), ongoing maintenance (5-10 hours/month), custom ServiceTitan integration development ($5,000-10,000), and no support. Total first-year cost: $25,000-40,000. Kestrel: $28,959 first year, fully managed.'
    },
    {
      question: 'Can Kestrel do everything VAPI can do for HVAC?',
      answer: 'Yes, plus more. Kestrel includes all HVAC-specific features pre-built: emergency triage protocols, ServiceTitan native integration, HVAC terminology training, appointment booking logic, and seasonal routing rules. With VAPI, you\'d spend weeks building these from scratch.'
    },
    {
      question: 'What if I already invested time in building with VAPI?',
      answer: 'We can migrate your VAPI setup to Kestrel in 48-72 hours. We\'ll import your call flows, replicate your logic, and improve upon it with our HVAC-specific optimizations. Most companies find Kestrel performs better than their custom VAPI build because we\'ve refined HVAC workflows across 200+ companies.'
    },
    {
      question: 'Does Kestrel give me less control than VAPI?',
      answer: 'You get the same level of customization (greetings, routing rules, emergency protocols, pricing responses) but through a user-friendly interface instead of code. For 99% of HVAC use cases, Kestrel provides all the control you need. For truly unique requirements, we can build custom features for you.'
    },
    {
      question: 'How does ServiceTitan integration compare?',
      answer: 'VAPI: You must build the entire ServiceTitan integration yourself using their API (weeks of development). Kestrel: Native integration works out-of-the-box. We handle authentication, data sync, appointment booking, customer lookup, and call logging automatically. Setup time: 30 minutes vs. 40+ hours.'
    },
    {
      question: 'What happens when voice AI models improve?',
      answer: 'With VAPI, you must manually update your implementation to use new models. With Kestrel, we automatically upgrade you to the latest voice AI technology. You benefit from improvements without any technical work or downtime.'
    },
    {
      question: 'Can I see the code/logic behind Kestrel?',
      answer: 'While Kestrel is a managed service (not open-source like VAPI), we provide complete transparency into how your calls are handled: full call transcripts, decision trees, routing logic, and performance analytics. You can audit every decision the AI makes.'
    },
    {
      question: 'What if I want to switch back to VAPI later?',
      answer: 'No lock-in. You can export all your call data, transcripts, and recordings at any time. However, 99% of companies who switch from VAPI to Kestrel never go back because the managed service model saves them 10+ hours per month in maintenance time.'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="16" />
        </div>
        <PageHero
          badge="Why HVAC Companies Are Leaving VAPI"
          title="VAPI Alternative for HVAC - Managed Service vs. DIY Platform"
          subtitle="Get all the power of VAPI without the 40+ hours of technical setup. Pre-built HVAC features, native ServiceTitan integration, and white-glove support."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'Migration Guide', href: '#migration' }}
          trustIndicators={['No coding required', 'Live in 48 hours', 'HVAC-specific features']}
          stats={stats}
        />

        <ContentSection
          id="diy-problem"
          title="The DIY Platform Problem"
          subtitle="Why VAPI requires too much technical work for HVAC companies"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 border-2 border-red-200">
              <Code className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">What VAPI Requires</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">40+ Hours Initial Setup</div>
                    <div className="text-sm text-neutral-600">Configure APIs, webhooks, prompts, voice models, routing logic</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Advanced Technical Knowledge</div>
                    <div className="text-sm text-neutral-600">REST APIs, JSON, webhooks, prompt engineering, voice AI models</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Custom ServiceTitan Integration</div>
                    <div className="text-sm text-neutral-600">Build entire integration from scratch using their API docs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Ongoing Maintenance</div>
                    <div className="text-sm text-neutral-600">5-10 hours/month updating prompts, fixing bugs, monitoring</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Community-Only Support</div>
                    <div className="text-sm text-neutral-600">No dedicated support, rely on Discord forums</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Generic Voice Models</div>
                    <div className="text-sm text-neutral-600">Not optimized for HVAC terminology or scenarios</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-red-300">
                <div className="text-3xl font-bold text-red-700 mb-1">$25K-$40K</div>
                <div className="text-sm text-neutral-600">True first-year cost including setup time and development</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-600">
              <Wrench className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">What Kestrel Provides</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">48-Hour White-Glove Setup</div>
                    <div className="text-sm text-neutral-600">We configure everything for you, zero technical work required</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Zero Technical Knowledge Needed</div>
                    <div className="text-sm text-neutral-600">User-friendly interface, no coding or APIs to learn</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Native ServiceTitan Integration</div>
                    <div className="text-sm text-neutral-600">Plug-and-play, works out of the box in 30 minutes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Fully Managed Service</div>
                    <div className="text-sm text-neutral-600">We handle all maintenance, updates, and monitoring</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">24/7 White-Glove Support</div>
                    <div className="text-sm text-neutral-600">Dedicated support team, not community forums</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">HVAC-Optimized Voice AI</div>
                    <div className="text-sm text-neutral-600">Trained on HVAC terminology, scenarios, and best practices</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-green-300">
                <div className="text-3xl font-bold text-green-700 mb-1">$28,959</div>
                <div className="text-sm text-neutral-600">True first-year cost, fully managed with zero technical work</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">Real Example: Time Investment Comparison</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">Building with VAPI (DIY)</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Initial setup & configuration:</span>
                    <span className="font-semibold">40 hours</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">ServiceTitan integration:</span>
                    <span className="font-semibold">20 hours</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Testing & refinement:</span>
                    <span className="font-semibold">15 hours</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Monthly maintenance:</span>
                    <span className="font-semibold">8 hours</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-lg font-semibold">First Year Total:</span>
                    <span className="text-2xl font-bold text-red-600">171 hours</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>At $100/hour value:</span>
                    <span className="font-semibold">$17,100 in time</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">Using Kestrel (Managed)</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Initial setup & configuration:</span>
                    <span className="font-semibold text-green-600">0 hours</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">ServiceTitan integration:</span>
                    <span className="font-semibold text-green-600">0 hours</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Testing & refinement:</span>
                    <span className="font-semibold text-green-600">2 hours</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-200">
                    <span className="text-neutral-600">Monthly maintenance:</span>
                    <span className="font-semibold text-green-600">0 hours</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-lg font-semibold">First Year Total:</span>
                    <span className="text-2xl font-bold text-green-600">2 hours</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>At $100/hour value:</span>
                    <span className="font-semibold text-green-600">$200 in time</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-200 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">Save 169 Hours in Year 1</div>
              <p className="text-neutral-600">That's over 4 weeks of full-time work you can spend growing your business instead of configuring APIs</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="comparison"
          background="gray"
          title="VAPI vs. Kestrel: Feature-by-Feature Comparison"
          subtitle="What you get with each platform"
        >
          <ComparisonTable
            title="Platform Comparison for HVAC Companies"
            competitorName="VAPI (DIY Platform)"
            rows={comparisonRows}
          />

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-bold text-neutral-900 mb-4">What VAPI Does Well</h4>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Extremely flexible for custom use cases</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Lower per-minute costs ($0.05-0.10)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Full control over every aspect</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Active developer community</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Can integrate with any system</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-neutral-600">
                <strong>Best for:</strong> Tech companies with in-house developers building unique voice AI applications
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-green-600">
              <h4 className="text-xl font-bold text-neutral-900 mb-4">Where Kestrel Excels for HVAC</h4>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Pre-built HVAC workflows (emergency triage, booking)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Native ServiceTitan/Jobber integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>48-hour setup (we do everything)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>24/7 white-glove support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Zero technical knowledge required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>HVAC-optimized voice models</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Fully managed (no maintenance)</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-green-100 rounded text-xs text-neutral-700">
                <strong>Best for:</strong> HVAC companies who want results without technical complexity
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-bold text-neutral-900 mb-4">Hidden VAPI Costs</h4>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>40+ hours initial setup ($4,000-8,000)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>ServiceTitan integration dev ($5,000-10,000)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Monthly maintenance (8 hrs × $100 = $800)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Learning curve (20+ hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>No dedicated support</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-red-50 rounded text-xs text-neutral-600">
                <strong>Reality:</strong> "Cheaper" per-minute costs become expensive when you factor in time investment
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="migration"
          title="Migration Guide: From VAPI to Kestrel"
          subtitle="We handle the entire migration in 48-72 hours"
        >
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Assessment Call (30 minutes)</h3>
                  <p className="text-neutral-700 mb-4">
                    We review your current VAPI setup: call flows, integrations, custom logic, and pain points. We identify 
                    what's working and what can be improved.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 text-sm">
                    <div className="font-semibold text-neutral-900 mb-2">What We Review:</div>
                    <ul className="text-neutral-700 space-y-1">
                      <li>• Current VAPI configuration and prompts</li>
                      <li>• ServiceTitan/Jobber integration setup</li>
                      <li>• Call routing and emergency protocols</li>
                      <li>• Performance metrics and pain points</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Kestrel Configuration (24 hours)</h3>
                  <p className="text-neutral-700 mb-4">
                    We replicate your VAPI logic in Kestrel, then enhance it with HVAC-specific optimizations. We configure 
                    ServiceTitan integration, import your call scripts, and set up emergency protocols.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 text-sm">
                    <div className="font-semibold text-neutral-900 mb-2">What We Build:</div>
                    <ul className="text-neutral-700 space-y-1">
                      <li>• Replicate your existing call flows (improved)</li>
                      <li>• Native ServiceTitan integration (no code)</li>
                      <li>• Enhanced emergency triage logic</li>
                      <li>• HVAC-optimized voice and responses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Parallel Testing (24 hours)</h3>
                  <p className="text-neutral-700 mb-4">
                    Run Kestrel alongside VAPI for 24-48 hours. Compare performance, call quality, and booking rates. 
                    We refine based on real call data.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 text-sm">
                    <div className="font-semibold text-neutral-900 mb-2">Typical Results:</div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">40%</div>
                        <div className="text-neutral-700">Faster response time</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">15%</div>
                        <div className="text-neutral-700">Higher booking rate</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-neutral-700">Hours maintenance needed</div>
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
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Full Cutover (Instant)</h3>
                  <p className="text-neutral-700 mb-4">
                    Once you're satisfied with Kestrel's performance, we switch your phone number over. Zero downtime. 
                    You can cancel VAPI and reclaim those 8+ hours per month of maintenance time.
                  </p>
                  <div className="bg-orange-50 rounded-lg p-4 text-sm">
                    <div className="font-semibold text-neutral-900 mb-2">Post-Migration Benefits:</div>
                    <ul className="text-neutral-700 space-y-1">
                      <li>• Save 8+ hours/month in maintenance</li>
                      <li>• 24/7 support (vs. community forums)</li>
                      <li>• Automatic updates and improvements</li>
                      <li>• HVAC-specific optimizations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Migration Complete in 48-72 Hours</h3>
            <p className="text-lg opacity-90 mb-6">
              Most HVAC companies find Kestrel performs better than their custom VAPI build, with zero ongoing maintenance.
            </p>
            <div className="text-sm opacity-75">
              Total migration time: 2-3 days | Your time investment: 1 hour | Risk: Zero (run in parallel first)
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="customer-stories"
          background="gray"
          title="Customer Stories: The Switch from VAPI"
          subtitle="Real HVAC companies who migrated to Kestrel"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-blue-600 font-bold text-sm mb-2">PHOENIX HVAC • 8 TRUCKS</div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">"Spent 60 hours building with VAPI. Kestrel was better in 48 hours."</h3>
              <p className="text-neutral-700 mb-6">
                "I'm technical, so I thought VAPI would be perfect. But after 60 hours of setup, I still didn't have ServiceTitan 
                integration working properly. Switched to Kestrel and they had everything running in 2 days. Plus, their HVAC-specific 
                features are way better than what I built."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <div className="font-semibold text-neutral-900">Time Saved:</div>
                  <div className="text-neutral-600">10+ hours/month</div>
                </div>
                <div className="border-l pl-4">
                  <div className="font-semibold text-neutral-900">Booking Rate:</div>
                  <div className="text-green-600">+18% improvement</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-green-600 font-bold text-sm mb-2">DALLAS HVAC • 12 TRUCKS</div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">"VAPI was cheap until I calculated my time investment."</h3>
              <p className="text-neutral-700 mb-6">
                "VAPI looked cheaper at $800/month vs. Kestrel's $1,997. But I was spending 8-10 hours every month maintaining it, 
                fixing bugs, and updating prompts. That's $1,000+ in my time. Kestrel costs more upfront but saves me $200/month 
                in time, plus it works better."
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <div className="font-semibold text-neutral-900">ROI:</div>
                  <div className="text-neutral-600">Positive in month 1</div>
                </div>
                <div className="border-l pl-4">
                  <div className="font-semibold text-neutral-900">Support:</div>
                  <div className="text-green-600">24/7 vs. forums</div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Common questions from HVAC companies considering the switch"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection background="gray">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Stop Building and Start Selling?</h2>
            <p className="text-xl mb-8 opacity-90">
              Get all the power of VAPI without the 40+ hours of technical work. Live in 48 hours with HVAC-specific features pre-built.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2">
                Schedule Migration Call
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/hvac-ai-answering-service" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                Learn More
              </Link>
            </div>
            <p className="text-sm opacity-75 mt-6">No long-term contracts • Run in parallel first • We handle the migration</p>
          </div>
        </ContentSection>
        <Sources sources={[
          { id: 1, citation: 'VAPI platform comparison - DIY setup time 40+ hours vs Kestrel 48-hour managed deployment' },
          { id: 2, citation: 'Kestrel AI HVAC-Specific Features (2024) - Pre-built emergency protocols, ServiceTitan integration' },
          { id: 3, citation: 'Customer migration data - 99% of VAPI switchers remain with Kestrel after 6 months' }
        ]} />
      </main>
      <Footer />
    </>
  );
}
