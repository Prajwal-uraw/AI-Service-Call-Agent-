import { Phone } from 'lucide-react';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 text-white flex items-center">
      <div className="container mx-auto px-6 text-center">
        
        <p className="text-blue-200 text-sm uppercase tracking-wide mb-4 animate-pulse">
          🔴 LIVE DEMO - CALL RIGHT NOW
        </p>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Experience The Difference<br/>
          In The First 3 Seconds
        </h1>
        
        <p className="text-2xl md:text-3xl text-blue-100 mb-12 max-w-4xl mx-auto">
          Call Kestrel right now. You'll hear why our HVAC AI call agent is 10x faster 
          than Vapi, Bland, or any DIY platform you've tried.
        </p>
        
        <div className="mb-12">
          <a
            href="tel:+15551234567"
            className="inline-flex items-center gap-4 bg-orange-500 hover:bg-orange-600 text-white px-12 py-6 rounded-lg text-3xl font-bold transition-colors shadow-2xl"
          >
            <Phone size={40} />
            (555) 123-4567
          </a>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">What To Test:</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-bold text-lg mb-2">✅ Try This:</h3>
              <ul className="space-y-2 text-blue-100">
                <li>"I need emergency AC repair"</li>
                <li>"What's your pricing for installation?"</li>
                <li>"Can you come today?"</li>
                <li>"I smell gas in my house"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">⏱️ Notice:</h3>
              <ul className="space-y-2 text-blue-100">
                <li>Response time (under 200ms)</li>
                <li>Natural conversation flow</li>
                <li>HVAC-specific knowledge</li>
                <li>Emergency prioritization</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-sm">
          <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
            <div className="text-3xl mb-2">⚡</div>
            <p className="font-bold mb-1">200ms Response</p>
            <p className="text-blue-200">10x faster than competitors</p>
          </div>
          <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
            <div className="text-3xl mb-2">🎯</div>
            <p className="font-bold mb-1">HVAC-Specific</p>
            <p className="text-blue-200">Understands your industry</p>
          </div>
          <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
            <div className="text-3xl mb-2">🚨</div>
            <p className="font-bold mb-1">Emergency Ready</p>
            <p className="text-blue-200">Proper routing & escalation</p>
          </div>
        </div>
        
        <div className="mt-12">
          <p className="text-blue-200 mb-4">Want to see it custom-built for YOUR business?</p>
          <a
            href="/"
            className="inline-block bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Schedule Your Custom Demo →
          </a>
        </div>
        
      </div>
    </main>
  );
}
