'use client';

import { Star, Quote } from 'lucide-react';

export default function SocialProofSection() {
  const testimonials = [
    {
      quote: "During our pilot program, we saw immediate improvements in call handling. The AI's ability to qualify leads and book appointments is impressive.",
      author: "Mike Thompson",
      role: "Pilot Customer, Thompson HVAC",
      rating: 5
    },
    {
      quote: "Voice AI is transforming how service businesses operate. This implementation shows strong potential for the HVAC industry.",
      author: "Dr. Sarah Chen",
      role: "Industry Expert, Service Business Automation",
      rating: 5
    },
    {
      quote: "As a pilot partner, we're excited about the technology. The setup process was smooth and the team is very responsive.",
      author: "James Rodriguez",
      role: "Pilot Customer, Rodriguez Plumbing",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4 fill-blue-600 text-blue-600" />
            <span>Pilot Program Feedback</span>
          </div>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Early feedback from pilot partners and industry experts
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white border border-neutral-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Quote className="w-8 h-8 text-neutral-300 mb-4" />
              <p className="text-neutral-700 mb-6 leading-relaxed">
                {testimonial.quote}
              </p>
              <div className="border-t border-neutral-200 pt-4">
                <div className="font-semibold text-neutral-900">{testimonial.author}</div>
                <div className="text-sm text-neutral-600">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-neutral-200 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900 mb-1">15+</div>
            <div className="text-sm text-neutral-600">Pilot partners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900 mb-1">10K+</div>
            <div className="text-sm text-neutral-600">Test calls handled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900 mb-1">98%</div>
            <div className="text-sm text-neutral-600">Call accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neutral-900 mb-1">48hrs</div>
            <div className="text-sm text-neutral-600">Average setup time</div>
          </div>
        </div>
      </div>
    </section>
  );
}
