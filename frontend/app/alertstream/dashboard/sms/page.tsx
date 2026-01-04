'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SMSMessage } from '@/lib/alertstream/types';
import { formatDateTime, formatPhoneNumber, formatCurrency, getStatusColor, downloadAsCSV } from '@/lib/alertstream/utils';

export default function SMSHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterWebsite, setFilterWebsite] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Mock data - will be replaced with real API calls
  const [messages, setMessages] = useState<SMSMessage[]>([
    {
      id: '1',
      trigger_id: '1',
      website_id: '1',
      phone_number: '+15551234567',
      message: 'New form submission from John Doe! Email: john@example.com',
      status: 'delivered',
      twilio_sid: 'SM1234567890',
      cost: 0.0075,
      created_at: '2025-01-15T10:30:00Z',
      updated_at: '2025-01-15T10:30:05Z',
    },
    {
      id: '2',
      trigger_id: '2',
      website_id: '2',
      phone_number: '+15551234567',
      message: '🎉 New order #12345 for $299.99 from Jane Smith',
      status: 'delivered',
      twilio_sid: 'SM0987654321',
      cost: 0.0075,
      created_at: '2025-01-15T09:15:00Z',
      updated_at: '2025-01-15T09:15:03Z',
    },
    {
      id: '3',
      trigger_id: '1',
      website_id: '1',
      phone_number: '+15551234567',
      message: 'New form submission from Alice Brown! Email: alice@example.com',
      status: 'delivered',
      twilio_sid: 'SM1122334455',
      cost: 0.0075,
      created_at: '2025-01-15T08:45:00Z',
      updated_at: '2025-01-15T08:45:04Z',
    },
    {
      id: '4',
      trigger_id: '3',
      website_id: '1',
      phone_number: '+15551234567',
      message: '💰 High value lead! Bob Wilson (bob@example.com) - Budget: $50000',
      status: 'delivered',
      twilio_sid: 'SM6677889900',
      cost: 0.0075,
      created_at: '2025-01-14T16:20:00Z',
      updated_at: '2025-01-14T16:20:02Z',
    },
    {
      id: '5',
      trigger_id: '2',
      website_id: '2',
      phone_number: '+15551234567',
      message: '🎉 New order #12344 for $149.99 from Mike Johnson',
      status: 'failed',
      twilio_sid: 'SM5544332211',
      error_code: '30007',
      error_message: 'Carrier violation',
      cost: 0,
      created_at: '2025-01-14T14:10:00Z',
      updated_at: '2025-01-14T14:10:01Z',
    },
  ]);

  const websites = [
    { id: '1', name: 'Main Website' },
    { id: '2', name: 'E-commerce Store' },
    { id: '3', name: 'Blog' },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.phone_number.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
    const matchesWebsite = filterWebsite === 'all' || msg.website_id === filterWebsite;
    return matchesSearch && matchesStatus && matchesWebsite;
  });

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: messages.length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    failed: messages.filter(m => m.status === 'failed').length,
    totalCost: messages.reduce((sum, m) => sum + (m.cost || 0), 0),
  };

  const handleExport = () => {
    const exportData = filteredMessages.map(msg => ({
      Date: formatDateTime(msg.created_at),
      Phone: msg.phone_number,
      Message: msg.message,
      Status: msg.status,
      Cost: msg.cost ? `$${msg.cost.toFixed(4)}` : '$0.00',
      'Twilio SID': msg.twilio_sid || '',
      Error: msg.error_message || '',
    }));
    downloadAsCSV(exportData, `sms-history-${new Date().toISOString().split('T')[0]}.csv`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SMS History</h1>
          <p className="text-gray-600">View and export your SMS delivery history</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors"
        >
          <Download className="h-5 w-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total SMS</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalCost)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages or phone numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="delivered">Delivered</option>
            <option value="sent">Sent</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filterWebsite}
            onChange={(e) => setFilterWebsite(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Websites</option>
            {websites.map(website => (
              <option key={website.id} value={website.id}>{website.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No SMS messages found
                  </td>
                </tr>
              ) : (
                paginatedMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(message.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPhoneNumber(message.phone_number)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {message.message}
                      {message.error_message && (
                        <p className="text-xs text-red-600 mt-1">Error: {message.error_message}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {message.cost ? formatCurrency(message.cost) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredMessages.length)} of {filteredMessages.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
