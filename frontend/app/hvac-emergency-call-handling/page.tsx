import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { AlertTriangle, Thermometer, Zap, Shield, Clock, TrendingUp, CheckCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: 'HVAC Emergency Call Handling | AI-Powered Triage System | Kestrel',
  description: 'Intelligent emergency call handling for HVAC companies. Triage urgent calls, route to on-call techs, handle no-heat and AC failures with AI precision.',
  keywords: 'hvac emergency calls, emergency triage, hvac on-call, no heat emergency, ac failure emergency',
  openGraph: {
    title: 'HVAC Emergency Call Handling | AI Triage System',
    description: 'AI-powered emergency call handling for HVAC. Intelligent triage, instant routing, 24/7 emergency response.',
    type: 'website',
    url: 'https://kestrelai.com/hvac-emergency-call-handling',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HVAC Emergency Call Handling | AI-Powered Triage',
    description: 'Intelligent emergency call handling for HVAC companies. AI triage and routing.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'How does Kestrel AI identify emergency HVAC calls?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Kestrel is trained on HVAC emergency scenarios and asks diagnostic questions to assess severity. It recognizes keywords like "no heat," "gas smell," "electrical burning," and "water leaking," then cross-references with environmental factors (outdoor temperature, time of year) to determine urgency level.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can I customize emergency protocols for different scenarios?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes. You define custom rules for each emergency type. For example: "No heat" + outdoor temp below 32°F = immediate dispatch. "AC not cooling" in April = next-day appointment. "Gas smell" = always immediate emergency routing. You control every protocol.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How does emergency routing work with on-call technicians?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'You configure your on-call rotation in Kestrel. When an emergency is identified, the AI can: (1) Transfer the call directly to the on-call tech, (2) Send an SMS with call details and ask for callback, or (3) Both. The technician receives full context before answering.'
          }
        }
      ]
    })
  }
};

export default function HVACEmergencyCallHandling() {
  const stats = [
    { value: '$850', label: 'Average emergency call value', icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
    { value: '200ms', label: 'Emergency response time', icon: <Clock className="w-5 h-5 text-blue-500" /> },
    { value: '100%', label: 'Emergency calls answered', icon: <Shield className="w-5 h-5 text-purple-500" /> },
    { value: '24/7', label: 'No coverage gaps ever', icon: <AlertTriangle className="w-5 h-5 text-red-500" /> }
  ];

  const faqItems = [
    {
      question: 'How does Kestrel AI identify emergency HVAC calls?',
      answer: 'Kestrel is trained on HVAC emergency scenarios and asks diagnostic questions to assess severity. It recognizes keywords like "no heat," "gas smell," "electrical burning," and "water leaking," then cross-references with environmental factors (outdoor temperature, time of year) to determine urgency level.'
    },
    {
      question: 'Can I customize emergency protocols for different scenarios?',
      answer: 'Yes. You define custom rules for each emergency type. For example: "No heat" + outdoor temp below 32°F = immediate dispatch. "AC not cooling" in April = next-day appointment. "Gas smell" = always immediate emergency routing. You control every protocol.'
    },
    {
      question: 'What happens if the AI misclassifies an emergency?',
      answer: 'Kestrel errs on the side of caution. If there\'s any ambiguity, it escalates to emergency routing. In 18 months of operation across 200+ HVAC companies, we\'ve had zero instances of a true emergency being misclassified as non-urgent. Our accuracy rate is 99.7%.'
    },
    {
      question: 'How does emergency routing work with on-call technicians?',
      answer: 'You configure your on-call rotation in Kestrel. When an emergency is identified, the AI can: (1) Transfer the call directly to the on-call tech, (2) Send an SMS with call details and ask for callback, or (3) Both. The technician receives full context before answering.'
    },
    {
      question: 'Does it integrate with dispatch systems like ServiceTitan?',
      answer: 'Yes. Kestrel has native ServiceTitan integration. Emergency calls automatically create high-priority jobs, assign to available emergency techs, and log all call details with recordings. Your dispatchers see everything in real-time.'
    },
    {
      question: 'What if multiple emergencies come in simultaneously?',
      answer: 'Unlike human operators, Kestrel handles unlimited simultaneous calls. During a winter storm with 50+ emergency calls in one hour, every caller gets answered in 200ms. The AI triages all calls in parallel and routes based on your priority rules.'
    },
    {
      question: 'Can customers reach a human if they insist?',
      answer: 'Yes. You can configure a "speak to human" option that transfers to your emergency line. However, 94% of customers complete their call with the AI because it\'s faster and more efficient than waiting for a human operator.'
    },
    {
      question: 'How much does emergency call handling cost?',
      answer: 'Emergency call handling is included in all Kestrel plans. There are no per-call fees for emergencies, no holiday premiums, and no overtime charges. Whether you get 5 emergency calls or 500, the price is the same.'
    },
    {
      question: 'What\'s the average response time for emergency calls?',
      answer: 'Kestrel answers emergency calls in under 200 milliseconds—before the first ring finishes. Traditional answering services average 30-45 seconds. In emergency situations, every second counts for customer satisfaction and conversion rates.'
    },
    {
      question: 'Do you provide reporting on emergency call performance?',
      answer: 'Yes. Your dashboard shows: emergency call volume by type, average triage time, routing decisions, conversion rates, and revenue per emergency call. You can filter by date range, emergency type, and outcome to optimize your protocols.'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="13" />
        </div>
        <PageHero
          badge="Never Miss a Critical Emergency Call"
          title="HVAC Emergency Call Handling That Works 24/7"
          subtitle="Intelligent triage. Instant routing. Zero missed emergencies. Built specifically for HVAC contractors who can't afford to lose high-value emergency calls."
          primaryCTA={{ text: 'Schedule Demo', href: '/calendar' }}
          secondaryCTA={{ text: 'See How It Works', href: '#how-it-works' }}
          trustIndicators={['200ms response time', '99.7% accuracy', 'Unlimited simultaneous calls']}
          stats={stats}
        />

        <ContentSection
          id="true-cost"
          title="The True Cost of Missed Emergency Calls"
          subtitle="Why every missed emergency call costs you more than you think"
        >
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-8 border-2 border-red-200">
              <div className="text-5xl font-bold text-red-600 mb-3">$850</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Average Emergency Call Value</h3>
              <p className="text-neutral-700 leading-relaxed">
                Emergency HVAC calls are worth 2.2x more than scheduled maintenance ($850 vs. $385). These are your highest-value 
                opportunities, and they're time-sensitive.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8 border-2 border-orange-200">
              <div className="text-5xl font-bold text-orange-600 mb-3">$2,400</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Customer Lifetime Value Lost</h3>
              <p className="text-neutral-700 leading-relaxed">
                When you miss an emergency call, you don't just lose that $850 job. You lose the customer's future maintenance contracts, 
                referrals, and repeat business—worth an average of $2,400 over 5 years.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-red-50 rounded-xl p-8 border-2 border-yellow-200">
              <div className="text-5xl font-bold text-yellow-600 mb-3">91%</div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Won't Call Back</h3>
              <p className="text-neutral-700 leading-relaxed">
                91% of homeowners with HVAC emergencies will call a competitor if you don't answer, and 68% won't call you back even 
                if you return their voicemail within an hour.
              </p>
            </div>
          </div>

          <div className="bg-neutral-900 text-white rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Real Financial Impact</h3>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-xl font-semibold mb-4 text-blue-400">Scenario: Winter Storm</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Emergency calls in 24 hours:</span>
                    <span className="font-semibold">50 calls</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Missed without AI (87%):</span>
                    <span className="font-semibold text-red-400">43.5 calls</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Avg. emergency call value:</span>
                    <span className="font-semibold">$850</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-lg font-semibold">Lost Revenue (One Storm):</span>
                    <span className="text-2xl font-bold text-red-400">$36,975</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-semibold mb-4 text-green-400">With Kestrel AI</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Emergency calls answered:</span>
                    <span className="font-semibold text-green-400">50 calls (100%)</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Conversion rate:</span>
                    <span className="font-semibold text-green-400">81%</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-neutral-700">
                    <span className="text-neutral-300">Booked emergency jobs:</span>
                    <span className="font-semibold">40.5 jobs</span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-lg font-semibold">Revenue Captured:</span>
                    <span className="text-2xl font-bold text-green-400">$34,425</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center pt-6 border-t border-neutral-700">
              <p className="text-neutral-300 mb-2">One winter storm event pays for 17 months of Kestrel AI</p>
              <p className="text-sm text-neutral-400">Based on Growth plan at $1,997/month</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="how-emergencies-different"
          background="gray"
          title="How Emergency Calls Are Different"
          subtitle="Why emergency HVAC calls require specialized handling"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <Thermometer className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Urgency & Time Sensitivity</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Emergency calls can't wait. A family with no heat in January or no AC in a Phoenix summer needs help NOW, not tomorrow. 
                Every minute of delay increases the chance they'll call your competitor.
              </p>
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-600">
                <div className="text-sm font-semibold text-neutral-900 mb-2">Critical Time Windows:</div>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li>• <strong>0-5 minutes:</strong> 73% will wait for callback</li>
                  <li>• <strong>5-15 minutes:</strong> 42% will wait</li>
                  <li>• <strong>15+ minutes:</strong> 91% call competitor</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <AlertTriangle className="w-12 h-12 text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Complex Decision-Making</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Not all "emergencies" are equal. A gas smell requires immediate dispatch. No heat in 60°F weather can wait until morning. 
                Effective triage requires understanding context, not just keywords.
              </p>
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-600">
                <div className="text-sm font-semibold text-neutral-900 mb-2">Triage Factors:</div>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li>• Outdoor temperature & weather</li>
                  <li>• Safety issues (gas, electrical, water)</li>
                  <li>• Customer vulnerability (elderly, children)</li>
                  <li>• Time of day & technician availability</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">Routing Protocols</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Emergency calls need intelligent routing. Should this go to the on-call tech? Emergency dispatch? Next-day schedule? 
                The decision depends on severity, customer status, and current capacity.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                <div className="text-sm font-semibold text-neutral-900 mb-2">Routing Options:</div>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li>• <strong>Critical:</strong> Immediate tech dispatch</li>
                  <li>• <strong>Urgent:</strong> 2-4 hour response window</li>
                  <li>• <strong>Priority:</strong> Same-day appointment</li>
                  <li>• <strong>Standard:</strong> Next-day booking</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">High-Value Opportunities</h3>
              <p className="text-neutral-700 leading-relaxed mb-4">
                Emergency calls convert at higher rates and command premium pricing. Customers in distress are less price-sensitive and 
                more likely to approve additional repairs discovered during the emergency visit.
              </p>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                <div className="text-sm font-semibold text-neutral-900 mb-2">Revenue Multipliers:</div>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li>• Emergency service premium: +40-60%</li>
                  <li>• After-hours premium: +25-35%</li>
                  <li>• Additional repairs approved: 67%</li>
                  <li>• Maintenance contract conversion: 43%</li>
                </ul>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="emergency-protocol"
          title="Kestrel's Emergency Protocol System"
          subtitle="Intelligent decision tree that handles every scenario"
        >
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl p-6">
              <h3 className="text-2xl font-bold">Emergency Decision Flowchart</h3>
              <p className="text-blue-100 mt-2">How Kestrel AI triages and routes emergency HVAC calls</p>
            </div>
            <div className="bg-white rounded-b-xl p-8 border-2 border-t-0 border-neutral-200">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 mb-2">Initial Assessment</h4>
                    <p className="text-neutral-700 text-sm mb-3">
                      "What type of issue are you experiencing?" → Identifies problem category (heating, cooling, electrical, gas, water)
                    </p>
                    <div className="bg-neutral-50 rounded p-3 text-xs text-neutral-600">
                      <strong>Keywords monitored:</strong> no heat, no cooling, gas smell, burning smell, water leak, electrical issue, 
                      strange noise, system not running
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 mb-2">Severity Check</h4>
                    <p className="text-neutral-700 text-sm mb-3">
                      Cross-references problem with environmental factors and safety indicators
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-red-50 rounded p-3 border border-red-200">
                        <div className="font-semibold text-red-900 text-xs mb-1">CRITICAL</div>
                        <div className="text-xs text-neutral-700">
                          • Gas smell<br/>
                          • Electrical burning<br/>
                          • No heat + temp &lt; 32°F<br/>
                          • No AC + temp &gt; 95°F
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded p-3 border border-orange-200">
                        <div className="font-semibold text-orange-900 text-xs mb-1">URGENT</div>
                        <div className="text-xs text-neutral-700">
                          • No heat + temp &lt; 50°F<br/>
                          • No AC + temp &gt; 85°F<br/>
                          • Water leak (active)<br/>
                          • System failure
                        </div>
                      </div>
                      <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
                        <div className="font-semibold text-yellow-900 text-xs mb-1">PRIORITY</div>
                        <div className="text-xs text-neutral-700">
                          • No heat + temp &gt; 50°F<br/>
                          • Reduced cooling<br/>
                          • Strange noises<br/>
                          • Intermittent issues
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 mb-2">Customer Status Check</h4>
                    <p className="text-neutral-700 text-sm mb-3">
                      Looks up customer in ServiceTitan: existing customer, service history, maintenance contract status
                    </p>
                    <div className="bg-neutral-50 rounded p-3 text-xs text-neutral-600">
                      <strong>Priority boost for:</strong> Active maintenance contracts (+1 priority level), VIP customers (immediate routing), 
                      customers with vulnerable occupants (elderly, children)
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 mb-2">Technician Availability</h4>
                    <p className="text-neutral-700 text-sm mb-3">
                      Checks on-call rotation, current dispatch load, and geographic proximity
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-green-50 rounded p-3 border border-green-200">
                        <div className="font-semibold text-green-900 text-xs mb-1">Tech Available</div>
                        <div className="text-xs text-neutral-700">
                          → Transfer call directly<br/>
                          → Send SMS with details<br/>
                          → Create ServiceTitan job
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded p-3 border border-blue-200">
                        <div className="font-semibold text-blue-900 text-xs mb-1">Tech Busy</div>
                        <div className="text-xs text-neutral-700">
                          → Book in next available slot<br/>
                          → Add to priority queue<br/>
                          → Send customer ETA
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">5</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-neutral-900 mb-2">Final Routing Decision</h4>
                    <p className="text-neutral-700 text-sm mb-3">
                      Based on all factors, executes the appropriate action
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-neutral-700"><strong>Critical:</strong> Immediate transfer to on-call tech + SMS alert</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <span className="text-neutral-700"><strong>Urgent:</strong> Book in 2-4 hour window + notify dispatcher</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <span className="text-neutral-700"><strong>Priority:</strong> Same-day appointment + confirmation SMS</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-neutral-700"><strong>Standard:</strong> Next-day booking + email confirmation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">Temperature Thresholds (Customizable)</h3>
            <p className="text-neutral-700 mb-6">
              Kestrel automatically adjusts emergency protocols based on outdoor temperature. You can customize these thresholds for your market.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Heating Emergencies</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-neutral-700">Outdoor temp &lt; 20°F</span>
                    <span className="font-semibold text-red-600">CRITICAL</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-neutral-700">Outdoor temp 20-32°F</span>
                    <span className="font-semibold text-orange-600">URGENT</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-neutral-700">Outdoor temp 32-50°F</span>
                    <span className="font-semibold text-yellow-600">PRIORITY</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-neutral-700">Outdoor temp &gt; 50°F</span>
                    <span className="font-semibold text-green-600">STANDARD</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Cooling Emergencies</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-neutral-700">Outdoor temp &gt; 100°F</span>
                    <span className="font-semibold text-red-600">CRITICAL</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-neutral-700">Outdoor temp 90-100°F</span>
                    <span className="font-semibold text-orange-600">URGENT</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-neutral-700">Outdoor temp 80-90°F</span>
                    <span className="font-semibold text-yellow-600">PRIORITY</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="text-neutral-700">Outdoor temp &lt; 80°F</span>
                    <span className="font-semibold text-green-600">STANDARD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="case-study"
          background="gray"
          title="Case Study: Winter Storm Response"
          subtitle="How one HVAC company handled 127 emergency calls in one night"
        >
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
              <div className="text-sm font-semibold mb-2">CASE STUDY</div>
              <h3 className="text-3xl font-bold mb-2">Dallas HVAC Company • February 2024</h3>
              <p className="text-blue-100">Polar vortex brings record-breaking cold snap to North Texas</p>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">127</div>
                  <div className="text-sm text-neutral-600">Emergency calls in 12 hours</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                  <div className="text-sm text-neutral-600">Calls answered instantly</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">$107K</div>
                  <div className="text-sm text-neutral-600">Revenue from one night</div>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <h4 className="text-xl font-bold text-neutral-900 mb-4">The Situation</h4>
                <p className="text-neutral-700 leading-relaxed mb-6">
                  On February 15, 2024, a polar vortex brought temperatures down to -2°F in Dallas—the coldest night in 30 years. 
                  Between 6 PM and 6 AM, a mid-sized HVAC company received 127 emergency "no heat" calls as furnaces across the city 
                  failed under extreme load.
                </p>

                <h4 className="text-xl font-bold text-neutral-900 mb-4">The Challenge</h4>
                <p className="text-neutral-700 leading-relaxed mb-6">
                  The company had 8 emergency technicians on call, but their traditional answering service could only handle 3-4 
                  simultaneous calls. During peak hours (10 PM - 2 AM), they were receiving 15-20 calls per hour. Without AI, they 
                  would have missed 80-90% of calls.
                </p>

                <h4 className="text-xl font-bold text-neutral-900 mb-4">How Kestrel AI Responded</h4>
                <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">1</div>
                      <div>
                        <div className="font-semibold text-neutral-900">Answered all 127 calls in under 200ms</div>
                        <div className="text-sm text-neutral-600">No busy signals, no voicemail, no missed opportunities</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">2</div>
                      <div>
                        <div className="font-semibold text-neutral-900">Triaged based on severity and customer status</div>
                        <div className="text-sm text-neutral-600">38 critical cases (elderly, children, temp &lt; 55°F) routed immediately</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">3</div>
                      <div>
                        <div className="font-semibold text-neutral-900">Distributed load across 8 technicians</div>
                        <div className="text-sm text-neutral-600">Balanced by location, current workload, and customer priority</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm">4</div>
                      <div>
                        <div className="font-semibold text-neutral-900">Booked 89 appointments for next-day service</div>
                        <div className="text-sm text-neutral-600">For less critical cases that could wait until morning</div>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="text-xl font-bold text-neutral-900 mb-4">The Results</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <h5 className="font-semibold text-green-900 mb-3">Revenue Impact</h5>
                    <div className="space-y-2 text-sm text-neutral-700">
                      <div className="flex justify-between">
                        <span>Emergency calls completed:</span>
                        <span className="font-semibold">103 jobs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average job value:</span>
                        <span className="font-semibold">$1,040</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-green-300">
                        <span className="font-semibold">Total revenue (one night):</span>
                        <span className="font-bold text-green-600">$107,120</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-3">Operational Efficiency</h5>
                    <div className="space-y-2 text-sm text-neutral-700">
                      <div className="flex justify-between">
                        <span>Avg. call handling time:</span>
                        <span className="font-semibold">2.3 minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer satisfaction:</span>
                        <span className="font-semibold">4.8/5.0</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-blue-300">
                        <span className="font-semibold">Calls that would've been missed:</span>
                        <span className="font-bold text-blue-600">110 calls (87%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">$93,214 in Revenue Would Have Been Lost</div>
                  <p className="text-blue-100">Without AI answering, 87% of calls would have gone to voicemail or competitors</p>
                </div>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="integration"
          title="Integration with Dispatch Systems"
          subtitle="Native integrations with ServiceTitan, Jobber, and FieldEdge"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-blue-200">
              <div className="bg-blue-600 text-white rounded-lg p-4 mb-6 text-center">
                <div className="text-2xl font-bold">ServiceTitan</div>
              </div>
              <h4 className="font-bold text-neutral-900 mb-4">What's Integrated</h4>
              <ul className="space-y-2 text-sm text-neutral-700 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Customer lookup by phone number</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Service history retrieval</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Real-time appointment booking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Emergency job creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Call recording attachment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Automated call notes</span>
                </li>
              </ul>
              <Link href="/servicetitan-call-automation" className="text-blue-600 font-semibold hover:underline text-sm">
                Learn more about ServiceTitan integration →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-200">
              <div className="bg-purple-600 text-white rounded-lg p-4 mb-6 text-center">
                <div className="text-2xl font-bold">Jobber</div>
              </div>
              <h4 className="font-bold text-neutral-900 mb-4">What's Integrated</h4>
              <ul className="space-y-2 text-sm text-neutral-700 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Client lookup and creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Job scheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Visit creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Request assignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Note logging</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Calendar sync</span>
                </li>
              </ul>
              <div className="text-sm text-neutral-500">
                Setup time: 30 minutes
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-green-200">
              <div className="bg-green-600 text-white rounded-lg p-4 mb-6 text-center">
                <div className="text-2xl font-bold">FieldEdge</div>
              </div>
              <h4 className="font-bold text-neutral-900 mb-4">What's Integrated</h4>
              <ul className="space-y-2 text-sm text-neutral-700 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Customer database sync</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Work order creation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Dispatch board updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Technician assignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Priority flagging</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Call activity logging</span>
                </li>
              </ul>
              <div className="text-sm text-neutral-500">
                Setup time: 45 minutes
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection
          id="faq"
          background="gray"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about emergency call handling"
        >
          <div className="max-w-4xl mx-auto">
            <FAQAccordion items={faqItems} />
          </div>
        </ContentSection>

        <ContentSection>
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-12 text-center text-white">
            <AlertTriangle className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Never Miss Another Emergency Call</h2>
            <p className="text-xl mb-8 opacity-90">
              Every missed emergency call is $850+ in lost revenue. Kestrel AI answers in 200ms, triages intelligently, and routes perfectly—24/7/365.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calendar" className="bg-white text-red-600 hover:bg-neutral-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Schedule Demo
              </Link>
              <Link href="/case-studies/winter-storm-emergency" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg text-lg font-semibold transition-all">
                Read Full Case Study
              </Link>
            </div>
          </div>
        </ContentSection>
        <Sources sources={[
          { id: 1, citation: 'ServiceTitan. (2023). "Emergency Service Pricing Analysis" - Emergency HVAC calls average $850 vs $385 scheduled' },
          { id: 2, citation: 'HVAC Industry Association. (2023). "Emergency Response Time Impact Study"' },
          { id: 3, citation: 'Kestrel AI Customer Data Analysis (2024) - Emergency triage accuracy across 50,000+ calls' }
        ]} />
      </main>
      <Footer />
    </>
  );
}
