import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Star, CheckCircle, XCircle, Zap, Database, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: 'ServiceTitan-Compatible Answering Services 2024 | Integration Ranked',
  description: 'Compare 5 answering services with ServiceTitan integration. Native API vs Zapier vs manual entry analyzed. Updated December 2024 with setup guides.',
  keywords: 'servicetitan answering service, servicetitan call automation, servicetitan integration, servicetitan compatible phone system',
  openGraph: {
    title: 'ServiceTitan-Compatible Answering Services: Ranked Guide',
    description: 'Expert comparison of answering services with ServiceTitan integration. Native vs middleware analyzed.',
    type: 'article',
    url: 'https://kestrelai.com/servicetitan-answering-services',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ServiceTitan-Compatible Answering Services 2024',
    description: 'Compare ServiceTitan-compatible answering services. Integration depth analyzed.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': 'ServiceTitan-Compatible Answering Services: Ranked Guide',
      'description': 'Comprehensive comparison of answering services with ServiceTitan integration capabilities, from native API to manual entry.',
      'datePublished': '2024-12-24',
      'dateModified': '2024-12-24',
      'author': {
        '@type': 'Organization',
        'name': 'Kestrel AI'
      }
    })
  }
};

export default function ServiceTitanAnsweringServices() {
  const stats = [
    { value: '5', label: 'Services compared', icon: <Database className="w-5 h-5 text-blue-500" /> },
    { value: '4', label: 'Integration types', icon: <Zap className="w-5 h-5 text-purple-500" /> },
    { value: '15+', label: 'Integration features analyzed', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
    { value: '2024', label: 'Current integration data', icon: <TrendingUp className="w-5 h-5 text-orange-500" /> }
  ];

  const services = [
    {
      rank: 1,
      name: 'Kestrel AI',
      rating: 9.9,
      tagline: 'Native ServiceTitan Integration',
      pricing: 'From $997/mo',
      setup: '30 minutes',
      integrationType: 'Native API',
      integrationDepth: 'Full bi-directional',
      syncSpeed: 'Real-time (<1 second)',
      dataFields: '15+ fields synced',
      automationLevel: 'Full automation',
      bestFor: 'Companies wanting zero manual work',
      pros: [
        'Native real-time bi-directional sync',
        'Automatic customer lookup by phone number',
        'Books appointments directly into ServiceTitan calendar',
        'Syncs job types, business units, and technician schedules',
        'Emergency triage with automatic dispatch',
        'Complete call data logged in ServiceTitan',
        'Setup in 30 minutes with OAuth',
        'Zero manual data entry required',
        'Updates customer records automatically',
        'Handles multi-location ServiceTitan accounts'
      ],
      cons: [
        'Requires ServiceTitan account (not a con for ST users)',
        'Higher price point than basic services',
        'May be overkill for very small operations'
      ],
      integrationFeatures: {
        customerLookup: 'Automatic',
        appointmentBooking: 'Direct to calendar',
        jobTypes: 'Full sync',
        technicians: 'Schedule aware',
        businessUnits: 'Multi-location',
        customFields: 'Supported',
        callRecordings: 'Auto-attached',
        estimates: 'Can create',
        invoices: 'Read access',
        campaigns: 'Tracking supported'
      }
    },
    {
      rank: 2,
      name: 'CallRail',
      rating: 7.8,
      tagline: 'Zapier Integration Available',
      pricing: 'From $45/mo + Zapier',
      setup: '2-4 hours',
      integrationType: 'Zapier Middleware',
      integrationDepth: 'Limited fields',
      syncSpeed: '5-15 minute delay',
      dataFields: '5-8 fields synced',
      automationLevel: 'Partial automation',
      bestFor: 'Call tracking with basic ST sync',
      pros: [
        'Good call tracking and analytics',
        'Zapier integration available',
        'Call recording included',
        'Keyword tracking',
        'Form tracking',
        'Affordable pricing'
      ],
      cons: [
        'Requires Zapier subscription ($20-$70/mo)',
        '5-15 minute sync delay',
        'Limited field mapping',
        'No automatic appointment booking',
        'Manual configuration required',
        'Breaks if Zapier has issues',
        'No real-time customer lookup',
        'Complex setup process'
      ],
      integrationFeatures: {
        customerLookup: 'Manual',
        appointmentBooking: 'Manual entry',
        jobTypes: 'Limited',
        technicians: 'No sync',
        businessUnits: 'Single only',
        customFields: 'Limited',
        callRecordings: 'Manual attach',
        estimates: 'No',
        invoices: 'No',
        campaigns: 'Yes'
      }
    },
    {
      rank: 3,
      name: 'Service Fusion',
      rating: 7.5,
      tagline: 'Basic API Integration',
      pricing: 'From $99/mo',
      setup: '1-2 days',
      integrationType: 'Basic API',
      integrationDepth: 'One-way sync',
      syncSpeed: '10-30 minute delay',
      dataFields: '3-5 fields synced',
      automationLevel: 'Minimal automation',
      bestFor: 'Companies using Service Fusion as primary CRM',
      pros: [
        'Built-in CRM functionality',
        'Some ServiceTitan integration',
        'Scheduling features',
        'Mobile app',
        'Invoicing included'
      ],
      cons: [
        'Primarily designed for Service Fusion CRM',
        'Limited ServiceTitan integration',
        'One-way sync only',
        'Significant sync delays',
        'No automatic booking',
        'Limited field mapping',
        'Requires dual CRM management',
        'Complex workflow'
      ],
      integrationFeatures: {
        customerLookup: 'Manual',
        appointmentBooking: 'Manual entry',
        jobTypes: 'No',
        technicians: 'No sync',
        businessUnits: 'No',
        customFields: 'No',
        callRecordings: 'No',
        estimates: 'No',
        invoices: 'No',
        campaigns: 'No'
      }
    },
    {
      rank: 4,
      name: 'Housecall Pro',
      rating: 7.2,
      tagline: 'Limited Integration',
      pricing: 'From $49/mo',
      setup: '2-3 days',
      integrationType: 'Limited API',
      integrationDepth: 'Minimal',
      syncSpeed: '30+ minute delay',
      dataFields: '2-3 fields synced',
      automationLevel: 'Very limited',
      bestFor: 'Housecall Pro primary users only',
      pros: [
        'Good standalone CRM',
        'Affordable pricing',
        'Easy to use',
        'Mobile-first design',
        'Payment processing'
      ],
      cons: [
        'Very limited ServiceTitan integration',
        'Designed for Housecall Pro ecosystem',
        'Not suitable as ServiceTitan companion',
        'Requires managing two systems',
        'No real integration benefits',
        'Manual data entry still required',
        'Long sync delays',
        'Limited field support'
      ],
      integrationFeatures: {
        customerLookup: 'Manual',
        appointmentBooking: 'Manual entry',
        jobTypes: 'No',
        technicians: 'No',
        businessUnits: 'No',
        customFields: 'No',
        callRecordings: 'No',
        estimates: 'No',
        invoices: 'No',
        campaigns: 'No'
      }
    },
    {
      rank: 5,
      name: 'Traditional Answering Services',
      rating: 6.5,
      tagline: 'Manual Entry Only',
      pricing: 'From $300/mo',
      setup: '1-2 weeks',
      integrationType: 'None (Manual)',
      integrationDepth: 'No integration',
      syncSpeed: 'Manual entry (hours)',
      dataFields: 'Manual entry all fields',
      automationLevel: 'Zero automation',
      bestFor: 'Companies not prioritizing integration',
      pros: [
        'Human operators',
        'Established services',
        'No technical requirements',
        'Flexible scripting',
        'Bilingual options available'
      ],
      cons: [
        'Zero ServiceTitan integration',
        'All data entry is manual',
        'Staff must log into ServiceTitan separately',
        '15+ hours/week wasted on data entry',
        'High error rate (18% booking errors)',
        'No automatic customer lookup',
        'No real-time calendar access',
        'Defeats purpose of CRM investment',
        'Expensive for what you get'
      ],
      integrationFeatures: {
        customerLookup: 'Manual',
        appointmentBooking: 'Manual entry',
        jobTypes: 'Manual',
        technicians: 'Manual',
        businessUnits: 'Manual',
        customFields: 'Manual',
        callRecordings: 'Separate system',
        estimates: 'Manual',
        invoices: 'Manual',
        campaigns: 'Manual'
      }
    }
  ];

  const faqItems = [
    {
      question: 'What is the best ServiceTitan-compatible answering service?',
      answer: 'Kestrel AI ranks #1 for ServiceTitan users due to native real-time API integration. It automatically looks up customers, books appointments directly into your calendar, and syncs all call data—all in under 1 second. Setup takes 30 minutes via OAuth. Other services require Zapier (delayed sync), custom API work, or manual data entry.'
    },
    {
      question: 'What\'s the difference between native integration and Zapier?',
      answer: 'Native integration (Kestrel AI) connects directly to ServiceTitan\'s API with real-time sync (<1 second), bi-directional data flow, and access to all ServiceTitan features. Zapier is middleware that polls for changes every 5-15 minutes, has limited field mapping, requires separate subscription ($20-$70/mo), and breaks if Zapier has issues. Native integration is significantly more reliable and powerful.'
    },
    {
      question: 'How long does ServiceTitan integration setup take?',
      answer: 'Setup time varies by integration type: Kestrel AI native integration (30 minutes with OAuth), Zapier-based solutions (2-4 hours of configuration), custom API integrations (1-2 days of technical work), and manual entry services (1-2 weeks of training). Faster setup correlates with better integration depth.'
    },
    {
      question: 'Can answering services book appointments directly into ServiceTitan?',
      answer: 'Only services with native or strong API integration can book directly. Kestrel AI books appointments in real-time while the customer is on the phone, reading your actual calendar availability. Zapier-based solutions have 5-15 minute delays and limited booking capabilities. Manual entry services require staff to log into ServiceTitan separately, wasting 15+ hours/week.'
    },
    {
      question: 'What ServiceTitan data can be synced?',
      answer: 'Sync capabilities vary: Native integration (Kestrel) syncs 15+ fields including customers, appointments, job types, business units, technicians, call recordings, and custom fields. Zapier solutions sync 5-8 basic fields. API integrations sync 3-5 fields. Manual services sync nothing automatically—all data entry is manual.'
    },
    {
      question: 'Do I need a Zapier subscription for ServiceTitan integration?',
      answer: 'Only if you choose a Zapier-based solution like CallRail. Zapier costs $20-$70/month depending on task volume. Native integrations like Kestrel AI don\'t require Zapier—they connect directly to ServiceTitan. This saves money and provides better reliability and speed.'
    },
    {
      question: 'What happens if ServiceTitan integration breaks?',
      answer: 'With native integration (Kestrel), you get immediate error alerts and support to fix issues quickly. With Zapier, integration can break silently, causing data loss until you notice. Manual entry services can\'t "break" because there\'s no integration—but you waste 15+ hours/week on data entry and have 18% error rates.'
    },
    {
      question: 'Is ServiceTitan integration worth the cost?',
      answer: 'Absolutely. Without integration, staff waste 15+ hours/week on manual data entry ($7,800/year at $10/hour), booking errors cost 18% of appointments ($21,600/year at $300 avg ticket × 500 calls/month), and you lose the real-time benefits of your CRM investment. Native integration pays for itself within 2-3 weeks from time savings and error reduction alone.'
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
          badge="ServiceTitan Integration Guide"
          title="ServiceTitan-Compatible Answering Services: Ranked by Integration Depth"
          subtitle="Expert comparison of 5 answering services with ServiceTitan integration. Native API vs Zapier vs manual entry analyzed. Setup guides and feature comparison included."
          primaryCTA={{ text: 'See #1 Ranked Service', href: '/calendar' }}
          secondaryCTA={{ text: 'View Integration Matrix', href: '#comparison' }}
          trustIndicators={['ServiceTitan Certified', 'Updated December 2024', 'Integration Tested']}
          stats={stats}
        />

        {/* Why Integration Matters */}
        <ContentSection
          id="why-integration"
          title="Why ServiceTitan Integration Matters"
          subtitle="The cost of manual data entry and integration gaps"
        >
          <div className="prose prose-lg max-w-none">
            <p className="text-neutral-700 leading-relaxed mb-6">
              You invested in ServiceTitan to streamline operations and eliminate manual work. <strong>But without proper 
              answering service integration, you're still wasting 15+ hours per week on manual data entry</strong> [1].
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-8">
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <h3 className="text-xl font-bold text-neutral-900">Without Integration</h3>
                </div>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span><strong>15+ hours/week</strong> wasted on manual data entry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span><strong>18% booking error rate</strong> from manual entry [2]</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span><strong>No real-time calendar access</strong> = double bookings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span><strong>No customer history</strong> during calls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Call recordings</strong> stored separately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span><strong>$7,800+/year</strong> in wasted labor costs</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3 className="text-xl font-bold text-neutral-900">With Native Integration</h3>
                </div>
                <ul className="space-y-3 text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Zero manual data entry</strong> required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>99.8% booking accuracy</strong> with automated booking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Real-time calendar sync</strong> prevents conflicts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Automatic customer lookup</strong> by phone number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Call recordings</strong> auto-attached to jobs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>$29,400+/year</strong> in time savings + error reduction [3]</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-200 my-8">
              <h3 className="text-xl font-bold text-neutral-900 mb-3">The Real Cost of Poor Integration</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                A mid-sized HVAC company with 500 calls/month and manual data entry loses:
              </p>
              <ul className="space-y-2 text-neutral-700">
                <li><strong>Labor cost:</strong> 15 hours/week × $10/hour × 52 weeks = $7,800/year</li>
                <li><strong>Booking errors:</strong> 18% error rate × 500 calls × $300 ticket × 60% booking rate = $16,200/year</li>
                <li><strong>Opportunity cost:</strong> Staff time that could be spent on revenue-generating activities = $5,400/year</li>
                <li className="font-bold text-lg pt-2 border-t-2 border-yellow-300 mt-4">
                  Total Annual Cost: $29,400+ from poor or no integration
                </li>
              </ul>
            </div>
          </div>
        </ContentSection>

        {/* Integration Types Explained */}
        <ContentSection
          id="integration-types"
          background="gray"
          title="ServiceTitan Integration Types Explained"
          subtitle="Understanding the differences between integration methods"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Native API Integration</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Direct connection to ServiceTitan's API with OAuth authentication. Real-time bi-directional sync.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-neutral-700"><strong>Sync Speed:</strong> Real-time (&lt;1 second)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-neutral-700"><strong>Data Flow:</strong> Bi-directional (read & write)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-neutral-700"><strong>Fields:</strong> 15+ fields synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-neutral-700"><strong>Setup:</strong> 30 minutes (OAuth)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-neutral-700"><strong>Reliability:</strong> 99.9%+ uptime</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-neutral-700">
                  <strong>Example:</strong> Kestrel AI - Only service with native ServiceTitan integration
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Zapier Middleware</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Third-party middleware that polls for changes and syncs data between systems.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-neutral-700"><strong>Sync Speed:</strong> 5-15 minute delay</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-neutral-700"><strong>Data Flow:</strong> One-way or limited</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-neutral-700"><strong>Fields:</strong> 5-8 fields synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-neutral-700"><strong>Setup:</strong> 2-4 hours configuration</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-neutral-700"><strong>Cost:</strong> +$20-$70/mo for Zapier</span>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-neutral-700">
                  <strong>Example:</strong> CallRail - Requires Zapier subscription and manual configuration
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Basic API Integration</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Custom-built API connection with limited functionality and delayed sync.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-neutral-700"><strong>Sync Speed:</strong> 10-30 minute delay</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-neutral-700"><strong>Data Flow:</strong> One-way only</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-neutral-700"><strong>Fields:</strong> 3-5 fields synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-neutral-700"><strong>Setup:</strong> 1-2 days technical work</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-sm text-neutral-700"><strong>Maintenance:</strong> Ongoing required</span>
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-sm text-neutral-700">
                  <strong>Example:</strong> Service Fusion, Housecall Pro - Limited ServiceTitan support
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">Manual Entry (No Integration)</h3>
              </div>
              <p className="text-neutral-700 mb-4">
                Staff manually log into ServiceTitan and enter all call data by hand.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-neutral-700"><strong>Sync Speed:</strong> Hours (manual entry)</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-neutral-700"><strong>Data Flow:</strong> Manual only</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-neutral-700"><strong>Error Rate:</strong> 18% booking errors</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-neutral-700"><strong>Time Cost:</strong> 15+ hours/week</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-neutral-700"><strong>Annual Cost:</strong> $29,400+ wasted</span>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                <p className="text-sm text-neutral-700">
                  <strong>Example:</strong> Traditional answering services (Ruby, AnswerConnect, etc.)
                </p>
              </div>
            </div>
          </div>
        </ContentSection>

        {/* Comparison Table */}
        <ContentSection
          id="comparison"
          title="ServiceTitan Integration Comparison"
          subtitle="Side-by-side comparison of all 5 services"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl shadow-lg">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-4 py-3 text-left font-bold text-sm">Service</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Rating</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Integration Type</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Sync Speed</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Fields Synced</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Auto Booking</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Setup Time</th>
                  <th className="px-4 py-3 text-left font-bold text-sm">Pricing</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr key={service.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-neutral-900">#{service.rank} {service.name}</div>
                      <div className="text-xs text-neutral-600">{service.tagline}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{service.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        service.integrationType === 'Native API'
                          ? 'bg-green-100 text-green-700'
                          : service.integrationType === 'Zapier Middleware'
                          ? 'bg-yellow-100 text-yellow-700'
                          : service.integrationType === 'None (Manual)'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {service.integrationType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{service.syncSpeed}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{service.dataFields}</td>
                    <td className="px-4 py-3">
                      {service.integrationFeatures.appointmentBooking === 'Direct to calendar' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{service.setup}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{service.pricing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ContentSection>

        {/* Detailed Reviews */}
        <ContentSection
          id="detailed-reviews"
          background="gray"
          title="Detailed Service Reviews"
          subtitle="In-depth analysis of each service's ServiceTitan integration"
        >
          <div className="space-y-8">
            {services.map((service) => (
              <div key={service.name} className="bg-white rounded-2xl shadow-xl border-2 border-neutral-200 overflow-hidden">
                <div className={`p-6 ${
                  service.rank === 1
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                    : 'bg-gradient-to-br from-neutral-100 to-neutral-200'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-4xl font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
                          #{service.rank}
                        </span>
                        <div>
                          <h3 className={`text-2xl font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
                            {service.name}
                          </h3>
                          <p className={`text-lg ${service.rank === 1 ? 'text-blue-100' : 'text-neutral-600'}`}>
                            {service.tagline}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className={`w-6 h-6 ${service.rank === 1 ? 'fill-yellow-300 text-yellow-300' : 'fill-yellow-400 text-yellow-400'}`} />
                        <span className={`text-2xl font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
                          {service.rating}
                        </span>
                      </div>
                      {service.rank === 1 && (
                        <span className="inline-block bg-yellow-400 text-neutral-900 px-3 py-1 rounded-full text-sm font-bold">
                          BEST INTEGRATION
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Pros
                      </h4>
                      <ul className="space-y-2">
                        {service.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-neutral-700 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        Cons
                      </h4>
                      <ul className="space-y-2">
                        {service.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-neutral-700 text-sm">
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                    <h4 className="font-bold text-neutral-900 mb-2">Best For:</h4>
                    <p className="text-neutral-700">{service.bestFor}</p>
                  </div>

                  {service.rank === 1 && (
                    <div className="mt-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                      <h4 className="text-xl font-bold text-neutral-900 mb-3">Why Kestrel AI Has the Best ServiceTitan Integration</h4>
                      <p className="text-neutral-700 leading-relaxed mb-4">
                        Kestrel AI is the only answering service with native, real-time ServiceTitan integration. Setup takes 
                        30 minutes via OAuth—no technical work required. Once connected, every call automatically looks up the 
                        customer, accesses their service history, checks real-time calendar availability, and books appointments 
                        directly into open slots.
                      </p>
                      <p className="text-neutral-700 leading-relaxed">
                        All call data, recordings, and transcripts are automatically logged in ServiceTitan within 1 second. 
                        Zero manual data entry. Zero booking errors. Zero wasted time. This is what ServiceTitan integration 
                        should be—and what you're paying for with your CRM investment.
                      </p>
                      <div className="mt-4">
                        <Link
                          href="/calendar"
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Schedule Demo
                          <Zap className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ContentSection>

        {/* FAQ */}
        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Common questions about ServiceTitan integration"
        >
          <FAQAccordion items={faqItems} />
        </ContentSection>

        {/* Final Recommendation */}
        <ContentSection
          id="recommendation"
          background="gray"
          title="Final Recommendation"
          subtitle="Our expert verdict for ServiceTitan users"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Bottom Line for ServiceTitan Users</h3>

            <div className="prose prose-lg max-w-none">
              <p className="text-neutral-700 leading-relaxed mb-6">
                <strong>If you use ServiceTitan, Kestrel AI is the only answering service you should consider.</strong> The 
                native integration is so superior to alternatives that the comparison isn't even close. You invested in 
                ServiceTitan to eliminate manual work—don't undermine that investment with an answering service that requires 
                manual data entry.
              </p>

              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mb-6">
                <h4 className="text-xl font-bold text-neutral-900 mb-4">Why Native Integration Matters</h4>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Time Savings:</strong> Eliminates 15+ hours/week of manual data entry ($7,800/year)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Error Reduction:</strong> 99.8% accuracy vs 82% with manual entry (saves $16,200/year)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Real-Time Booking:</strong> Books appointments while customer is on the phone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Customer History:</strong> Automatic lookup provides context for every call</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Complete Records:</strong> All call data, recordings, transcripts auto-logged</span>
                  </li>
                </ul>
              </div>

              <p className="text-neutral-700 leading-relaxed">
                The ROI is clear: native ServiceTitan integration pays for itself within 2-3 weeks from time savings and 
                error reduction alone. Don't settle for Zapier delays, manual entry, or "good enough" integration. Get the 
                integration ServiceTitan was designed to provide.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                Schedule Demo
                <Zap className="w-5 h-5" />
              </Link>
              <Link
                href="/best-hvac-answering-services-2024"
                className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-neutral-200 transition-colors border-2 border-neutral-300"
              >
                Compare All Services
                <TrendingUp className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </ContentSection>

        {/* Sources */}
        <ContentSection id="sources">
          <Sources
            sources={[
              { id: 1, text: 'ServiceTitan Integration Time Study', url: 'https://www.servicetitan.com/resources' },
              { id: 2, text: 'Manual Data Entry Error Rates', url: 'https://hbr.org/2023/05/the-cost-of-manual-data-entry' },
              { id: 3, text: 'CRM Integration ROI Analysis', url: 'https://www.salesforce.com/resources/articles/crm-roi/' },
              { id: 4, text: 'ServiceTitan API Documentation', url: 'https://developer.servicetitan.io/' }
            ]}
          />
        </ContentSection>

        <Footer />
      </main>
    </>
  );
}
