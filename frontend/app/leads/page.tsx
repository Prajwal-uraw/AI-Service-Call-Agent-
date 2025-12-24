'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Target, Phone, Mail, Calendar, DollarSign, Filter, Search, Plus } from 'lucide-react';

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = {
    total: 156,
    hot: 42,
    warm: 68,
    cold: 46
  };

  const leads = [
    {
      id: '1',
      name: 'Sarah Mitchell',
      company: 'Tech Solutions Inc',
      email: 'sarah@techsolutions.com',
      phone: '+1 (555) 123-4567',
      value: 12500,
      status: 'hot',
      source: 'AI Chat',
      lastContact: '2024-01-15',
      nextAction: 'Follow-up call scheduled'
    },
    {
      id: '2',
      name: 'James Wilson',
      company: 'Wilson & Co',
      email: 'james@wilsonco.com',
      phone: '+1 (555) 234-5678',
      value: 8200,
      status: 'warm',
      source: 'Phone Call',
      lastContact: '2024-01-14',
      nextAction: 'Send proposal'
    },
    {
      id: '3',
      name: 'Emily Chen',
      company: 'Chen Enterprises',
      email: 'emily@chenent.com',
      phone: '+1 (555) 345-6789',
      value: 15000,
      status: 'hot',
      source: 'Email',
      lastContact: '2024-01-15',
      nextAction: 'Demo scheduled for tomorrow'
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      hot: 'bg-red-100 text-red-700 border-red-200',
      warm: 'bg-amber-100 text-amber-700 border-amber-200',
      cold: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Leads</h1>
            <p className="text-sm text-neutral-600 mt-1">Manage and track your sales leads</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Leads</span>
              <Target className="h-4 w-4 text-neutral-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.total}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Hot Leads</span>
              <Target className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-3xl font-semibold text-red-600">{stats.hot}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Warm Leads</span>
              <Target className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-3xl font-semibold text-amber-600">{stats.warm}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Cold Leads</span>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-semibold text-blue-600">{stats.cold}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
        </div>

        {/* Leads Grid */}
        <div className="grid gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                    {lead.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{lead.name}</h3>
                    <p className="text-sm text-neutral-600">{lead.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(lead.status)}
                  <div className="text-right">
                    <div className="text-lg font-bold text-neutral-900">${lead.value.toLocaleString()}</div>
                    <div className="text-xs text-neutral-500">Est. value</div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Mail className="w-4 h-4" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Phone className="w-4 h-4" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Target className="w-4 h-4" />
                  <span>Source: {lead.source}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Calendar className="w-4 h-4" />
                  <span>Last: {lead.lastContact}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div className="text-sm text-neutral-700">
                  <span className="font-medium">Next:</span> {lead.nextAction}
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
