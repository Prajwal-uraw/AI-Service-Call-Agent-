'use client';

import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  ArrowRight, 
  Check, 
  X, 
  Zap, 
  Clock, 
  TrendingUp, 
  Shield, 
  AlertCircle,
  BarChart3,
  Phone,
  Calendar,
  FileText,
  Target,
  DollarSign,
  CheckCircle2
} from 'lucide-react';

export default function ProductionPilotPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        
        {/* Hero Section */}
        <section className="relative bg-neutral-900 text-white pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Live Production Evaluation — Not a Demo</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Recover Missed HVAC Revenue
                <span className="block mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Proven on Your Live Phone Line
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-neutral-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                Deploy KestrelVoice on your real business number for a controlled production pilot. 
                Measure calls answered, jobs booked, and after-hours coverage before making a long-term decision.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a 
                  href="/calendar"
                  className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Start $199 Production Pilot
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              
              <p className="text-sm text-neutral-400">
                No free trials. No demos. Live production evaluation only.
              </p>
            </div>
          </div>
        </section>

        {/* Problem Qualification Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                  Is This Already Costing You Jobs?
                </h2>
                <p className="text-xl text-neutral-600 leading-relaxed">
                  Most HVAC businesses lose revenue every week due to operational gaps—not marketing.
                </p>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-8 md:p-12 border border-neutral-200 mb-8">
                <p className="text-lg text-neutral-700 mb-6 font-medium">
                  This production pilot is designed for HVAC operators who:
                </p>
                
                <div className="space-y-4">
                  {[
                    'See calls roll to voicemail during peak hours',
                    'Miss emergency or after-hours service requests',
                    'Rely on office staff or call centers that can\'t keep up',
                    'Want a deterministic system that books jobs, not an AI experiment'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-lg text-neutral-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <p className="text-lg font-semibold text-neutral-900 mb-2">
                  This is not a demo.
                </p>
                <p className="text-neutral-700">
                  Your real customers will call your real number.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What the Pilot Actually Is */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                  A Paid Production Evaluation — Not a Trial
                </h2>
                <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                  The KestrelVoice Production Pilot is a short, paid deployment on live infrastructure. 
                  It runs under real operating conditions so you can evaluate performance with confidence.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                  <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Phone className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Calls are answered live by KestrelVoice</h3>
                  <p className="text-neutral-600">Real-time handling of your actual customer inquiries</p>
                </div>

                <div className="bg-white p-8 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                  <div className="bg-purple-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Customer intent is captured and qualified</h3>
                  <p className="text-neutral-600">Intelligent routing based on service type and urgency</p>
                </div>

                <div className="bg-white p-8 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                  <div className="bg-green-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Appointments booked directly to your calendar</h3>
                  <p className="text-neutral-600">Seamless integration with your scheduling system</p>
                </div>

                <div className="bg-white p-8 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                  <div className="bg-orange-50 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">Performance measured against real call traffic</h3>
                  <p className="text-neutral-600">Data-driven insights on call handling effectiveness</p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-lg font-semibold text-neutral-900">
                  A clear decision is expected at the end.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get During the Pilot */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                  What Runs During the Production Pilot
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-12">
                {[
                  'Live inbound call handling on your business number',
                  'Production-grade latency (~200ms)',
                  'HVAC-specific call flows (service, install, emergency)',
                  'Job qualification + booking enabled',
                  'Calendar write-back',
                  'Call summaries and operational metrics'
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
                <Clock className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Duration</h3>
                <p className="text-3xl font-bold">7-Day Production Evaluation Window</p>
              </div>
            </div>
          </div>
        </section>

        {/* Controlled by Design */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                  Deliberately Limited for Accuracy
                </h2>
                <p className="text-xl text-neutral-600 leading-relaxed">
                  To protect performance and ensure meaningful results, the pilot is intentionally scoped.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 md:p-12 border border-neutral-200">
                <h3 className="text-2xl font-bold text-neutral-900 mb-6">Pilot Limits:</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'One business location',
                    'One phone number',
                    'Inbound calls only',
                    'Business hours enforced',
                    'Max call duration enforced',
                    'No outbound campaigns',
                    'No customization during pilot'
                  ].map((limit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <span className="text-neutral-700">{limit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <p className="text-neutral-600 italic">
                    These constraints mirror how enterprise phone systems are evaluated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Pilot Deliverable */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                  What You Receive at the End of the Pilot
                </h2>
                <p className="text-2xl text-blue-600 font-semibold mb-6">
                  A Data-Driven Revenue Opportunity & Call Leakage Analysis
                </p>
                <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
                  At the end of the pilot, you receive a concise executive report that translates 
                  pilot data into operational and financial insight.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-200">
                  <FileText className="w-10 h-10 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">The Report Includes:</h3>
                  <ul className="space-y-3">
                    {[
                      'Calls answered vs. missed during the pilot',
                      'After-hours and emergency call capture',
                      'Jobs booked and high-intent leads identified',
                      'Call-to-booking efficiency metrics'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border border-green-200">
                  <DollarSign className="w-10 h-10 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900 mb-4">Revenue Opportunity Model:</h3>
                  <p className="text-neutral-700 mb-4">A conservative annual revenue opportunity model, based on:</p>
                  <ul className="space-y-3">
                    {[
                      'Observed pilot data',
                      'Your average ticket size',
                      'Industry benchmark miss rates'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-r-lg">
                <p className="text-neutral-900 font-semibold mb-2">Important Note:</p>
                <p className="text-neutral-700">
                  This is not a guarantee. It is a quantified view of what is currently leaking—and 
                  what full deployment is positioned to recover.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                $199 Production Pilot
              </h2>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20 mb-8">
                <div className="space-y-4 text-left max-w-2xl mx-auto">
                  {[
                    'Paid evaluation on live infrastructure',
                    'Engineering and onboarding resources included',
                    'Pilot fee credited toward your first month if you continue'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-lg text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xl text-neutral-300 mb-8">
                We do not offer free trials for production call handling.
              </p>

              <a 
                href="/calendar"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-lg text-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Start Your Production Pilot
                <ArrowRight className="w-6 h-6" />
              </a>
            </div>
          </div>
        </section>

        {/* Success Metrics */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                  Clear Evaluation Criteria
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {[
                  { icon: TrendingUp, label: 'Answer rate vs. baseline', color: 'blue' },
                  { icon: Calendar, label: 'Bookings created', color: 'green' },
                  { icon: Target, label: 'High-intent call identification', color: 'purple' },
                  { icon: Clock, label: 'Average call handling time', color: 'orange' },
                  { icon: Shield, label: 'After-hours coverage impact', color: 'red' },
                  { icon: BarChart3, label: 'Revenue opportunity identified', color: 'blue' }
                ].map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div key={index} className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 text-center">
                      <Icon className={`w-10 h-10 text-${metric.color}-600 mx-auto mb-3`} />
                      <p className="text-neutral-700 font-medium">{metric.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <p className="text-lg text-neutral-700">
                  At the end of the pilot, results are reviewed and a deployment recommendation is made.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Post-Pilot Pathways */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
                  Next Steps After the Pilot
                </h2>
                <p className="text-xl text-neutral-600">
                  Your pilot fee is credited if you proceed.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Option A */}
                <div className="bg-white rounded-2xl border-2 border-blue-600 p-8 relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Recommended
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Hybrid Operations</h3>
                  <p className="text-neutral-600 mb-6">Full coverage on your primary business line with booking enabled</p>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-neutral-900 mb-1">$999</div>
                    <div className="text-neutral-600">/month</div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Up to 500 calls/month',
                      'Basic CRM integration',
                      'Email support',
                      '1-5 technicians'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <a 
                    href="/calendar"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-center transition-all"
                  >
                    Get Started
                  </a>
                </div>

                {/* Option B */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-8">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Advanced Streaming</h3>
                  <p className="text-neutral-600 mb-6">Lower latency, higher concurrency, expanded workflows</p>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-neutral-900 mb-1">$2,499</div>
                    <div className="text-neutral-600">/month</div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Up to 2,000 calls/month',
                      'ServiceTitan/Housecall Pro',
                      'Priority support',
                      '5-20 technicians'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <a 
                    href="/calendar"
                    className="block w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-lg font-semibold text-center transition-all"
                  >
                    Request Demo
                  </a>
                </div>

                {/* Option C */}
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Customized Operations</h3>
                  <p className="text-neutral-300 mb-6">Tailored routing, integrations, and enterprise-grade configuration</p>
                  <div className="mb-6">
                    <div className="text-4xl font-bold mb-1">$4,900</div>
                    <div className="text-neutral-400">/month</div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Unlimited calls',
                      'Multi-location support',
                      'Dedicated success manager',
                      '20+ technicians'
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-neutral-200">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <a 
                    href="/contact"
                    className="block w-full bg-white hover:bg-neutral-100 text-neutral-900 py-3 rounded-lg font-semibold text-center transition-all"
                  >
                    Contact Sales
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  {
                    question: 'Why is the pilot paid?',
                    answer: 'Because we deploy on live phone lines and commit real infrastructure. Paid pilots ensure production-grade results—not demos.'
                  },
                  {
                    question: 'Is this a free trial?',
                    answer: 'No. This is a time-boxed production evaluation with real engineering resources and live infrastructure.'
                  },
                  {
                    question: 'Will this talk to real customers?',
                    answer: 'Yes. All calls are live customer inquiries handled by KestrelVoice on your actual business line.'
                  },
                  {
                    question: 'What happens if I don\'t continue after the pilot?',
                    answer: 'You keep the executive report with revenue opportunity analysis. The $199 pilot fee is non-refundable but provides valuable operational insights.'
                  },
                  {
                    question: 'How quickly can we start?',
                    answer: 'Most pilots are deployed within 48-72 hours of onboarding completion. We handle all technical setup.'
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">{faq.question}</h3>
                    <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                See How It Performs on Real HVAC Calls
              </h2>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Built for operators who want results, not experiments.
              </p>
              <a 
                href="/calendar"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-lg text-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 hover:bg-blue-50"
              >
                Run a $199 Production Pilot
                <ArrowRight className="w-6 h-6" />
              </a>
              <p className="mt-6 text-blue-100">
                7-day evaluation • Live infrastructure • Executive report included
              </p>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
