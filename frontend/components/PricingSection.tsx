import { Check } from 'lucide-react';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Premium Service. Professional Pricing.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're 50-70% less than traditional agencies, but we do all the work—
            unlike DIY platforms that leave you struggling.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Professional Tier */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-green-500 relative">
            <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-bold">
              MOST POPULAR
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8">
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <p className="text-blue-100 mb-6">For growing HVAC companies</p>
              <div className="mb-2">
                <span className="text-5xl font-bold">$1,497</span>
                <span className="text-xl text-blue-100">/month</span>
              </div>
              <div className="text-blue-100">+ $4,997 custom build fee</div>
            </div>
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span><strong>Custom-built</strong> for your business</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span><strong>48-hour deployment</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Up to <strong>1,500 calls/month</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>HVAC-specific emergency protocols</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>ServiceTitan/Housecall Pro integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Ongoing monitoring & optimization</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Priority support (2-hour response)</span>
                </li>
              </ul>
              <a 
                href="tel:+15551234567"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg text-center transition-colors"
              >
                Schedule Consultation
              </a>
              <p className="text-center text-sm text-gray-500 mt-4">
                Perfect for 5-15 technician companies
              </p>
            </div>
          </div>
          
          {/* Premium Tier */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-8">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-gray-300 mb-6">For multi-location & enterprise</p>
              <div className="mb-2">
                <span className="text-5xl font-bold">$2,497</span>
                <span className="text-xl text-gray-300">/month</span>
              </div>
              <div className="text-gray-300">+ $9,997 custom build fee</div>
            </div>
            <div className="p-8">
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span><strong>Everything in Professional, PLUS:</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span><strong>Multi-location</strong> support (3+ locations)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span><strong>Unlimited calls</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Dedicated deployment (isolated server)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Custom voice cloning (sounds like YOUR team)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>Dedicated success manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0" size={20} />
                  <span>24/7 priority support (30-min response)</span>
                </li>
              </ul>
              <a 
                href="tel:+15551234567"
                className="block w-full bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-lg font-semibold text-lg text-center transition-colors"
              >
                Schedule Consultation
              </a>
              <p className="text-center text-sm text-gray-500 mt-4">
                Perfect for 15+ techs, regional operations
              </p>
            </div>
          </div>
          
        </div>
        
        {/* Trust Builders */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="text-green-500" size={16} />
              <span>30-Day Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-500" size={16} />
              <span>No Long-Term Contract</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-500" size={16} />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
