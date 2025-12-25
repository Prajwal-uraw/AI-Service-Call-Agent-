'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { FileText, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function GenerateReportPage() {
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const [formData, setFormData] = useState({
    pilot_id: 'KV-PILOT-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    customer_name: '',
    baseline_answer_rate: '62',
    baseline_booking_delay: '24',
    total_calls: '127',
    calls_answered: '127',
    bookings_created: '34',
    average_booking_delay: '3.2',
    declared_capacity: '3',
    average_ticket_value: '450',
    pilot_duration_days: '7'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const generateReport = async () => {
    if (!formData.customer_name) {
      setError('Customer name is required');
      return;
    }

    setGenerating(true);
    setError('');
    setReportGenerated(false);

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilot_id: formData.pilot_id,
          customer_id: formData.customer_name.toLowerCase().replace(/\s+/g, '-'),
          customer_name: formData.customer_name,
          baseline_source: 'customer_reported',
          baseline_metrics: {
            answer_rate: parseFloat(formData.baseline_answer_rate) / 100,
            booking_delay_hours: parseFloat(formData.baseline_booking_delay),
            average_handle_time_minutes: 5.2
          },
          baseline_source_details: 'Owner-reported average performance',
          total_calls: parseInt(formData.total_calls),
          calls_answered: parseInt(formData.calls_answered),
          calls_with_transcripts: [],
          call_events: [],
          bookings_created: parseInt(formData.bookings_created),
          average_booking_delay_minutes: parseFloat(formData.average_booking_delay),
          latency_measurements: [],
          declared_capacity: parseInt(formData.declared_capacity),
          average_ticket_value: parseFloat(formData.average_ticket_value),
          pilot_start_date: new Date(Date.now() - parseInt(formData.pilot_duration_days) * 24 * 60 * 60 * 1000).toISOString(),
          pilot_end_date: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReportData(data);
        setReportGenerated(true);
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (err) {
      setError('Network error. Make sure backend server is running.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Generate Pilot Report
          </h1>
          <p className="text-neutral-600">
            Create comprehensive pilot reports using all 6 analytics engines
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Pilot Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pilot ID */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Pilot ID
              </label>
              <input
                type="text"
                name="pilot_id"
                value={formData.pilot_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="KV-PILOT-2024-0615"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Comfort Pro HVAC"
                required
              />
            </div>

            {/* Baseline Answer Rate */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Baseline Answer Rate (%)
              </label>
              <input
                type="number"
                name="baseline_answer_rate"
                value={formData.baseline_answer_rate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="62"
              />
            </div>

            {/* Baseline Booking Delay */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Baseline Booking Delay (hours)
              </label>
              <input
                type="number"
                name="baseline_booking_delay"
                value={formData.baseline_booking_delay}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="24"
              />
            </div>

            {/* Total Calls */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Total Calls During Pilot
              </label>
              <input
                type="number"
                name="total_calls"
                value={formData.total_calls}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="127"
              />
            </div>

            {/* Calls Answered */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Calls Answered
              </label>
              <input
                type="number"
                name="calls_answered"
                value={formData.calls_answered}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="127"
              />
            </div>

            {/* Bookings Created */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bookings Created
              </label>
              <input
                type="number"
                name="bookings_created"
                value={formData.bookings_created}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="34"
              />
            </div>

            {/* Average Booking Delay */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Avg Booking Delay (minutes)
              </label>
              <input
                type="number"
                step="0.1"
                name="average_booking_delay"
                value={formData.average_booking_delay}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3.2"
              />
            </div>

            {/* Declared Capacity */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Declared Capacity (concurrent calls)
              </label>
              <input
                type="number"
                name="declared_capacity"
                value={formData.declared_capacity}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3"
              />
            </div>

            {/* Average Ticket Value */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Average Ticket Value ($)
              </label>
              <input
                type="number"
                name="average_ticket_value"
                value={formData.average_ticket_value}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="450"
              />
            </div>

            {/* Pilot Duration */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Pilot Duration (days)
              </label>
              <input
                type="number"
                name="pilot_duration_days"
                value={formData.pilot_duration_days}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="7"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8">
            <button
              onClick={generateReport}
              disabled={generating}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {reportGenerated && reportData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 text-lg">Report Generated Successfully!</h3>
                <p className="text-green-700 text-sm mt-1">
                  Pilot ID: {reportData.pilot_id}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-neutral-900 mb-3">Report Preview</h4>
              <pre className="text-xs text-neutral-700 overflow-auto max-h-96 bg-neutral-50 p-4 rounded">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button className="flex-1 bg-neutral-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-neutral-700 transition-colors">
                Email Report
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Engines Used</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Baseline & Counterfactual Engine</li>
            <li>✓ Assumptions & Disclosure Engine</li>
            <li>✓ Observed vs Modeled Segregation Engine</li>
            <li>✓ Call Intent Classification Engine</li>
            <li>✓ Call Capacity Saturation Engine</li>
            <li>✓ Latency & System Performance Engine</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
