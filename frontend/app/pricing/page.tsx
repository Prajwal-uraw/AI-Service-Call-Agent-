'use client';

import { useEffect } from 'react';
import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { CheckCircle, DollarSign, Zap, TrendingUp, ArrowRight, Calculator } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

// Note: Metadata export not possible in client components
// SEO handled via next/head in component

export default function Pricing() {
  const stats = [
    { value: '$42K', label: 'Annual savings vs. hiring staff', icon: <DollarSign className="w-5 h-5 text-green-500" /> },
    { value: '60 days', label: 'Average ROI timeline', icon: <TrendingUp className="w-5 h-5 text-blue-500" /> },
    { value: '$4,995', label: 'One-time setup fee', icon: <Zap className="w-5 h-5 text-purple-500" /> },
    { value: '0', label: 'Long-term contracts required', icon: <CheckCircle className="w-5 h-5 text-orange-500" /> }
  ];

  const faqItems = [
    {
      question: 'What happens if I exceed my plan\'s call limit?',
      answer: 'We never cut off service. If you exceed your plan\'s call limit, we charge $2.50 per additional call. We\'ll also notify you and recommend upgrading to a higher tier if it makes financial sense. Most companies stay within their plan limits.'
    },
    {
      question: 'Are there any long-term contracts?',
      answer: 'No. All plans are month-to-month with no long-term commitments. You can cancel anytime with 30 days notice. We believe in earning your business every month through great service, not locking you into contracts.'
    },
    {
      question: 'What\'s included in the $4,995 setup fee?',
      answer: 'White-glove onboarding includes: ServiceTitan/Jobber integration setup, importing your service areas and pricing, configuring emergency protocols and routing rules, training the AI on your business, testing with real call scenarios, and 30 days of hands-on support. This typically takes 40+ hours if done yourself; we do it in 48 hours.'
    },
    {
      question: 'Can I try it before committing?',
      answer: 'Yes. We offer a 14-day pilot program where we run Kestrel AI alongside your existing answering solution. You can compare call quality, booking rates, and customer satisfaction before making a decision. Most companies convert to full service after seeing the results.'
    },
    {
      question: 'Do you offer discounts for annual prepayment?',
      answer: 'Yes. Pay annually and save 10% ($2,156-$2,996 depending on plan). This brings your effective monthly cost down to $1,797-$2,247. Contact sales for annual pricing details.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), ACH bank transfers, and wire transfers. Payment is processed on the 1st of each month. We can also invoice for Enterprise customers.'
    },
    {
      question: 'Is there a money-back guarantee?',
      answer: 'Yes. We offer a 60-day ROI guarantee. If you don\'t see positive ROI within 60 days, we\'ll refund your first two months of service (setup fee is non-refundable as we\'ve already done the work). In practice, 98% of customers see ROI within the first 60 days.'
    },
    {
      question: 'What\'s not included in the monthly price?',
      answer: 'Everything you need is included: unlimited AI answering, ServiceTitan/Jobber integration, call recordings and transcripts, emergency routing, appointment booking, and 24/7 support. The only additional cost is if you exceed your plan\'s call limit ($2.50/call overage).'
    },
    {
      question: 'How does pricing compare to hiring a receptionist?',
      answer: 'A full-time receptionist costs $35,000-$50,000/year salary plus $7,000-$12,000 in benefits, totaling $42,000-$62,000/year for 40 hours/week coverage. Kestrel costs $17,964-$29,964/year for 24/7/365 coverage with zero benefits, sick days, or turnover. You save $20,000-$40,000 annually.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes, anytime. Upgrades take effect immediately. Downgrades take effect at the start of your next billing cycle. We\'ll help you choose the right plan based on your actual call volume and recommend adjustments as your business grows.'
    }
  ];

  useEffect(() => {
    // Add schema markup for pricing
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Kestrel AI HVAC Answering Service",
      "description": "AI-powered answering service for HVAC companies with 24/7 coverage, ServiceTitan integration, and emergency call handling",
      "brand": {
        "@type": "Brand",
        "name": "Kestrel AI"
      },
      "offers": [
        {
          "@type": "Offer",
          "name": "Starter Plan",
          "price": "1497",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://kestrelvoice.com/pricing"
        },
        {
          "@type": "Offer",
          "name": "Growth Plan",
          "price": "1997",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://kestrelvoice.com/pricing"
        },
        {
          "@type": "Offer",
          "name": "Enterprise Plan",
          "price": "2497",
          "priceCurrency": "USD",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock",
          "url": "https://kestrelvoice.com/pricing"
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="10" />
        </div>
        <PageHero
          badge="Transparent & Simple Pricing"
          title="Kestrel Pricing - No Hidden Fees, No Long-Term Contracts"
          subtitle="Choose the plan that fits your call volume. All plans include 24/7 coverage, ServiceTitan integration, and white-glove support."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'Calculate ROI', href: '#roi-calculator' }}
          trustIndicators={['60-day ROI guarantee', 'Month-to-month', 'No hidden fees']}
          stats={stats}
        />

        <ContentSection
          id="pricing-tiers"
          title="Choose Your Plan"
          subtitle="All plans include everything you need. No hidden fees."
        >
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 hover:border-blue-600 hover:shadow-xl transition-all">
              <div className="text-sm font-semibold text-blue-600 mb-2">STARTER</div>
              <div className="text-4xl font-bold text-neutral-900 mb-2">
                $1,497
                <span className="text-lg text-neutral-600 font-normal">/month</span>
              </div>
              <div className="text-neutral-600 mb-6">Up to 200 calls/month</div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">24/7 AI answering service</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">ServiceTitan/Jobber integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Emergency call routing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Appointment booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Call recordings & transcripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Email support</span>
                </li>
              </ul>

              <Link 
                href="/calendar" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>

              <div className="mt-4 text-xs text-neutral-500 text-center">
                Best for: 1-3 truck companies
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-8 shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              
              <div className="text-sm font-semibold mb-2 opacity-90">GROWTH</div>
              <div className="text-4xl font-bold mb-2">
                $1,997
                <span className="text-lg font-normal opacity-90">/month</span>
              </div>
              <div className="opacity-90 mb-6">Up to 500 calls/month</div>
              
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
                  <span className="text-sm">Priority support (2-hour response)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Quarterly business reviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">API access</span>
                </li>
              </ul>

              <Link 
                href="/calendar" 
                className="block w-full bg-white text-blue-600 hover:bg-neutral-100 text-center py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>

              <div className="mt-4 text-xs opacity-75 text-center">
                Best for: 4-10 truck companies
              </div>
            </div>

            <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 hover:border-blue-600 hover:shadow-xl transition-all">
              <div className="text-sm font-semibold text-purple-600 mb-2">ENTERPRISE</div>
              <div className="text-4xl font-bold text-neutral-900 mb-2">
                $2,497
                <span className="text-lg text-neutral-600 font-normal">/month</span>
              </div>
              <div className="text-neutral-600 mb-6">Unlimited calls</div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Everything in Growth, plus:</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Unlimited calls (no overages)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">White-label options</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-neutral-700">24/7 phone support</span>
                </li>
              </ul>

              <Link 
                href="/calendar" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Sales
              </Link>

              <div className="mt-4 text-xs text-neutral-500 text-center">
                Best for: 10+ truck companies
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl p-8 border border-neutral-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Setup Fee: $4,995 (One-Time)</h3>
            <p className="text-neutral-700 mb-6">
              Our white-glove onboarding includes ServiceTitan/Jobber integration, emergency protocol configuration, 
              AI training on your business, and 30 days of hands-on support. This typically takes 40+ hours if done 
              yourself; we do it in 48 hours.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900">ServiceTitan Integration</div>
                  <div className="text-sm text-neutral-600">Complete setup in 30 minutes</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900">Custom Configuration</div>
                  <div className="text-sm text-neutral-600">Emergency protocols, routing rules</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-neutral-900">Training & Testing</div>
                  <div className="text-sm text-neutral-600">Real call scenarios, refinement</div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="roi-calculator"
          background="gray"
          title="ROI Calculator"
          subtitle="See how much you'll save with Kestrel AI"
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 md:p-12 shadow-2xl border border-neutral-200">
              <div className="flex items-center gap-3 mb-8">
                <Calculator className="w-10 h-10 text-blue-600" />
                <h3 className="text-2xl font-bold text-neutral-900">Calculate Your Savings</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                  <h4 className="text-xl font-bold text-neutral-900 mb-4">Traditional Receptionist</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-2 border-b border-red-200">
                      <span className="text-neutral-600">Annual salary:</span>
                      <span className="font-semibold">$42,000</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-red-200">
                      <span className="text-neutral-600">Benefits (20%):</span>
                      <span className="font-semibold">$8,400</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-red-200">
                      <span className="text-neutral-600">Payroll taxes:</span>
                      <span className="font-semibold">$3,200</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-red-200">
                      <span className="text-neutral-600">Turnover cost (avg.):</span>
                      <span className="font-semibold">$3,000</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-red-200">
                      <span className="text-neutral-600">Lost revenue (missed calls):</span>
                      <span className="font-semibold text-red-600">$18,000</span>
                    </div>
                    <div className="flex justify-between pt-3">
                      <span className="font-semibold">Total Annual Cost:</span>
                      <span className="text-2xl font-bold text-red-600">$74,600</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-600">
                  <h4 className="text-xl font-bold text-neutral-900 mb-4">Kestrel AI (Growth Plan)</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-2 border-b border-green-200">
                      <span className="text-neutral-600">Monthly cost:</span>
                      <span className="font-semibold">$1,997</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-green-200">
                      <span className="text-neutral-600">Annual cost:</span>
                      <span className="font-semibold">$23,964</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-green-200">
                      <span className="text-neutral-600">Setup fee (one-time):</span>
                      <span className="font-semibold">$4,995</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-green-200">
                      <span className="text-neutral-600">Benefits/taxes:</span>
                      <span className="font-semibold text-green-600">$0</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-green-200">
                      <span className="text-neutral-600">Lost revenue:</span>
                      <span className="font-semibold text-green-600">$0</span>
                    </div>
                    <div className="flex justify-between pt-3">
                      <span className="font-semibold">Year 1 Total Cost:</span>
                      <span className="text-2xl font-bold text-green-600">$28,959</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 text-center">
                <div className="text-4xl font-bold mb-2">Save $45,641 in Year 1</div>
                <p className="text-lg opacity-90 mb-4">Plus recover $18,000 in previously missed revenue</p>
                <p className="text-sm opacity-75">ROI: 158% | Break-even: 7.6 months</p>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="compare"
          title="Compare to Alternatives"
          subtitle="How Kestrel pricing stacks up against other options"
        >
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Solution</th>
                  <th className="px-6 py-4 text-center font-semibold">Monthly Cost</th>
                  <th className="px-6 py-4 text-center font-semibold">Annual Cost</th>
                  <th className="px-6 py-4 text-center font-semibold">Availability</th>
                  <th className="px-6 py-4 text-center font-semibold">Setup Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Kestrel AI (Growth)</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">$1,997</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">$28,959*</td>
                  <td className="px-6 py-4 text-center text-neutral-700">24/7/365</td>
                  <td className="px-6 py-4 text-center text-neutral-700">48 hours</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Full-Time Receptionist</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$4,467</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$53,600</td>
                  <td className="px-6 py-4 text-center text-neutral-700">40 hrs/week</td>
                  <td className="px-6 py-4 text-center text-neutral-700">2-4 weeks</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">24/7 Call Center</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$5,000-8,000</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$60,000-96,000</td>
                  <td className="px-6 py-4 text-center text-neutral-700">24/7</td>
                  <td className="px-6 py-4 text-center text-neutral-700">4-8 weeks</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">Offshore Service</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$1,500-3,000</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$18,000-36,000</td>
                  <td className="px-6 py-4 text-center text-neutral-700">24/7</td>
                  <td className="px-6 py-4 text-center text-neutral-700">2-3 weeks</td>
                </tr>
                <tr className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-900">DIY AI (VAPI/Bland)</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$800-1,200</td>
                  <td className="px-6 py-4 text-center text-neutral-700">$20,000-35,000**</td>
                  <td className="px-6 py-4 text-center text-neutral-700">24/7</td>
                  <td className="px-6 py-4 text-center text-neutral-700">4-6 weeks</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-neutral-500">
            <p>* Includes $4,995 one-time setup fee in Year 1. Year 2+: $23,964/year</p>
            <p>** Includes development time and ongoing maintenance costs</p>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          background="gray"
          title="Pricing FAQs"
          subtitle="Common questions about Kestrel pricing"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join 200+ HVAC companies saving $40K+/year with Kestrel AI. 60-day ROI guarantee.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2">
                Schedule Demo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/case-studies" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                View Case Studies
              </Link>
            </div>
            <p className="text-sm opacity-75 mt-6">No long-term contracts • Cancel anytime • 14-day pilot available</p>
          </div>
        </ContentSection>
        <Sources sources={[
          { id: 1, citation: 'ROI calculation: Average HVAC company recovers cost within 60 days from captured missed calls' },
          { id: 2, citation: 'Cost comparison: $60K-90K/year for 24/7 human staff vs $18K-30K/year for Kestrel AI' },
          { id: 3, citation: 'Kestrel AI Customer Data (2024) - Average $47K annual revenue recovery from missed calls' }
        ]} />
      </main>
      <Footer />
    </>
  );
}
