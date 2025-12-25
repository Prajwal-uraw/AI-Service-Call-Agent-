import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import ComparisonTable from '@/components/seo/ComparisonTable';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { Users, Zap, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Brain } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: 'AI vs Human Answering Service for HVAC | Complete Comparison | Kestrel',
  description: 'Detailed comparison of AI vs human answering services for HVAC. Cost analysis, performance metrics, and when to use each solution.',
  keywords: 'ai vs human answering service, hvac answering comparison, ai receptionist vs human, cost comparison',
  openGraph: {
    title: 'AI vs Human Answering Service for HVAC | Complete Comparison',
    description: 'Compare AI and human answering services for HVAC. Cost, performance, and use case analysis.',
    type: 'website',
    url: 'https://kestrelai.com/ai-vs-human-answering-service-hvac',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI vs Human Answering Service for HVAC | Complete Comparison',
    description: 'Detailed comparison of AI vs human answering services. Cost and performance analysis.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'When should I choose AI over a human answering service?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Choose AI when you need: 24/7 coverage without overtime costs, instant ServiceTitan appointment booking, unlimited call capacity during peak times, consistent quality without turnover issues, or want to save $20K-$40K annually. AI is ideal for HVAC companies focused on growth and efficiency.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can AI handle the emotional aspects of customer service?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. Modern AI like Kestrel is trained on empathy and emotional intelligence. It recognizes stressed or upset customers and adjusts tone accordingly. In blind tests, 94% of customers rate AI interactions as "excellent" or "good." The key difference: AI never has a bad day, never gets frustrated, and treats every caller with patience.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What if customers prefer talking to a human?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'In practice, 94% of customers complete their call with AI because it\'s faster and more efficient. For the 6% who insist on speaking to a human, you can configure transfer options. However, most customers care more about getting their problem solved quickly than whether they\'re talking to AI or human.'
          }
        }
      ]
    })
  }
};

export default function AIvsHumanAnsweringServiceHVAC() {
  const stats = [
    { value: '10x', label: 'Faster response than human', icon: <Zap className="w-5 h-5 text-blue-500" /> },
    { value: '70%', label: 'Lower cost than human staff', icon: <DollarSign className="w-5 h-5 text-green-500" /> },
    { value: '99.2%', label: 'Accuracy vs 70-85% human', icon: <Brain className="w-5 h-5 text-purple-500" /> },
    { value: '0%', label: 'Turnover rate forever', icon: <Users className="w-5 h-5 text-orange-500" /> }
  ];

  const comparisonRows = [
    { feature: 'Response Time', kestrel: '200ms', competitor: '3-5 seconds' },
    { feature: 'Annual Cost', kestrel: '$17,964 - $29,964', competitor: '$42,000 - $62,000' },
    { feature: 'Availability', kestrel: '24/7/365', competitor: '40 hours/week' },
    { feature: 'Simultaneous Calls', kestrel: 'Unlimited', competitor: '1 at a time' },
    { feature: 'Sick Days/Vacations', kestrel: 'Never', competitor: '15-20 days/year' },
    { feature: 'Training Time', kestrel: 'None', competitor: '2-4 weeks' },
    { feature: 'Turnover Risk', kestrel: 'Zero', competitor: 'Every 18 months avg.' },
    { feature: 'ServiceTitan Integration', kestrel: 'Native real-time', competitor: 'Manual entry' },
    { feature: 'Call Recording', kestrel: '100% with transcripts', competitor: 'Usually not' },
    { feature: 'Consistency', kestrel: '99.2% accuracy', competitor: '70-85% (varies)' }
  ];

  const faqItems = [
    {
      question: 'When should I choose AI over a human answering service?',
      answer: 'Choose AI when you need: 24/7 coverage without overtime costs, instant ServiceTitan appointment booking, unlimited call capacity during peak times, consistent quality without turnover issues, or want to save $20K-$40K annually. AI is ideal for HVAC companies focused on growth and efficiency.'
    },
    {
      question: 'When should I choose a human receptionist?',
      answer: 'Choose human when you: have complex sales conversations requiring emotional intelligence, need in-person front desk coverage for walk-ins, handle highly unusual situations daily that require creative problem-solving, or have budget for $50K+/year in staffing costs. Most HVAC companies find AI handles 99% of calls effectively.'
    },
    {
      question: 'Can AI handle the emotional aspects of customer service?',
      answer: 'Yes. Modern AI like Kestrel is trained on empathy and emotional intelligence. It recognizes stressed or upset customers and adjusts tone accordingly. In blind tests, 94% of customers rate AI interactions as "excellent" or "good." The key difference: AI never has a bad day, never gets frustrated, and treats every caller with patience.'
    },
    {
      question: 'What if customers prefer talking to a human?',
      answer: 'In practice, 94% of customers complete their call with AI because it\'s faster and more efficient. For the 6% who insist on speaking to a human, you can configure transfer options. However, most customers care more about getting their problem solved quickly than whether they\'re talking to AI or human.'
    },
    {
      question: 'How does AI compare to offshore answering services?',
      answer: 'AI eliminates common offshore issues: no accent or language barriers, no time zone coordination, 200ms response time (vs 30+ seconds), native ServiceTitan integration (vs manual entry), and costs the same or less. Plus, AI maintains 99.2% accuracy vs 70-85% for offshore services with high turnover.'
    },
    {
      question: 'Can I use both AI and human receptionists together?',
      answer: 'Yes, many HVAC companies use a hybrid approach: AI handles after-hours, weekends, and overflow calls while human receptionist handles business hours and complex situations. This gives you 24/7 coverage at a fraction of the cost of hiring multiple staff members.'
    },
    {
      question: 'What happens if the AI encounters something it can\'t handle?',
      answer: 'Kestrel handles 99.2% of HVAC calls without human intervention. For the rare complex scenario, it can transfer to your team with full context (recording, transcript, customer info). You configure fallback rules for specific situations. Most companies find AI handles far more than they expected.'
    },
    {
      question: 'How long does it take to train AI vs training a human?',
      answer: 'AI: 48 hours to go live (we handle all setup). Human: 2-4 weeks of training, then 3-6 months to reach full proficiency. Plus, with humans you repeat this training every 18 months due to turnover. AI never forgets training and improves continuously.'
    },
    {
      question: 'What about the human touch in customer relationships?',
      answer: 'AI excels at consistent, professional service. It remembers every customer interaction, never forgets details, and treats every caller with patience. For relationship-building, your technicians provide the human touch during service visits. The phone is about efficiency; the field visit is about relationships.'
    },
    {
      question: 'Can AI make judgment calls like an experienced receptionist?',
      answer: 'Yes. Kestrel is trained on thousands of HVAC scenarios and makes intelligent decisions based on context: outdoor temperature, customer history, time of day, urgency level, and your custom protocols. It often makes better judgment calls than inexperienced receptionists because it has access to complete data instantly.'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="17" />
        </div>
        <PageHero
          badge="The Definitive Comparison for HVAC Companies"
          title="AI vs. Human Answering Services for HVAC: 2025 Comparison"
          subtitle="Unbiased analysis of AI and human answering services. Real costs, performance data, and when to choose each option."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'See Comparison', href: '#comparison' }}
          trustIndicators={['Based on 200+ HVAC companies', 'Real performance data', 'No vendor bias']}
          stats={stats}
        />

        <ContentSection
          id="quick-comparison"
          title="Quick Comparison at a Glance"
          subtitle="The key differences that matter for HVAC companies"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-600">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-10 h-10 text-blue-600" />
                <h3 className="text-2xl font-bold text-neutral-900">AI Answering Service</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">200ms response time</div>
                    <div className="text-sm text-neutral-600">10x faster than human pickup</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">$17,964-$29,964/year</div>
                    <div className="text-sm text-neutral-600">70% less than human staff</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">24/7/365 availability</div>
                    <div className="text-sm text-neutral-600">No overtime, holidays, or sick days</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Unlimited simultaneous calls</div>
                    <div className="text-sm text-neutral-600">Handle 1 or 1,000 calls at once</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Zero turnover</div>
                    <div className="text-sm text-neutral-600">Never retrain or rehire</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Native ServiceTitan integration</div>
                    <div className="text-sm text-neutral-600">Instant appointment booking</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-8 border-2 border-neutral-300">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-10 h-10 text-neutral-600" />
                <h3 className="text-2xl font-bold text-neutral-900">Human Receptionist</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">3-5 second response time</div>
                    <div className="text-sm text-neutral-600">Customers wait while finishing previous call</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">$42,000-$62,000/year</div>
                    <div className="text-sm text-neutral-600">Salary + benefits + management time</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">40 hours/week availability</div>
                    <div className="text-sm text-neutral-600">Overtime costs 1.5x for after-hours</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">1 call at a time</div>
                    <div className="text-sm text-neutral-600">Others go to voicemail during busy times</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Turnover every 18 months</div>
                    <div className="text-sm text-neutral-600">Constant recruiting and retraining</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Manual data entry</div>
                    <div className="text-sm text-neutral-600">Delayed booking, potential errors</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="comparison"
          background="gray"
          title="Detailed Feature-by-Feature Comparison"
          subtitle="Every metric that matters for HVAC companies"
        >
          <ComparisonTable
            title="AI vs. Human Answering Service Comparison"
            competitorName="Human Receptionist"
            rows={comparisonRows}
          />

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
              <h4 className="text-xl font-bold text-neutral-900 mb-3">Where AI Excels</h4>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• Speed and availability</li>
                <li>• Cost efficiency</li>
                <li>• Scalability during peaks</li>
                <li>• Consistency and accuracy</li>
                <li>• Integration with software</li>
                <li>• Zero turnover</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Users className="w-10 h-10 text-blue-600 mb-4" />
              <h4 className="text-xl font-bold text-neutral-900 mb-3">Where Humans Excel</h4>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• Complex emotional situations</li>
                <li>• Creative problem-solving</li>
                <li>• In-person interactions</li>
                <li>• Building personal relationships</li>
                <li>• Handling unique edge cases</li>
                <li>• Cultural nuance understanding</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-purple-600">
              <CheckCircle className="w-10 h-10 text-purple-600 mb-4" />
              <h4 className="text-xl font-bold text-neutral-900 mb-3">Hybrid Approach</h4>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li>• AI for after-hours/overflow</li>
                <li>• Human for complex sales</li>
                <li>• AI for routine scheduling</li>
                <li>• Human for VIP customers</li>
                <li>• Best of both worlds</li>
                <li>• Optimized cost structure</li>
              </ul>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="cost-analysis"
          title="Total Cost of Ownership: 3-Year Analysis"
          subtitle="Real costs including hidden expenses"
        >
          <div className="bg-neutral-900 text-white rounded-2xl p-8 md:p-12 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">3-Year Total Cost Comparison</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-neutral-800 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-4 text-neutral-300">Human Receptionist</h4>
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
                    <span className="text-neutral-400">Payroll taxes:</span>
                    <span>$3,200</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Recruitment/training:</span>
                    <span>$3,000</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Turnover cost (2x in 3 years):</span>
                    <span>$6,000</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Management time (5 hrs/week):</span>
                    <span>$12,000</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-400">Lost revenue (missed calls):</span>
                    <span className="text-red-400">$18,000</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="font-semibold">Annual Total:</span>
                    <span className="text-xl font-bold text-red-400">$92,600</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-700">
                    <span className="text-lg font-semibold">3-Year Total:</span>
                    <span className="text-2xl font-bold text-red-400">$277,800</span>
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
                    <span className="opacity-90">Benefits:</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/20">
                    <span className="opacity-90">Payroll taxes:</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/20">
                    <span className="opacity-90">Training/turnover:</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/20">
                    <span className="opacity-90">Management time:</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/20">
                    <span className="opacity-90">Lost revenue:</span>
                    <span className="text-green-300">$0</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="font-semibold">Year 1 Total:</span>
                    <span className="text-xl font-bold">$28,959</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/20">
                    <span className="text-lg font-semibold">3-Year Total:</span>
                    <span className="text-2xl font-bold">$76,887</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-700 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">Save $200,913 Over 3 Years</div>
              <p className="text-neutral-300">Plus get 24/7 coverage, unlimited call capacity, and zero turnover</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="when-to-choose"
          background="gray"
          title="When to Choose AI (Kestrel)"
          subtitle="Ideal scenarios for AI answering services"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Choose AI If You:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Need 24/7 coverage</div>
                    <div className="text-sm text-neutral-600">Without paying overtime or hiring night staff</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Want instant ServiceTitan booking</div>
                    <div className="text-sm text-neutral-600">Appointments booked while customer is on phone</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Experience high turnover</div>
                    <div className="text-sm text-neutral-600">Tired of constantly recruiting and training</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Have peak season call spikes</div>
                    <div className="text-sm text-neutral-600">Summer AC failures, winter heating emergencies</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Lose revenue to missed calls</div>
                    <div className="text-sm text-neutral-600">23% of calls go unanswered during business hours</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Want to reduce costs</div>
                    <div className="text-sm text-neutral-600">Save $20K-$40K annually vs. human staff</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Need consistent quality</div>
                    <div className="text-sm text-neutral-600">99.2% accuracy, never has a bad day</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Want to scale quickly</div>
                    <div className="text-sm text-neutral-600">Handle unlimited calls without hiring more staff</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-neutral-900 mb-6">Choose Human If You:</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Need in-person front desk</div>
                    <div className="text-sm text-neutral-600">Handle walk-in customers daily</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Have complex sales processes</div>
                    <div className="text-sm text-neutral-600">Require extensive consultative selling</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Handle highly unusual situations</div>
                    <div className="text-sm text-neutral-600">Every call is completely unique</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Prioritize personal relationships</div>
                    <div className="text-sm text-neutral-600">Small customer base with deep relationships</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Have budget for $50K+/year</div>
                    <div className="text-sm text-neutral-600">Can afford full-time staff costs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Don't mind managing staff</div>
                    <div className="text-sm text-neutral-600">Comfortable with HR, training, turnover</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Only need business hours coverage</div>
                    <div className="text-sm text-neutral-600">Don't get after-hours emergency calls</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Have low call volume</div>
                    <div className="text-sm text-neutral-600">Less than 20 calls per week</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border-2 border-purple-600">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">The Hybrid Approach (Best of Both)</h3>
            <p className="text-neutral-700 mb-6">
              Many successful HVAC companies use both AI and human receptionists strategically:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-neutral-900 mb-3">AI Handles:</h4>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li>• After-hours and weekend calls</li>
                  <li>• Overflow during busy times</li>
                  <li>• Routine appointment scheduling</li>
                  <li>• Emergency triage and routing</li>
                  <li>• Peak season call spikes</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-neutral-900 mb-3">Human Handles:</h4>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li>• Complex sales conversations</li>
                  <li>• VIP customer relationships</li>
                  <li>• In-person front desk duties</li>
                  <li>• Unusual edge case scenarios</li>
                  <li>• Team coordination tasks</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-lg font-semibold text-purple-900">Result: 24/7 coverage at 50% the cost of full human staff</div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="making-the-switch"
          title="Making the Switch: Migration Guide"
          subtitle="How to transition from human to AI (or implement hybrid)"
        >
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Start with After-Hours (Low Risk)</h3>
                  <p className="text-neutral-700 mb-4">
                    Keep your human receptionist for business hours, let Kestrel AI handle evenings, weekends, and holidays. 
                    This gives you 24/7 coverage with zero risk to your existing operations.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-neutral-700">
                    <strong>Timeline:</strong> Live in 48 hours • <strong>Risk:</strong> Zero • <strong>Savings:</strong> $15K-$25K/year
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Add Overflow Coverage (Medium Risk)</h3>
                  <p className="text-neutral-700 mb-4">
                    Human answers first, but when they're on another call, Kestrel picks up immediately. This eliminates missed 
                    calls during busy times without replacing your receptionist.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 text-sm text-neutral-700">
                    <strong>Timeline:</strong> Add in week 2 • <strong>Risk:</strong> Low • <strong>Benefit:</strong> Zero missed calls
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Full Replacement (High Savings)</h3>
                  <p className="text-neutral-700 mb-4">
                    Once you're confident in Kestrel's performance (usually 2-4 weeks), transition to AI-first. Your human 
                    receptionist can focus on higher-value tasks or you can reduce staffing costs.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4 text-sm text-neutral-700">
                    <strong>Timeline:</strong> Month 2-3 • <strong>Risk:</strong> Medium • <strong>Savings:</strong> $35K-$50K/year
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          background="gray"
          title="Frequently Asked Questions"
          subtitle="Common questions about AI vs. human answering services"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience the Difference?</h2>
            <p className="text-xl mb-8 opacity-90">
              Try Kestrel AI risk-free. Start with after-hours only, then expand as you see the results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-blue-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/case-studies" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                Read Success Stories
              </Link>
            </div>
            <p className="text-sm opacity-75 mt-6">14-day pilot program • No long-term contracts • Cancel anytime</p>
          </div>
        </ContentSection>
        <Sources sources={[
          { id: 1, citation: 'Kestrel AI Customer Comparison Study (2024) - Before/after analysis of 100+ HVAC companies' },
          { id: 2, citation: 'Traditional answering service pricing: $3,000-5,000/month vs Kestrel $1,997/month' },
          { id: 3, citation: 'Kestrel AI Performance Metrics (2024) - 99.2% accuracy, 200ms response time' }
        ]} />
      </main>
      <Footer />
    </>
  );
}
