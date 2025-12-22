import { Check, X } from 'lucide-react';

export default function DifferentiatorSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Why Kestrel Is Different
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're not a DIY platform. Kestrel is your dedicated team that custom-builds, 
            configures, and continuously optimizes your HVAC AI call agent—so you 
            never touch a line of code.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* DIY Platforms Column */}
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-red-900">
                DIY Platforms<br/>
                <span className="text-sm font-normal">(Vapi, Bland, Retell)</span>
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>You build it yourself</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>20+ hours of setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>Technical knowledge required</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>Generic scripts (sounds robotic)</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>You troubleshoot problems</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>Slow response (400-800ms)</span>
                </li>
              </ul>
            </div>
            
            {/* You Column (Highlighted) */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                BEST VALUE
              </div>
              <h3 className="font-bold text-lg mb-4 text-green-900">
                Kestrel<br/>
                <span className="text-sm font-normal">(HVAC AI Call Agent)</span>
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                  <span className="font-medium">We build it for you</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                  <span className="font-medium">Live in 48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                  <span className="font-medium">Zero tech knowledge needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                  <span className="font-medium">Custom HVAC scripts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                  <span className="font-medium">We monitor & optimize</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                  <span className="font-medium">Lightning fast (200ms)</span>
                </li>
              </ul>
            </div>
            
            {/* Traditional Agencies Column */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-bold text-lg mb-4 text-gray-900">
                Traditional Agencies<br/>
                <span className="text-sm font-normal">(Conversational, etc.)</span>
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="text-green-500 flex-shrink-0" size={16} />
                  <span>Done for you</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>$3,000-8,000/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>$10K-25K setup fees</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>4-8 week deployment</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>Generic AI (not HVAC-specific)</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="text-red-500 flex-shrink-0" size={16} />
                  <span>Slower performance</span>
                </li>
              </ul>
            </div>
            
          </div>
        </div>
        
      </div>
    </section>
  );
}
