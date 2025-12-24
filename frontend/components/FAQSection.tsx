'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How long does setup take?',
      answer: 'Most customers are live within 48 hours. We handle all the technical setup, integration, and testing. You just need 30 minutes for the discovery call and 1 hour for testing.'
    },
    {
      question: 'What if the AI makes a mistake?',
      answer: 'Our AI is trained specifically for home services and has a 98% accuracy rate. We monitor every call and continuously optimize. Plus, you can always override or escalate to a human if needed.'
    },
    {
      question: 'Can it handle emergency calls?',
      answer: 'Absolutely. The AI is trained on your emergency protocols, knows your on-call schedule, and can dispatch technicians 24/7. It never sleeps, never takes breaks, and never misses an emergency call.'
    },
    {
      question: 'Does it integrate with my CRM?',
      answer: 'Yes. We integrate with ServiceTitan, Housecall Pro, Jobber, ServiceM8, and most major CRMs. All call data, appointments, and customer info sync automatically.'
    },
    {
      question: 'What happens to my existing phone number?',
      answer: 'You keep your existing number. We simply forward calls to our AI system. You can switch back anytime with a single click. No number changes, no customer confusion.'
    },
    {
      question: 'How much does it cost?',
      answer: 'DIY plan starts at $999/month. Professional plan is $2,100/month + $5,000 setup. Custom enterprise plans available. Most customers see positive ROI within 30-90 days.'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-xl text-neutral-600">
              Everything you need to know about our AI voice agents
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-semibold text-neutral-900 pr-8">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-500 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 bg-neutral-50">
                    <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-neutral-600 mb-4">Still have questions?</p>
            <a 
              href="/calendar"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Book a call with our team
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
