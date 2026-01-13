'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Phone, Clock, Calendar, Download, Filter, Search, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function CallsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Demo data
  const stats = {
    total_calls: 156,
    answered: 142,
    missed: 14,
    avg_duration: '3:24',
    conversion_rate: 68
  };

  const calls = [
    {
      id: '1',
      customer_name: 'John Smith',
      phone: '+1 (555) 123-4567',
      service_type: 'AC Repair',
      duration: '4:32',
      outcome: 'booked',
      timestamp: '2024-01-15 14:23',
      recording_url: '#'
    },
    {
      id: '2',
      customer_name: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      service_type: 'Furnace Maintenance',
      duration: '2:15',
      outcome: 'follow_up',
      timestamp: '2024-01-15 13:45',
      recording_url: '#'
    },
    {
      id: '3',
      customer_name: 'Mike Davis',
      phone: '+1 (555) 345-6789',
      service_type: 'Emergency Heating',
      duration: '0:00',
      outcome: 'missed',
      timestamp: '2024-01-15 12:30',
      recording_url: null
    },
    {
      id: '4',
      customer_name: 'Emily Chen',
      phone: '+1 (555) 456-7890',
      service_type: 'AC Installation',
      duration: '6:18',
      outcome: 'booked',
      timestamp: '2024-01-15 11:15',
      recording_url: '#'
    },
    {
      id: '5',
      customer_name: 'Robert Wilson',
      phone: '+1 (555) 567-8901',
      service_type: 'Duct Cleaning',
      duration: '3:42',
      outcome: 'quote_sent',
      timestamp: '2024-01-15 10:00',
      recording_url: '#'
    }
  ];

  const getOutcomeBadge = (outcome: string) => {
    const styles = {
      booked: 'bg-green-50 text-green-700 border-green-200',
      follow_up: 'bg-amber-50 text-amber-700 border-amber-200',
      missed: 'bg-red-50 text-red-700 border-red-200',
      quote_sent: 'bg-blue-50 text-blue-700 border-blue-200',
      no_answer: 'bg-neutral-50 text-neutral-700 border-neutral-200'
    };

    const labels = {
      booked: 'Booked',
      follow_up: 'Follow-up',
      missed: 'Missed',
      quote_sent: 'Quote Sent',
      no_answer: 'No Answer'
    };

    const icons = {
      booked: <CheckCircle className="w-3 h-3" />,
      follow_up: <AlertCircle className="w-3 h-3" />,
      missed: <XCircle className="w-3 h-3" />,
      quote_sent: <CheckCircle className="w-3 h-3" />,
      no_answer: <XCircle className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${styles[outcome as keyof typeof styles]}`}>
        {icons[outcome as keyof typeof icons]}
        {labels[outcome as keyof typeof labels]}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Calls</h1>
            <p className="text-sm text-neutral-600 mt-1">Track and manage all customer calls</p>
          </div>
          <button 
            onClick={() => {
              // Create CSV header
              const headers = ['Customer Name', 'Phone', 'Service', 'Duration', 'Outcome', 'Time'];
              
              // Convert data to CSV rows
              const csvRows = [
                headers.join(','), // Add header row first
                ...calls.map(call => 
                  [
                    `"${call.customer_name.replace(/"/g, '""')}"`,
                    `"${call.phone}"`,
                    `"${call.service_type}"`,
                    `"${call.duration}"`,
                    `"${call.outcome}"`,
                    `"${call.timestamp}"`
                  ].join(',')
                )
              ];

              // Create CSV content
              const csvContent = csvRows.join('\n');
              
              // Create a Blob with the CSV data
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              
              // Create a download link and trigger it
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `calls_export_${new Date().toISOString().split('T')[0]}.csv`);
              link.style.visibility = 'hidden';
              
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export as CSV
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Calls</span>
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.total_calls}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Answered</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.answered}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Missed</span>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.missed}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Avg Duration</span>
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.avg_duration}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Conversion</span>
              <Calendar className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.conversion_rate}%</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              aria-label="Filter calls by status"
            >
              <option value="all">All Status</option>
              <option value="booked">Booked</option>
              <option value="follow_up">Follow-up</option>
              <option value="missed">Missed</option>
              <option value="quote_sent">Quote Sent</option>
            </select>

            {/* Date Filter */}
            <select
              aria-label="Filter calls by date range"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Calls Table */}
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Service</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Duration</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Outcome</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Time</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {calls
                  .filter(call => {
                    // Apply search filter
                    const matchesSearch = searchQuery === '' || 
                      call.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      call.phone.includes(searchQuery);
                    
                    // Apply status filter
                    const matchesStatus = statusFilter === 'all' || call.outcome === statusFilter;
                    
                    return matchesSearch && matchesStatus;
                  })
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((call, index) => (
                  <tr
                    key={call.id}
                    className={`${index !== calls.length - 1 ? 'border-b border-neutral-100' : ''} hover:bg-neutral-50 transition-colors group`}
                  >
                    <td className="py-3.5 px-6">
                      <div className="text-sm font-medium text-neutral-900">{call.customer_name}</div>
                    </td>
                    <td className="py-3.5 px-6 text-sm text-neutral-600">
                      {call.phone}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-sm text-neutral-700">{call.service_type}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center text-sm text-neutral-600">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {call.duration}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      {getOutcomeBadge(call.outcome)}
                    </td>
                    <td className="py-3.5 px-6 text-sm text-neutral-500">
                      {call.timestamp}
                    </td>
                    <td className="py-3.5 px-6">
                      {call.recording_url && (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors">
                          <Play className="w-3 h-3" />
                          Play
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Showing <span className="font-medium">1-5</span> of <span className="font-medium">156</span> calls
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
              >
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm font-medium bg-neutral-900 text-white rounded">
                {currentPage}
              </button>
              <button 
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= Math.ceil(calls.length / itemsPerPage)}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  currentPage >= Math.ceil(calls.length / itemsPerPage)
                    ? 'text-neutral-400 cursor-not-allowed' 
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
