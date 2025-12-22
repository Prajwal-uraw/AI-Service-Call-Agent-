import { Phone } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
      <div className="container mx-auto px-6 text-center">
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Stop Losing Calls. Start Tonight.
        </h2>
        
        <p className="text-2xl mb-12 max-w-3xl mx-auto">
          Schedule a 30-minute call. We'll show you exactly how we'll custom-build 
          your AI receptionist—and you'll be live in 48 hours.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <a 
            href="tel:+15551234567"
            className="flex items-center gap-2 bg-white text-orange-600 px-10 py-5 rounded-lg text-xl font-bold hover:bg-gray-100 transition-colors"
          >
            <Phone size={24} />
            Call: (555) 123-4567
          </a>
          <a 
            href="/demo"
            className="bg-blue-900 text-white px-10 py-5 rounded-lg text-xl font-bold hover:bg-blue-800 transition-colors"
          >
            Schedule Consultation →
          </a>
        </div>
        
        <p className="mt-8 text-orange-100">
          30-Day Money-Back Guarantee • No Contract • Cancel Anytime
        </p>
        
      </div>
    </section>
  );
}
