import { Check, ArrowRight, Sparkles } from 'lucide-react';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-white to-neutral-50">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Enterprise Voice Operations
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 bg-clip-text text-transparent">
            Outcome-Based Pricing
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto mb-8">
            Start with workflow validation. Deploy deterministic voice operations at scale.
          </p>
        </div>
        
        {/* Demo CTA - Prominent */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-8 md:p-12 text-white shadow-2xl border border-brand-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-3">Start with Workflow Validation</h3>
                <p className="text-brand-100 text-lg">
                  See our platform handle your actual call patterns. 1-week analysis included.
                </p>
              </div>
              <div className="flex-shrink-0">
                <a 
                  href="/calendar"
                  className="inline-flex items-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Book Workflow Demo
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          
          {/* DIY */}
          <div className="bg-white rounded-2xl border border-neutral-200 hover:border-brand-300 hover:shadow-xl transition-all p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Autonomous Intake</h3>
              <p className="text-neutral-600">Deterministic appointment & lead workflows</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-neutral-900">$999</span>
                <span className="text-neutral-600">/month</span>
              </div>
              <p className="text-sm text-neutral-500 mt-2">No setup fee</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-neutral-700">
                <Check className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                <span>Up to 500 calls/month</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-700">
                <Check className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                <span>Self-guided setup</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-700">
                <Check className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                <span>Basic CRM integration</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-700">
                <Check className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                <span>Email support</span>
              </li>
            </ul>
            <a 
              href="/calendar"
              className="block w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-xl font-semibold text-center transition-all"
            >
              Request Demo
            </a>
            <p className="text-center text-xs text-neutral-500 mt-4">
              1-5 technicians
            </p>
          </div>

          {/* Professional - Most Popular */}
          <div className="bg-white rounded-2xl border-2 border-brand-600 hover:shadow-2xl transition-all p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
              Most Popular
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Integrated Operations</h3>
              <p className="text-neutral-600">Enterprise routing, CRM sync, multi-location</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-neutral-900">$1,997</span>
                <span className="text-neutral-600">/month</span>
              </div>
              <p className="text-sm text-neutral-500 mt-2">+ $4,997 setup</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-neutral-700">
                <Check className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                <span className="font-medium">Up to 2,000 calls/month</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-700">
                <Check className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                <span className="font-medium">12-hour deployment</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-700">
                <Check className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                <span>ServiceTitan/Housecall Pro integration</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-700">
                <Check className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                <span>Emergency protocols</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-700">
                <Check className="text-success-600 flex-shrink-0 mt-0.5" size={18} />
                <span>Priority support (2-hour response)</span>
              </li>
            </ul>
            <a 
              href="/calendar"
              className="block w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold text-center transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </a>
            <p className="text-center text-xs text-neutral-500 mt-4">
              5-20 technicians
            </p>
          </div>

          {/* Custom/Enterprise */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700 hover:shadow-2xl transition-all p-8 text-white">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">VoiceOps Premium</h3>
              <p className="text-neutral-300">Custom workflow encoding, SLA, voice variants</p>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">Contact</span>
              </div>
              <p className="text-sm text-neutral-400 mt-2">Starting at $10,000 setup</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 text-neutral-200">
                <Check className="text-success-400 flex-shrink-0 mt-0.5" size={18} />
                <span className="font-medium">Unlimited calls</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-200">
                <Check className="text-success-400 flex-shrink-0 mt-0.5" size={18} />
                <span className="font-medium">White-glove onboarding</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-200">
                <Check className="text-success-400 flex-shrink-0 mt-0.5" size={18} />
                <span>Multi-location support</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-200">
                <Check className="text-success-400 flex-shrink-0 mt-0.5" size={18} />
                <span>Custom voice cloning</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-200">
                <Check className="text-success-400 flex-shrink-0 mt-0.5" size={18} />
                <span>Dedicated success manager</span>
              </li>
              <li className="flex items-start gap-3 text-neutral-200">
                <Check className="text-success-400 flex-shrink-0 mt-0.5" size={18} />
                <span>24/7 support (30-min SLA)</span>
              </li>
            </ul>
            <a 
              href="/contact"
              className="block w-full bg-white hover:bg-neutral-100 text-neutral-900 py-3 rounded-xl font-semibold text-center transition-all"
            >
              Contact Sales
            </a>
            <p className="text-center text-xs text-neutral-400 mt-4">
              20+ technicians, 3+ locations
            </p>
          </div>
          
        </div>
        
        {/* Trust Indicators */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-brand-600 mb-2">40%</div>
              <div className="text-neutral-600">Average booking increase</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600 mb-2">200ms</div>
              <div className="text-neutral-600">Response time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-600 mb-2">24/7</div>
              <div className="text-neutral-600">Never miss a call</div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-neutral-200">
            <p className="text-center text-neutral-600 mb-6">
              <strong className="text-neutral-900">Trusted by leading service businesses</strong> to handle thousands of calls monthly
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Check className="text-success-600" size={16} />
                <span>SOC 2 Type II Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-success-600" size={16} />
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-success-600" size={16} />
                <span>HIPAA Compliant</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
