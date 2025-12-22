'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ROICalculatorSection() {
  const [avgTicket, setAvgTicket] = useState(500);
  const [missedCalls, setMissedCalls] = useState(15);
  const [conversionRate, setConversionRate] = useState(40);
  const [afterHours, setAfterHours] = useState(50);

  // Simple calculation
  const weeklyLoss = (missedCalls * (afterHours / 100)) * (conversionRate / 100) * avgTicket;
  const annualLoss = weeklyLoss * 52;
  const recovered = annualLoss * 0.90; // 90% recovery rate
  const investment = 1497 * 12; // Annual cost
  const roi = ((recovered - investment) / investment * 100).toFixed(0);

  return (
    <section className="py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-6">
        
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            Calculate Your ROI
          </h2>
          <p className="text-xl text-blue-100 text-center mb-12">
            See how much revenue you're losing to missed calls right now
          </p>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Average Service Call Value
                </label>
                <input 
                  type="number" 
                  value={avgTicket}
                  onChange={(e) => setAvgTicket(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Missed Calls Per Week
                </label>
                <input 
                  type="number" 
                  value={missedCalls}
                  onChange={(e) => setMissedCalls(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Conversion Rate (%)
                </label>
                <input 
                  type="number" 
                  value={conversionRate}
                  onChange={(e) => setConversionRate(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  After-Hours Calls (%)
                </label>
                <input 
                  type="number" 
                  value={afterHours}
                  onChange={(e) => setAfterHours(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50" 
                />
              </div>
              
            </div>
            
            {/* Results */}
            <div className="bg-orange-500 rounded-lg p-8 text-center">
              <p className="text-sm uppercase tracking-wide mb-2">You're Currently Losing</p>
              <p className="text-5xl font-bold mb-4">${annualLoss.toLocaleString()}/year</p>
              <div className="h-px bg-white/30 my-6"></div>
              <p className="text-sm uppercase tracking-wide mb-2">With Our AI You Recover</p>
              <p className="text-4xl font-bold mb-4">${recovered.toLocaleString()}/year</p>
              <p className="text-sm mb-6">Investment: $1,497/mo = ${investment.toLocaleString()}/year</p>
              <p className="text-2xl font-bold">ROI: {roi}% First Year</p>
            </div>
            
            <div className="mt-8 text-center">
              <Link 
                href="/calculator"
                className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
              >
                Get Your Custom Calculation
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
          
        </div>
        
      </div>
    </section>
  );
}
