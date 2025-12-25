import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import ComparisonTable from '@/components/seo/ComparisonTable';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Wrench, Zap, CheckCircle, XCircle, ArrowRight, Settings } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: 'Bland AI Alternative for HVAC | Turnkey Solution | Kestrel',
  description: 'Kestrel vs Bland AI for HVAC businesses. Turnkey solution with HVAC-specific features, ServiceTitan integration, and dedicated support.',
  keywords: 'bland ai alternative, hvac ai solution, turnkey ai service, bland comparison',
  openGraph: {
    title: 'Bland AI Alternative for HVAC | Turnkey Solution',
    description: 'Turnkey HVAC AI solution vs Bland AI. Pre-built features, 48-hour setup, dedicated support.',
    type: 'website',
    url: 'https://kestrelai.com/bland-ai-alternative-hvac',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bland AI Alternative for HVAC | Turnkey Solution',
    description: 'Kestrel vs Bland AI for HVAC. Turnkey solution with HVAC-specific features.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How is Kestrel different from Bland AI for HVAC companies?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Bland AI is a powerful DIY platform that requires technical setup and custom development. Kestrel is a fully managed service with HVAC-specific features pre-built. With Bland, you spend weeks building; with Kestrel, you\'re live in 48 hours with zero technical work. We provide native ServiceTitan integration, HVAC-trained voice models, and 24/7 white-glove support.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Do I need technical skills to use Kestrel vs Bland AI?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Bland AI requires technical expertise in APIs, webhooks, and voice AI configuration. Kestrel requires zero technical skills. We handle all setup, configuration, and ongoing maintenance. You just tell us your business requirements and we make it work.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I migrate from Bland AI to Kestrel?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. We can migrate your Bland AI setup to Kestrel in 48-72 hours, importing your call flows and improving them with HVAC-specific optimizations. Most companies find Kestrel performs better because we\'ve refined workflows across 200+ HVAC companies.'
          }
        }
      ]
    })
  }
};

export default function BlandAIAlternativeHVAC() {
  const stats = [
    { value: '48hrs', label: 'Setup vs. weeks of DIY', icon: <Zap className="w-5 h-5 text-blue-500" /> },
    { value: '100%', label: 'HVAC-specific features', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
    { value: 'Native', label: 'ServiceTitan integration', icon: <Wrench className="w-5 h-5 text-purple-500" /> },
    { value: '24/7', label: 'White-glove support', icon: <Settings className="w-5 h-5 text-orange-500" /> }
  ];

  const comparisonRows = [
    { feature: 'Setup Complexity', kestrel: 'Turnkey (48 hours)', competitor: 'DIY (weeks of work)' },
    { feature: 'HVAC Features', kestrel: 'Pre-built', competitor: 'Build from scratch' },
    { feature: 'ServiceTitan Integration', kestrel: 'Native plug-and-play', competitor: 'Custom development' },
    { feature: 'Emergency Protocols', kestrel: 'Pre-configured', competitor: 'Design yourself' },
    { feature: 'Voice Optimization', kestrel: 'HVAC-trained', competitor: 'Generic' },
    { feature: 'Support', kestrel: '24/7 dedicated team', competitor: 'Email/Discord only' },
    { feature: 'Maintenance', kestrel: 'Fully managed', competitor: 'You maintain it' },
    { feature: 'Updates', kestrel: 'Automatic', competitor: 'Manual' },
    { feature: 'Total Cost (Year 1)', kestrel: '$28,959', competitor: '$20,000-35,000' },
    { feature: 'Technical Skills Needed', kestrel: 'None', competitor: 'Advanced' }
  ];

  const faqItems = [
    {
      question: 'How is Kestrel different from Bland AI for HVAC companies?',
      answer: 'Bland AI is a powerful DIY platform that requires technical setup and custom development. Kestrel is a fully managed service with HVAC-specific features pre-built. With Bland, you spend weeks building; with Kestrel, you\'re live in 48 hours with zero technical work. We provide native ServiceTitan integration, HVAC-trained voice models, and 24/7 white-glove support.'
    },
    {
      question: 'What technical skills do I need for Bland AI vs. Kestrel?',
      answer: 'Bland AI requires: API knowledge, webhook configuration, prompt engineering, custom integration development, and ongoing technical maintenance. Kestrel requires: none. We handle all technical aspects. You simply tell us your business requirements and we configure everything.'
    },
    {
      question: 'How much does Bland AI really cost vs. Kestrel?',
      answer: 'Bland AI: $0.09-0.12/minute ($900-1,500/month for 500 calls) + 30-50 hours setup time ($3,000-5,000) + custom ServiceTitan integration ($5,000-8,000) + monthly maintenance (5-8 hours). Total Year 1: $20,000-35,000. Kestrel: $28,959 Year 1, fully managed with zero technical work.'
    },
    {
      question: 'Can I migrate from Bland AI to Kestrel?',
      answer: 'Yes. We can migrate your Bland AI setup to Kestrel in 48-72 hours. We\'ll replicate your call flows, improve them with HVAC-specific optimizations, and add native ServiceTitan integration. Most companies find Kestrel performs better than their custom Bland build.'
    },
    {
      question: 'Does Kestrel have the same flexibility as Bland AI?',
      answer: 'For HVAC use cases, yes. Kestrel provides all the customization HVAC companies need (greetings, routing, emergency protocols, pricing) through a user-friendly interface. For truly unique requirements beyond standard HVAC workflows, we can build custom features for you.'
    },
    {
      question: 'What about voice quality - Bland vs. Kestrel?',
      answer: 'Both use similar underlying voice AI technology, but Kestrel\'s voice models are specifically trained on HVAC terminology, scenarios, and customer interactions. This results in more natural conversations about HVAC topics. Bland uses generic voice models that you must train yourself.'
    },
    {
      question: 'How does support compare?',
      answer: 'Bland AI: Email and Discord community support only. Response times vary, no dedicated team. Kestrel: 24/7 white-glove support with dedicated account managers. We proactively monitor your system and reach out if we see issues. Average response time: under 2 hours.'
    },
    {
      question: 'What if I want more control than Kestrel provides?',
      answer: 'Kestrel provides extensive customization through our dashboard: custom greetings, routing rules, emergency protocols, pricing responses, and more. For edge cases requiring deeper customization, we work with you to build it. 99% of HVAC companies find our standard customization options sufficient.'
    },
    {
      question: 'Can Kestrel handle the same call volume as Bland?',
      answer: 'Yes. Both can handle unlimited simultaneous calls. The difference is that with Kestrel, you don\'t need to worry about infrastructure, scaling, or performance optimization—we handle all of that. With Bland, you must manage infrastructure yourself.'
    },
    {
      question: 'What happens if I outgrow Kestrel?',
      answer: 'Kestrel scales with you from 1 truck to 100+ trucks. Our Enterprise plan handles unlimited calls and includes custom features. We have HVAC companies doing 10,000+ calls/month on Kestrel. If you have truly unique needs, we can build custom solutions within the platform.'
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
          badge="Managed Service vs. DIY Platform"
          title="Bland AI Alternative for HVAC - Pre-Built vs. Build-Your-Own"
          subtitle="Get HVAC-specific voice AI without weeks of technical setup. Native ServiceTitan integration, pre-configured emergency protocols, and 24/7 support included."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'See Comparison', href: '#comparison' }}
          trustIndicators={['No coding required', 'Live in 48 hours', 'HVAC-optimized']}
          stats={stats}
        />

        <ContentSection
          id="bland-vs-kestrel"
          title="Bland AI vs. Kestrel: The Key Difference"
          subtitle="DIY platform vs. managed service built for HVAC"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-8 border-2 border-neutral-300">
              <Settings className="w-12 h-12 text-neutral-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Bland AI (DIY Platform)</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Weeks of Setup Time</div>
                    <div className="text-sm text-neutral-600">30-50 hours to configure, test, and deploy</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Build Everything from Scratch</div>
                    <div className="text-sm text-neutral-600">Emergency protocols, booking logic, HVAC workflows</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Custom ServiceTitan Integration</div>
                    <div className="text-sm text-neutral-600">Develop entire integration using their API</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Generic Voice Models</div>
                    <div className="text-sm text-neutral-600">Not trained on HVAC terminology</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Email/Discord Support Only</div>
                    <div className="text-sm text-neutral-600">No dedicated support team</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">You Maintain Everything</div>
                    <div className="text-sm text-neutral-600">5-8 hours/month ongoing maintenance</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-orange-600">
                <div className="text-sm text-neutral-600 mb-1">True First-Year Cost:</div>
                <div className="text-2xl font-bold text-orange-700">$20K-$35K</div>
                <div className="text-xs text-neutral-500">Including setup time and development</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border-2 border-green-600">
              <Wrench className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Kestrel AI (Managed Service)</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">48-Hour Turnkey Setup</div>
                    <div className="text-sm text-neutral-600">We handle everything, zero technical work</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Pre-Built HVAC Features</div>
                    <div className="text-sm text-neutral-600">Emergency triage, booking, routing all included</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Native ServiceTitan Integration</div>
                    <div className="text-sm text-neutral-600">Plug-and-play, works in 30 minutes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">HVAC-Trained Voice Models</div>
                    <div className="text-sm text-neutral-600">Optimized for HVAC terminology and scenarios</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">24/7 White-Glove Support</div>
                    <div className="text-sm text-neutral-600">Dedicated account manager and support team</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Fully Managed Service</div>
                    <div className="text-sm text-neutral-600">Zero maintenance time required</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-600">
                <div className="text-sm text-neutral-600 mb-1">True First-Year Cost:</div>
                <div className="text-2xl font-bold text-green-700">$28,959</div>
                <div className="text-xs text-neutral-500">All-inclusive, fully managed</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Bottom Line</h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-neutral-700 leading-relaxed mb-4">
                <strong>Bland AI is excellent</strong> if you're a tech company building custom voice AI applications or have 
                in-house developers. It's flexible, powerful, and gives you complete control.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-4">
                <strong>Kestrel is better for HVAC companies</strong> who want results without technical complexity. We've built 
                all the HVAC-specific features you need, integrated with ServiceTitan natively, and provide 24/7 support. You 
                focus on running your HVAC business; we handle the voice AI.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                <strong>Cost comparison:</strong> While Bland appears cheaper per minute, when you factor in 30-50 hours of setup 
                time, custom integration development, and ongoing maintenance, the total cost is similar or higher—with significantly 
                more work required from you.
              </p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="comparison"
          background="gray"
          title="Feature-by-Feature Comparison"
          subtitle="Bland AI vs. Kestrel for HVAC companies"
        >
          <ComparisonTable
            title="Platform Comparison"
            competitorName="Bland AI (DIY)"
            rows={comparisonRows}
          />

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-bold text-neutral-900 mb-4">What Bland Does Well</h4>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Extremely flexible platform</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Lower per-minute costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Full control over everything</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Can build any workflow</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Good for custom applications</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-neutral-600">
                <strong>Best for:</strong> Tech companies with developers building unique voice AI apps
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-green-600">
              <h4 className="text-xl font-bold text-neutral-900 mb-4">Where Kestrel Excels</h4>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Pre-built HVAC workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Native ServiceTitan integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>48-hour turnkey setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Zero technical work required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>24/7 white-glove support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>HVAC-trained voice models</span>
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
              <h4 className="text-xl font-bold text-neutral-900 mb-4">Hidden Bland Costs</h4>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>30-50 hours setup time</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>ServiceTitan integration dev</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>5-8 hours/month maintenance</span>
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
                <strong>Reality:</strong> Lower per-minute costs become expensive with time investment
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="hvac-specific"
          title="HVAC-Specific Features: Pre-Built vs. DIY"
          subtitle="What you get out-of-the-box with Kestrel vs. what you must build with Bland"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">With Bland AI (You Build)</h3>
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="font-semibold text-neutral-900 mb-2">Emergency Triage Logic</div>
                  <div className="text-sm text-neutral-600 mb-2">Design decision trees for: no heat, no AC, gas leaks, electrical issues</div>
                  <div className="text-xs text-orange-600">Estimated time: 10-15 hours</div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="font-semibold text-neutral-900 mb-2">ServiceTitan Integration</div>
                  <div className="text-sm text-neutral-600 mb-2">Build API integration for customer lookup, appointment booking, job creation</div>
                  <div className="text-xs text-orange-600">Estimated time: 20-30 hours</div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="font-semibold text-neutral-900 mb-2">HVAC Terminology Training</div>
                  <div className="text-sm text-neutral-600 mb-2">Train AI on HVAC terms, common issues, equipment types</div>
                  <div className="text-xs text-orange-600">Estimated time: 8-12 hours</div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="font-semibold text-neutral-900 mb-2">Appointment Booking Logic</div>
                  <div className="text-sm text-neutral-600 mb-2">Build calendar integration, availability checking, confirmation system</div>
                  <div className="text-xs text-orange-600">Estimated time: 12-18 hours</div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <div className="font-semibold text-neutral-900 mb-2">Seasonal Routing Rules</div>
                  <div className="text-sm text-neutral-600 mb-2">Configure different protocols for summer vs. winter emergencies</div>
                  <div className="text-xs text-orange-600">Estimated time: 5-8 hours</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="text-2xl font-bold text-orange-700 mb-1">55-83 Hours</div>
                <div className="text-sm text-neutral-600">Total development time for HVAC features</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 shadow-lg border-2 border-green-600">
              <h3 className="text-xl font-bold text-neutral-900 mb-6">With Kestrel AI (Pre-Built)</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="font-semibold text-neutral-900 mb-2">Emergency Triage Logic ✓</div>
                  <div className="text-sm text-neutral-600 mb-2">Pre-configured for all HVAC emergencies with temperature-based routing</div>
                  <div className="text-xs text-green-600">Included out-of-the-box</div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="font-semibold text-neutral-900 mb-2">ServiceTitan Integration ✓</div>
                  <div className="text-sm text-neutral-600 mb-2">Native integration, plug-and-play in 30 minutes</div>
                  <div className="text-xs text-green-600">Included out-of-the-box</div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="font-semibold text-neutral-900 mb-2">HVAC Terminology Training ✓</div>
                  <div className="text-sm text-neutral-600 mb-2">Voice models trained on 100,000+ HVAC conversations</div>
                  <div className="text-xs text-green-600">Included out-of-the-box</div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="font-semibold text-neutral-900 mb-2">Appointment Booking Logic ✓</div>
                  <div className="text-sm text-neutral-600 mb-2">Intelligent booking with availability checking and confirmations</div>
                  <div className="text-xs text-green-600">Included out-of-the-box</div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <div className="font-semibold text-neutral-900 mb-2">Seasonal Routing Rules ✓</div>
                  <div className="text-sm text-neutral-600 mb-2">Automatic adjustment based on weather and season</div>
                  <div className="text-xs text-green-600">Included out-of-the-box</div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-green-300">
                <div className="text-2xl font-bold text-green-700 mb-1">0 Hours</div>
                <div className="text-sm text-neutral-600">Everything pre-built and ready to use</div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="migration"
          background="gray"
          title="Migrating from Bland AI to Kestrel"
          subtitle="We handle the entire migration in 48-72 hours"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg mb-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Simple 3-Step Migration Process</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Review Your Bland Setup (30 min)</div>
                    <div className="text-sm text-neutral-700">We analyze your current Bland configuration, call flows, and integrations</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Configure Kestrel (24 hours)</div>
                    <div className="text-sm text-neutral-700">We replicate your logic, add HVAC optimizations, and set up ServiceTitan</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <div className="font-semibold text-neutral-900 mb-2">Test & Switch (24 hours)</div>
                    <div className="text-sm text-neutral-700">Run in parallel, compare performance, then cutover when ready</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Migration Complete in 48-72 Hours</h3>
              <p className="text-lg opacity-90 mb-6">
                Most companies find Kestrel performs better than their custom Bland build, with zero ongoing maintenance.
              </p>
              <Link href="/calendar" className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg">
                Schedule Migration Call
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Common questions about Bland AI vs. Kestrel"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection background="gray">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Stop Building and Start Growing?</h2>
            <p className="text-xl mb-8 opacity-90">
              Get all the HVAC features you need, pre-built and ready to use. Live in 48 hours with zero technical work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/hvac-ai-answering-service" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                Learn More
              </Link>
            </div>
            <p className="text-sm opacity-75 mt-6">No long-term contracts • Run in parallel first • We handle migration</p>
          </div>
        </ContentSection>
        <Sources sources={[
          { id: 1, citation: 'Platform comparison - Bland AI DIY setup vs Kestrel managed HVAC solution' },
          { id: 2, citation: 'Kestrel AI HVAC Optimization (2024) - Industry-specific training on 50,000+ HVAC calls' },
          { id: 3, citation: 'ServiceTitan native integration - 30-minute setup vs weeks of custom API development' }
        ]} />
      </main>
      <Footer />
    </>
  );
}
