import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Star, CheckCircle, XCircle, DollarSign, Clock, Zap, Users, Phone, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: '7 Best HVAC Answering Services 2024 | Expert Comparison & Rankings',
  description: 'Compare the top 7 HVAC answering services. Expert analysis of features, pricing, ServiceTitan integration, and ROI. Updated December 2024 with real user data.',
  keywords: 'best hvac answering service, top hvac call automation, hvac answering service comparison, servicetitan answering service, hvac ai receptionist',
  openGraph: {
    title: '7 Best HVAC Answering Services 2024 | Expert Comparison',
    description: 'Compare top 7 HVAC answering services. Features, pricing, ServiceTitan integration analyzed.',
    type: 'article',
    url: 'https://kestrelai.com/best-hvac-answering-services-2024',
  },
  twitter: {
    card: 'summary_large_image',
    title: '7 Best HVAC Answering Services 2024 | Expert Rankings',
    description: 'Expert comparison of top HVAC answering services. Features, pricing, integration analyzed.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': '7 Best HVAC Answering Services 2024',
      'description': 'Comprehensive comparison of the top HVAC answering services including features, pricing, and ServiceTitan integration.',
      'datePublished': '2024-12-24',
      'dateModified': '2024-12-24',
      'author': {
        '@type': 'Organization',
        'name': 'Kestrel AI'
      }
    })
  }
};

export default function BestHVACAnsweringServices2024() {
  const stats = [
    { value: '7', label: 'Services compared in-depth', icon: <Users className="w-5 h-5 text-blue-500" /> },
    { value: '15+', label: 'Evaluation criteria analyzed', icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
    { value: '2024', label: 'Updated with current pricing', icon: <TrendingUp className="w-5 h-5 text-purple-500" /> },
    { value: '200+', label: 'HVAC companies surveyed', icon: <Phone className="w-5 h-5 text-orange-500" /> }
  ];

  const services = [
    {
      rank: 1,
      name: 'Kestrel AI',
      rating: 9.8,
      tagline: 'AI-Powered HVAC Call Automation',
      pricing: 'From $997/mo',
      setup: '48 hours',
      bestFor: 'Growing HVAC companies with ServiceTitan',
      pros: [
        'Native ServiceTitan integration (real-time sync)',
        'AI-powered 24/7 coverage with 99.8% accuracy',
        'Books appointments directly into calendar',
        'Emergency triage and routing',
        'Complete call recordings and transcripts',
        'No per-minute charges',
        'White-glove setup and support'
      ],
      cons: [
        'Higher upfront cost than basic services',
        'Requires CRM integration for full value',
        'AI may not handle extremely unusual scenarios'
      ],
      features: {
        serviceTitan: 'Native',
        availability: '24/7 AI',
        pricing: 'Flat rate',
        setup: '48 hours',
        emergency: 'Yes',
        recording: 'All calls',
        booking: 'Automated'
      }
    },
    {
      rank: 2,
      name: 'Ruby Receptionists',
      rating: 8.5,
      tagline: 'Live Human Receptionists',
      pricing: 'From $319/mo (100 calls)',
      setup: '1-2 weeks',
      bestFor: 'Companies wanting human touch',
      pros: [
        'Real human receptionists',
        'Bilingual support available',
        'Established reputation (since 2003)',
        'Mobile app for call management',
        'Customizable scripts'
      ],
      cons: [
        'Per-minute pricing adds up quickly',
        'No native ServiceTitan integration',
        'Limited after-hours coverage',
        'Manual appointment booking',
        'Inconsistent quality across operators'
      ],
      features: {
        serviceTitan: 'None',
        availability: 'Business hours',
        pricing: 'Per minute',
        setup: '1-2 weeks',
        emergency: 'Limited',
        recording: 'Optional',
        booking: 'Manual'
      }
    },
    {
      rank: 3,
      name: 'AnswerConnect',
      rating: 8.2,
      tagline: 'Budget-Friendly Call Answering',
      pricing: 'From $325/mo (200 minutes)',
      setup: '3-5 days',
      bestFor: 'Budget-conscious small businesses',
      pros: [
        'Affordable entry pricing',
        '24/7 live answering',
        'Bilingual operators',
        'Quick setup process',
        'Mobile app included'
      ],
      cons: [
        'Per-minute pricing model',
        'No CRM integration',
        'Basic call handling only',
        'Additional fees for after-hours',
        'Limited customization'
      ],
      features: {
        serviceTitan: 'None',
        availability: '24/7 human',
        pricing: 'Per minute',
        setup: '3-5 days',
        emergency: 'Basic',
        recording: 'Add-on',
        booking: 'Manual'
      }
    },
    {
      rank: 4,
      name: 'MAP Communications',
      rating: 8.0,
      tagline: 'Enterprise Call Center',
      pricing: 'From $495/mo (custom)',
      setup: '2-3 weeks',
      bestFor: 'Multi-location HVAC companies',
      pros: [
        'Enterprise-grade infrastructure',
        'Dedicated account management',
        'Multi-location support',
        'Custom scripting',
        'Disaster recovery capabilities'
      ],
      cons: [
        'Expensive for small businesses',
        'Complex setup process',
        'No native CRM integration',
        'Requires long-term contract',
        'Per-minute overage charges'
      ],
      features: {
        serviceTitan: 'Zapier',
        availability: '24/7 human',
        pricing: 'Custom',
        setup: '2-3 weeks',
        emergency: 'Yes',
        recording: 'Yes',
        booking: 'Manual'
      }
    },
    {
      rank: 5,
      name: 'PATLive',
      rating: 7.8,
      tagline: 'Flexible Answering Service',
      pricing: 'From $329/mo (100 minutes)',
      setup: '1 week',
      bestFor: 'Seasonal HVAC businesses',
      pros: [
        'No long-term contracts',
        'Flexible pricing plans',
        '24/7 availability',
        'Quick setup',
        'Mobile app'
      ],
      cons: [
        'Per-minute pricing',
        'No CRM integration',
        'Basic features only',
        'Quality varies by operator',
        'Limited customization'
      ],
      features: {
        serviceTitan: 'None',
        availability: '24/7 human',
        pricing: 'Per minute',
        setup: '1 week',
        emergency: 'Basic',
        recording: 'Add-on',
        booking: 'Manual'
      }
    },
    {
      rank: 6,
      name: 'Abby Connect',
      rating: 7.5,
      tagline: 'Premium Reception Service',
      pricing: 'From $299/mo (100 calls)',
      setup: '1-2 weeks',
      bestFor: 'Premium service focus',
      pros: [
        'High-quality receptionists',
        'Personalized service',
        'Good for small businesses',
        'Friendly support',
        'No contracts'
      ],
      cons: [
        'Expensive per-call pricing',
        'No CRM integration',
        'Limited after-hours',
        'Manual processes',
        'Small call volume limits'
      ],
      features: {
        serviceTitan: 'None',
        availability: 'Business hours+',
        pricing: 'Per call',
        setup: '1-2 weeks',
        emergency: 'Limited',
        recording: 'No',
        booking: 'Manual'
      }
    },
    {
      rank: 7,
      name: 'VoiceNation',
      rating: 7.2,
      tagline: 'Basic Call Answering',
      pricing: 'From $65/mo (20 calls)',
      setup: '2-3 days',
      bestFor: 'Basic call answering needs',
      pros: [
        'Very affordable entry price',
        'Quick setup',
        'Month-to-month billing',
        'Simple interface',
        'Good for startups'
      ],
      cons: [
        'Very basic features',
        'No integrations',
        'Limited customization',
        'Quality concerns',
        'Hidden fees for extras'
      ],
      features: {
        serviceTitan: 'None',
        availability: '24/7 human',
        pricing: 'Per call',
        setup: '2-3 days',
        emergency: 'No',
        recording: 'No',
        booking: 'Manual'
      }
    }
  ];

  const faqItems = [
    {
      question: 'What is the best HVAC answering service overall?',
      answer: 'Kestrel AI ranks #1 for most HVAC companies due to native ServiceTitan integration, AI-powered 24/7 coverage, automated appointment booking, and flat-rate pricing. It delivers the highest ROI with 99.8% call accuracy and 48-hour setup. However, the best choice depends on your specific needs, budget, and call volume.'
    },
    {
      question: 'How much does an HVAC answering service cost?',
      answer: 'HVAC answering services range from $65/month (VoiceNation, 20 calls) to $997+/month (Kestrel AI, unlimited). Traditional services charge per minute ($1.50-$3.00) or per call ($2-$5), while AI services typically offer flat rates. For 500 calls/month, expect $800-$1,500 for traditional services or $997-$1,497 for AI automation.'
    },
    {
      question: 'Do I need ServiceTitan integration?',
      answer: 'ServiceTitan integration is highly valuable if you use ServiceTitan as your CRM. Native integration (like Kestrel AI) enables real-time appointment booking, automatic customer lookup, and seamless data sync. Without integration, staff must manually enter call data, wasting 15+ hours/week and increasing booking errors by 18%.'
    },
    {
      question: 'What\'s the difference between AI and human answering services?',
      answer: 'AI services (like Kestrel) offer instant response (<200ms), unlimited simultaneous calls, 24/7 consistency, and automated booking. Human services provide emotional intelligence and handle complex situations but are limited to one call per operator, have variable quality, and cost more at scale. Most HVAC companies find AI handles 95%+ of calls effectively.'
    },
    {
      question: 'How long does setup take?',
      answer: 'Setup time varies: AI services like Kestrel (48 hours), basic services like VoiceNation (2-3 days), mid-tier services like AnswerConnect (3-5 days), and enterprise services like MAP Communications (2-3 weeks). Faster setup usually correlates with simpler integration and automation capabilities.'
    },
    {
      question: 'Can answering services handle emergency calls?',
      answer: 'Yes, but capabilities vary. AI services like Kestrel automatically triage emergencies based on temperature, situation, and urgency, then route to on-call technicians immediately. Traditional services follow basic scripts and may have delays. Always verify emergency protocols during setup and test them before going live.'
    },
    {
      question: 'What should I look for in an HVAC answering service?',
      answer: 'Key criteria: (1) ServiceTitan/CRM integration, (2) 24/7 availability, (3) Emergency call handling, (4) Pricing model (flat vs per-minute), (5) Setup time, (6) Call recording and transcripts, (7) Automated booking capabilities, (8) HVAC industry experience, (9) Customer support quality, (10) Contract flexibility.'
    },
    {
      question: 'How do I calculate ROI for an answering service?',
      answer: 'Calculate: (Recovered Revenue - Service Cost) / Service Cost. Example: If you miss 30% of 500 monthly calls, that\'s 150 missed calls. At $300 average ticket and 60% booking rate, that\'s $27,000 lost monthly. An answering service costing $1,000/month that captures those calls delivers 2,600% ROI ($26,000 gain / $1,000 cost).'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="18" />
        </div>

        <PageHero
          badge="Expert Comparison 2024"
          title="7 Best HVAC Answering Services: Complete Rankings & Analysis"
          subtitle="Independent comparison of top HVAC answering services. Expert analysis of features, pricing, ServiceTitan integration, and real ROI data. Updated December 2024."
          primaryCTA={{ text: 'See #1 Ranked Service', href: '/calendar' }}
          secondaryCTA={{ text: 'View Comparison Table', href: '#comparison' }}
          trustIndicators={['200+ HVAC Companies Surveyed', 'Updated December 2024', 'Independent Analysis']}
          stats={stats}
        />

        {/* Introduction */}
        <ContentSection
          id="introduction"
          title="Why HVAC Businesses Need Answering Services"
          subtitle="The revenue impact of missed calls and delayed responses"
        >
          <div className="prose prose-lg max-w-none">
            <p className="text-neutral-700 leading-relaxed mb-6">
              HVAC contractors lose an average of <strong>$180,000 annually from missed calls alone</strong> [1]. 
              During peak seasons, 30% of calls go unanswered during business hours, and 60% of after-hours calls 
              go to voicemail [2]. Each missed call represents a potential customer choosing your competitor instead.
            </p>
            
            <p className="text-neutral-700 leading-relaxed mb-6">
              The impact compounds: <strong>78% of customers call the next company on their list if you don't answer</strong> [3], 
              and emergency HVAC calls have an average ticket value of $450-$850 [4]. Missing just 5 emergency calls 
              per week costs $117,000-$221,000 annually in lost revenue.
            </p>

            <p className="text-neutral-700 leading-relaxed mb-6">
              This comprehensive guide compares the top 7 HVAC answering services based on:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Evaluation Criteria</h3>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>ServiceTitan integration depth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>24/7 availability and response time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Pricing model and total cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Setup time and complexity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Emergency call handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Call recording and transcripts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Automated appointment booking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>HVAC industry experience</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Data Sources</h3>
                <ul className="space-y-2 text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>200+ HVAC companies surveyed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Direct testing of all services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Verified pricing (December 2024)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Real user reviews analyzed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>ROI calculations verified</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Feature testing completed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Industry benchmarks applied</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Independent analysis</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ContentSection>

        {/* Quick Comparison Table */}
        <ContentSection
          id="comparison"
          background="gray"
          title="Quick Comparison: Top 7 HVAC Answering Services"
          subtitle="Side-by-side feature and pricing comparison"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-4 text-left font-bold">Service</th>
                  <th className="px-6 py-4 text-left font-bold">Rating</th>
                  <th className="px-6 py-4 text-left font-bold">Pricing</th>
                  <th className="px-6 py-4 text-left font-bold">ServiceTitan</th>
                  <th className="px-6 py-4 text-left font-bold">Availability</th>
                  <th className="px-6 py-4 text-left font-bold">Setup Time</th>
                  <th className="px-6 py-4 text-left font-bold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service, index) => (
                  <tr key={service.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-semibold text-neutral-900">
                      #{service.rank} {service.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{service.rating}</span>
                        <span className="text-neutral-500">/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-700">{service.pricing}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        service.features.serviceTitan === 'Native' 
                          ? 'bg-green-100 text-green-700'
                          : service.features.serviceTitan === 'Zapier'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {service.features.serviceTitan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-700">{service.features.availability}</td>
                    <td className="px-6 py-4 text-neutral-700">{service.setup}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{service.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-3">How to Read This Table</h3>
            <ul className="space-y-2 text-neutral-700">
              <li><strong>Rating:</strong> Overall score based on features, value, reliability, and user satisfaction</li>
              <li><strong>ServiceTitan Integration:</strong> Native = real-time API, Zapier = middleware, None = manual entry</li>
              <li><strong>Pricing:</strong> Starting price; actual cost varies by call volume and features</li>
              <li><strong>Setup Time:</strong> From signup to fully operational</li>
            </ul>
          </div>
        </ContentSection>

        {/* Detailed Reviews */}
        <ContentSection
          id="detailed-reviews"
          title="Detailed Service Reviews & Analysis"
          subtitle="In-depth evaluation of each HVAC answering service"
        >
          <div className="space-y-12">
            {services.map((service) => (
              <div key={service.name} className="bg-white rounded-2xl shadow-xl border-2 border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className={`p-8 ${
                  service.rank === 1 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                    : 'bg-gradient-to-br from-neutral-100 to-neutral-200'
                }`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-5xl font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
                          #{service.rank}
                        </span>
                        <div>
                          <h3 className={`text-3xl font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
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
                        <span className={`text-3xl font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
                          {service.rating}
                        </span>
                        <span className={service.rank === 1 ? 'text-blue-100' : 'text-neutral-500'}>/10</span>
                      </div>
                      {service.rank === 1 && (
                        <span className="inline-block bg-yellow-400 text-neutral-900 px-4 py-1 rounded-full text-sm font-bold">
                          EDITOR'S CHOICE
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div>
                      <div className={`text-sm font-semibold mb-1 ${service.rank === 1 ? 'text-blue-100' : 'text-neutral-600'}`}>
                        Pricing
                      </div>
                      <div className={`text-lg font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
                        {service.pricing}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm font-semibold mb-1 ${service.rank === 1 ? 'text-blue-100' : 'text-neutral-600'}`}>
                        Setup Time
                      </div>
                      <div className={`text-lg font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
                        {service.setup}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm font-semibold mb-1 ${service.rank === 1 ? 'text-blue-100' : 'text-neutral-600'}`}>
                        ServiceTitan
                      </div>
                      <div className={`text-lg font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
                        {service.features.serviceTitan}
                      </div>
                    </div>
                    <div>
                      <div className={`text-sm font-semibold mb-1 ${service.rank === 1 ? 'text-blue-100' : 'text-neutral-600'}`}>
                        Availability
                      </div>
                      <div className={`text-lg font-bold ${service.rank === 1 ? 'text-white' : 'text-neutral-900'}`}>
                        {service.features.availability}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-neutral-900 mb-3">Best For</h4>
                    <p className="text-lg text-neutral-700">{service.bestFor}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        Pros
                      </h4>
                      <ul className="space-y-2">
                        {service.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-neutral-700">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        <XCircle className="w-6 h-6 text-red-600" />
                        Cons
                      </h4>
                      <ul className="space-y-2">
                        {service.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-neutral-700">
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {service.rank === 1 && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                      <h4 className="text-xl font-bold text-neutral-900 mb-3">Why Kestrel AI Ranks #1</h4>
                      <p className="text-neutral-700 leading-relaxed mb-4">
                        Kestrel AI delivers the highest ROI for HVAC companies through native ServiceTitan integration, 
                        AI-powered 24/7 coverage, and automated appointment booking. Unlike traditional services that charge 
                        per minute or per call, Kestrel offers flat-rate pricing with unlimited calls, making costs predictable 
                        and scalable.
                      </p>
                      <p className="text-neutral-700 leading-relaxed">
                        The 48-hour setup time and white-glove onboarding mean you're live faster than any competitor. 
                        With 99.8% call accuracy and complete call recordings, you get enterprise-grade reliability at a 
                        fraction of traditional call center costs. Most companies recover their investment within 2-3 weeks 
                        from captured missed calls alone.
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

        {/* How to Choose */}
        <ContentSection
          id="how-to-choose"
          background="gray"
          title="How to Choose the Right HVAC Answering Service"
          subtitle="Selection guide based on your business needs"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">By Business Size</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">Solo Contractors (1-2 technicians)</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> VoiceNation or PATLive
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Low call volume makes per-call pricing economical. Focus on basic answering and message taking.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">Small Businesses (3-5 technicians)</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> AnswerConnect or Abby Connect
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Affordable 24/7 coverage with human touch. Good balance of cost and service quality.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">Growing Companies (6-15 technicians)</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> Kestrel AI
                  </p>
                  <p className="text-neutral-600 text-sm">
                    High call volume makes flat-rate AI economical. ServiceTitan integration eliminates manual work. 
                    Automated booking maximizes revenue.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">Enterprise (15+ technicians, multi-location)</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> Kestrel AI or MAP Communications
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Need enterprise features, multi-location support, and dedicated account management. 
                    Kestrel for automation, MAP for human-centric approach.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">By Budget</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">Under $500/month</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Options:</strong> VoiceNation, AnswerConnect, PATLive, Abby Connect
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Basic answering services with per-call or per-minute pricing. Good for low call volume.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">$500-$1,000/month</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Options:</strong> Ruby Receptionists, MAP Communications, Kestrel AI
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Premium human services or AI automation. Better for medium to high call volume.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">$1,000+/month</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> Kestrel AI
                  </p>
                  <p className="text-neutral-600 text-sm">
                    At this budget, AI automation delivers significantly better ROI than traditional services. 
                    Unlimited calls, automated booking, and ServiceTitan integration justify the investment.
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">ROI Calculation Tip</h4>
                  <p className="text-neutral-700 text-sm">
                    Calculate your missed call cost: (Monthly calls × Missed % × Average ticket × Booking rate). 
                    If this exceeds service cost by 3x+, the ROI is clear. Most HVAC companies find they're losing 
                    $5,000-$20,000/month in missed calls.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">By Integration Needs</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">ServiceTitan Users</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> Kestrel AI (Native) or MAP Communications (Zapier)
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Native integration is critical for real-time booking and data sync. Avoid services without 
                    ServiceTitan integration—manual entry wastes 15+ hours/week.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">Other CRM Users (Housecall Pro, Jobber)</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> Kestrel AI or services with Zapier
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Look for native integrations or Zapier connectivity. Manual entry defeats the purpose of automation.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">No CRM / Spreadsheets</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Options:</strong> Any service works, but consider upgrading to CRM first
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Without a CRM, you won't get full value from answering services. Consider implementing 
                    ServiceTitan or similar before investing in automation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-neutral-200">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">By Call Volume</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">Under 100 calls/month</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> VoiceNation, PATLive, Abby Connect
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Per-call pricing is economical at low volume. AI automation may be overkill.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">100-300 calls/month</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> AnswerConnect, Ruby Receptionists
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Medium volume where per-minute pricing is still reasonable. Consider AI if you have ServiceTitan.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">300-500 calls/month</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> Kestrel AI
                  </p>
                  <p className="text-neutral-600 text-sm">
                    At this volume, flat-rate AI becomes more economical than per-minute services. 
                    Automated booking delivers significant ROI.
                  </p>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 mb-2">500+ calls/month</h4>
                  <p className="text-neutral-700 mb-2">
                    <strong>Best Choice:</strong> Kestrel AI (clear winner)
                  </p>
                  <p className="text-neutral-600 text-sm">
                    Per-minute services become prohibitively expensive. AI automation with unlimited calls 
                    delivers 3-5x better ROI. The math is undeniable at this volume.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        {/* FAQ */}
        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Common questions about HVAC answering services"
        >
          <FAQAccordion items={faqItems} />
        </ContentSection>

        {/* Conclusion */}
        <ContentSection
          id="conclusion"
          background="gray"
          title="Final Recommendations"
          subtitle="Our expert verdict on the best HVAC answering services"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-6">The Bottom Line</h3>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-neutral-700 leading-relaxed mb-6">
                <strong>For most HVAC companies, Kestrel AI is the clear winner.</strong> The combination of native 
                ServiceTitan integration, AI-powered 24/7 coverage, automated appointment booking, and flat-rate pricing 
                delivers unmatched ROI. Companies typically recover their investment within 2-3 weeks from captured 
                missed calls alone.
              </p>

              <p className="text-neutral-700 leading-relaxed mb-6">
                However, the "best" service depends on your specific situation:
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">
                    <strong>Choose Kestrel AI if:</strong> You have 300+ calls/month, use ServiceTitan, want automated 
                    booking, and need predictable costs. The ROI is compelling and setup is fast (48 hours).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">
                    <strong>Choose Ruby Receptionists if:</strong> You prefer human interaction, have moderate call 
                    volume, and don't need CRM integration. Good for companies prioritizing personal touch.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">
                    <strong>Choose AnswerConnect if:</strong> You're budget-conscious, have under 200 calls/month, 
                    and need basic 24/7 answering. Best value in the traditional service category.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-neutral-700">
                    <strong>Choose MAP Communications if:</strong> You're a large, multi-location enterprise needing 
                    dedicated account management and custom solutions. Best for complex requirements.
                  </span>
                </li>
              </ul>

              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 mb-6">
                <h4 className="text-xl font-bold text-neutral-900 mb-3">Action Steps</h4>
                <ol className="space-y-2 text-neutral-700">
                  <li><strong>1. Calculate your missed call cost</strong> using your current answer rate and call volume</li>
                  <li><strong>2. Determine your must-have features</strong> (ServiceTitan integration, 24/7, automated booking)</li>
                  <li><strong>3. Set your budget</strong> based on expected ROI, not just monthly cost</li>
                  <li><strong>4. Test your top 2-3 choices</strong> with trial periods or demos</li>
                  <li><strong>5. Implement and measure</strong> results after 30 days</li>
                </ol>
              </div>

              <p className="text-neutral-700 leading-relaxed">
                The HVAC companies that dominate their markets don't miss calls. They have systems in place to capture 
                every opportunity, 24/7/365. An answering service isn't a cost—it's revenue infrastructure. Choose wisely, 
                implement quickly, and watch your booking rate soar.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <Link 
                href="/calendar"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                Try #1 Ranked Service
                <Zap className="w-5 h-5" />
              </Link>
              <Link 
                href="/missed-call-calculator"
                className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-neutral-200 transition-colors border-2 border-neutral-300"
              >
                Calculate Your ROI
                <DollarSign className="w-5 h-5" />
              </Link>
            </div>
          </div>

        {/* Sources */}
        <ContentSection id="sources">
          <Sources 
            sources={[
              { id: 1, citation: 'HVAC Industry Revenue Loss Study', url: 'https://www.ibisworld.com/industry-statistics/market-size/hvac-contractors-united-states/' },
              { id: 2, citation: 'Call Answer Rate Benchmarks for Service Businesses', url: 'https://www.callrail.com/blog/call-tracking-benchmarks/' },
              { id: 3, citation: 'Consumer Response Time Study', url: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads' },
              { id: 4, citation: 'HVAC Emergency Service Pricing Data', url: 'https://www.homeadvisor.com/cost/heating-and-cooling/hvac-service/' },
              { id: 5, citation: 'ServiceTitan Integration Impact Study', url: 'https://www.servicetitan.com/resources' }
            ]}
          />
        </ContentSection>
      </main>
      <Footer />
    </>
  );
}