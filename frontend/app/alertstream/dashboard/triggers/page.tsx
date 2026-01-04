'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import TriggerCard from '@/components/alertstream/TriggerCard';
import type { Trigger } from '@/lib/alertstream/types';

export default function TriggersPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWebsite, setFilterWebsite] = useState('all');

  // Mock data - will be replaced with real API calls
  const [triggers, setTriggers] = useState<Trigger[]>([
    {
      id: '1',
      website_id: '1',
      name: 'New Form Submission',
      event_type: 'form_submit',
      conditions: [
        { field: 'form_id', operator: 'equals', value: 'contact-form' }
      ],
      sms_template: 'New form submission from {{name}}! Email: {{email}}, Message: {{message}}',
      phone_number: '+15551234567',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      website_id: '2',
      name: 'New Order Alert',
      event_type: 'order_created',
      conditions: [],
      sms_template: '🎉 New order #{{order_id}} for ${{amount}} from {{customer_name}}',
      phone_number: '+15551234567',
      is_active: true,
      created_at: '2025-01-05T00:00:00Z',
      updated_at: '2025-01-05T00:00:00Z',
    },
    {
      id: '3',
      website_id: '1',
      name: 'High Value Lead',
      event_type: 'form_submit',
      conditions: [
        { field: 'budget', operator: 'greater_than', value: '10000' }
      ],
      sms_template: '💰 High value lead! {{name}} ({{email}}) - Budget: ${{budget}}',
      phone_number: '+15551234567',
      is_active: true,
      created_at: '2025-01-10T00:00:00Z',
      updated_at: '2025-01-10T00:00:00Z',
    },
    {
      id: '4',
      website_id: '3',
      name: 'Blog Comment',
      event_type: 'comment_posted',
      conditions: [],
      sms_template: 'New comment on {{post_title}} by {{author_name}}',
      phone_number: '+15551234567',
      is_active: false,
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this trigger?')) {
      setTriggers(triggers.filter(t => t.id !== id));
    }
  };

  const handleToggle = (id: string) => {
    setTriggers(triggers.map(t => 
      t.id === id ? { ...t, is_active: !t.is_active } : t
    ));
  };

  const handleTest = (id: string) => {
    alert(`Testing trigger ${id}... Check your phone for a test SMS!`);
  };

  const filteredTriggers = triggers.filter(trigger => {
    const matchesSearch = trigger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trigger.event_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWebsite = filterWebsite === 'all' || trigger.website_id === filterWebsite;
    return matchesSearch && matchesWebsite;
  });

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Triggers</h1>
          <p className="text-gray-600">Create automated SMS alerts for website events</p>
        </div>
        <Link
          href="/alertstream/dashboard/triggers/new"
          className="flex items-center space-x-2 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Trigger</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search triggers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Triggers</p>
          <p className="text-2xl font-bold text-gray-900">{triggers.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {triggers.filter(t => t.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">
            {triggers.filter(t => !t.is_active).length}
          </p>
        </div>
      </div>

      {/* Triggers Grid */}
      {filteredTriggers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No triggers found</p>
          <Link
            href="/alertstream/dashboard/triggers/new"
            className="text-sky-500 hover:text-sky-600 font-medium"
          >
            Create your first trigger
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredTriggers.map((trigger) => {
            const website = websites.find(w => w.id === trigger.website_id);
            return (
              <TriggerCard
                key={trigger.id}
                trigger={trigger}
                websiteName={website?.name}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onTest={handleTest}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
