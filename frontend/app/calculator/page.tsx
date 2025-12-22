'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ArrowRight, Check, Download } from 'lucide-react';

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    business_type: 'HVAC',
    avg_ticket_value: 2500,
    calls_per_day: 30,
    current_answer_rate: 65,
    email: '',
    phone: '',
    company_name: ''
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, calculate locally (will connect to API later)
      const totalCallsPerMonth = formData.calls_per_day * 5 * 4.33;
      const missedCallsPerMonth = totalCallsPerMonth * (1 - formData.current_answer_rate / 100);
      const monthlyLoss = missedCallsPerMonth * 0.3 * formData.avg_ticket_value;
      const annualLoss = monthlyLoss * 12;
      const recovered = annualLoss * 0.9;
      const investment = 1497 * 12;
      const roi = ((recovered - investment) / investment * 100).toFixed(0);

      setResult({
        total_calls_per_month: Math.round(totalCallsPerMonth),
        calls_missed: Math.round(missedCallsPerMonth),
        monthly_loss: Math.round(monthlyLoss),
        annual_loss: Math.round(annualLoss),
        recoverable_revenue: Math.round(recovered),
        roi_percentage: parseInt(roi),
        lead_tier: monthlyLoss > 50000 ? 'Hot' : monthlyLoss > 20000 ? 'Warm' : 'Qualified'
      });
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/pdf/generate-roi-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calculator_data: {
            business_type: formData.business_type,
            avg_ticket_value: formData.avg_ticket_value,
            calls_per_day: formData.calls_per_day,
            current_answer_rate: formData.current_answer_rate
          },
          results: result,
          company_info: {
            company_name: formData.company_name || null,
            email: formData.email || null,
            phone: formData.phone || null
          }
        })
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Kestrel_ROI_Report_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-6">
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Calculate Your Missed Call Tax
              </h1>
              <p className="text-xl text-gray-600">
                See exactly how much revenue you're losing to unanswered calls
              </p>
            </div>

            {!result ? (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <select
                      value={formData.business_type}
                      onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="HVAC">HVAC</option>
                      <option value="PLUMBING">Plumbing</option>
                      <option value="ELECTRICAL">Electrical</option>
                      <option value="ROOFING">Roofing</option>
                      <option value="GENERAL_CONTRACTOR">General Contractor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Average Ticket Value ($)
                    </label>
                    <input
                      type="number"
                      value={formData.avg_ticket_value}
                      onChange={(e) => setFormData({...formData, avg_ticket_value: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calls Per Day
                    </label>
                    <input
                      type="number"
                      value={formData.calls_per_day}
                      onChange={(e) => setFormData({...formData, calls_per_day: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Answer Rate (%)
                    </label>
                    <input
                      type="number"
                      value={formData.current_answer_rate}
                      onChange={(e) => setFormData({...formData, current_answer_rate: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your Company Name"
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Calculating...' : 'Calculate My ROI'}
                  <ArrowRight size={20} />
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-3xl font-bold mb-6 text-center">Your Results</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Calls/Month</p>
                      <p className="text-3xl font-bold text-gray-900">{result.total_calls_per_month}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Calls Missed</p>
                      <p className="text-3xl font-bold text-red-600">{result.calls_missed}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-8 mb-6">
                    <p className="text-sm uppercase tracking-wide text-red-900 mb-2">You're Currently Losing</p>
                    <p className="text-5xl font-bold text-red-600 mb-4">${result.annual_loss.toLocaleString()}/year</p>
                    <p className="text-lg text-red-800">${result.monthly_loss.toLocaleString()}/month in missed revenue</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-8 mb-6">
                    <p className="text-sm uppercase tracking-wide text-green-900 mb-2">With Kestrel You Recover</p>
                    <p className="text-5xl font-bold text-green-600 mb-4">${result.recoverable_revenue.toLocaleString()}/year</p>
                    <p className="text-lg text-green-800">ROI: {result.roi_percentage}% in the first year</p>
                  </div>

                  <div className="bg-blue-900 text-white rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4">What You Get with Kestrel:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Check className="flex-shrink-0 mt-1" size={20} />
                        <span>Custom-built HVAC AI call agent for your {formData.business_type} business</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="flex-shrink-0 mt-1" size={20} />
                        <span>Live in 48 hours with zero technical work from you</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="flex-shrink-0 mt-1" size={20} />
                        <span>Answers every call in 200ms, 24/7/365</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="flex-shrink-0 mt-1" size={20} />
                        <span>Emergency routing and HVAC-specific protocols</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="flex-shrink-0 mt-1" size={20} />
                        <span>Ongoing monitoring and optimization</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloadingPDF}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Download size={20} />
                      {downloadingPDF ? 'Generating PDF...' : 'Download Full Report (PDF)'}
                    </button>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                      <a
                        href="tel:+15551234567"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold text-lg text-center transition-colors"
                      >
                        📞 Call Us Now
                      </a>
                      <a
                        href="/demo"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-lg text-center transition-colors"
                      >
                        Schedule Consultation
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                >
                  Calculate Again
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
