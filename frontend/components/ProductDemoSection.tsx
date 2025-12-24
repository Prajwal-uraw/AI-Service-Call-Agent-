'use client';

import { Phone, Check, Calendar, MapPin, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProductDemoSection() {
  const [step, setStep] = useState(0);

  const conversation = [
    { type: 'incoming', text: 'Incoming call from +1 (555) 123-4567', delay: 0 },
    { type: 'customer', text: 'Hi, my AC just stopped working and it\'s 95 degrees!', delay: 1000 },
    { type: 'ai', text: 'I can help you right away! What\'s your address?', delay: 2500 },
    { type: 'customer', text: '123 Main Street, Phoenix, AZ 85001', delay: 4000 },
    { type: 'ai', text: 'Perfect! I have availability today at 2 PM or 4 PM. Which works better?', delay: 5500 },
    { type: 'customer', text: '2 PM would be great!', delay: 7000 },
    { type: 'ai', text: 'Booked! Technician John will arrive at 2 PM. You\'ll receive a confirmation text shortly.', delay: 8500 },
    { type: 'success', text: 'Appointment confirmed • $2,400 revenue captured', delay: 10000 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev < conversation.length - 1) {
          return prev + 1;
        }
        return 0; // Loop
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-purple-50 border border-purple-200 rounded-full mb-4">
              <span className="text-sm font-medium text-purple-900">See it in action</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Watch AI book an appointment
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Real conversation. Real booking. Real revenue. All in under 60 seconds.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Demo UI */}
            <div className="relative">
              <div className="bg-neutral-900 rounded-2xl p-8 shadow-2xl border border-neutral-800">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-800">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Live Call</div>
                    <div className="text-neutral-400 text-sm">Emergency AC Repair</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-neutral-400 text-sm">Recording</span>
                  </div>
                </div>

                {/* Conversation */}
                <div className="space-y-4 h-[400px] overflow-hidden">
                  {conversation.slice(0, step + 1).map((msg, index) => {
                    if (msg.type === 'incoming') {
                      return (
                        <div key={index} className="text-center">
                          <span className="inline-block px-3 py-1 bg-neutral-800 text-neutral-400 text-xs rounded-full">
                            {msg.text}
                          </span>
                        </div>
                      );
                    }
                    
                    if (msg.type === 'success') {
                      return (
                        <div key={index} className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/30 rounded-lg animate-fade-in">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-green-300 font-semibold">{msg.text}</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={index}
                        className={`flex ${msg.type === 'ai' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-3 rounded-lg ${
                            msg.type === 'ai'
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-800 text-neutral-100'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floating stats */}
              <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
                <div className="text-2xl font-bold">$2,400</div>
                <div className="text-xs opacity-90">Revenue captured</div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Instant Response</h3>
                  <p className="text-sm text-neutral-600">Answers in under 200ms. No hold music, no missed calls.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Smart Scheduling</h3>
                  <p className="text-sm text-neutral-600">Books directly into your calendar with real-time availability.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 mb-1">Territory Aware</h3>
                  <p className="text-sm text-neutral-600">Knows your service area, pricing, and emergency protocols.</p>
                </div>
              </div>

              <div className="pt-4">
                <a 
                  href="/calendar"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  See your demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
