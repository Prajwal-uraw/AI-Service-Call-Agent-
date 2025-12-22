'use client';

import { Phone, ArrowRight, Check } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-32 mt-16">
      <div className="container mx-auto px-6">
        
        <p className="text-blue-200 text-sm uppercase tracking-wide mb-4">
          Kestrel - Custom-Built HVAC AI Call Agent
        </p>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Stop Losing $200K/Year<br/>
          To Missed After-Hours Calls
        </h1>
        
        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl">
          Kestrel is your custom-built AI receptionist that answers every call 
          in 200ms, books appointments 24/7, and handles emergencies like your 
          best employee—without the headaches of DIY platforms.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <a 
            href="tel:+15551234567"
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            <Phone size={24} />
            Call Us Now: (555) 123-4567
          </a>
          <a 
            href="/demo"
            className="flex items-center justify-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            See Custom Demo
            <ArrowRight size={20} />
          </a>
        </div>
        
        <div className="flex flex-wrap items-center gap-8 text-sm text-blue-200">
          <div className="flex items-center gap-2">
            <Check className="text-green-400" size={20} />
            48-Hour Setup
          </div>
          <div className="flex items-center gap-2">
            <Check className="text-green-400" size={20} />
            Zero Technical Knowledge
          </div>
          <div className="flex items-center gap-2">
            <Check className="text-green-400" size={20} />
            We Do Everything For You
          </div>
        </div>
        
      </div>
    </section>
  );
}
