'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Search, Phone, Mail, MapPin, Calendar, Tag, Plus, Download, Filter } from 'lucide-react';

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('all');

  // Demo data
  const stats = {
    total_contacts: 342,
    active: 298,
    new_this_month: 24,
    high_value: 56
  };

  const contacts = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Phoenix, AZ 85001',
      tags: ['VIP', 'Commercial'],
      last_contact: '2024-01-15',
      service_count: 12,
      lifetime_value: '$24,500'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, Phoenix, AZ 85002',
      tags: ['Residential'],
      last_contact: '2024-01-14',
      service_count: 5,
      lifetime_value: '$8,200'
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Rd, Phoenix, AZ 85003',
      tags: ['Emergency', 'Residential'],
      last_contact: '2024-01-15',
      service_count: 3,
      lifetime_value: '$4,100'
    },
    {
      id: '4',
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '+1 (555) 456-7890',
      address: '321 Elm St, Phoenix, AZ 85004',
      tags: ['Commercial', 'VIP'],
      last_contact: '2024-01-10',
      service_count: 18,
      lifetime_value: '$42,300'
    },
    {
      id: '5',
      name: 'Robert Wilson',
      email: 'r.wilson@email.com',
      phone: '+1 (555) 567-8901',
      address: '654 Maple Dr, Phoenix, AZ 85005',
      tags: ['Residential'],
      last_contact: '2024-01-12',
      service_count: 7,
      lifetime_value: '$12,600'
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Contacts</h1>
            <p className="text-sm text-neutral-600 mt-1">Manage customer contacts and relationships</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Contacts</span>
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.total_contacts}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Active</span>
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.active}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">New This Month</span>
              <Plus className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.new_this_month}</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">High Value</span>
              <Tag className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">{stats.high_value}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white border border-neutral-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Tag Filter */}
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
              aria-label="Filter by tag"
            >
              <option value="all">All Tags</option>
              <option value="vip">VIP</option>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-900">{contact.name}</h3>
                    <div className="flex gap-2">
                      {contact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            tag === 'VIP'
                              ? 'bg-amber-100 text-amber-700'
                              : tag === 'Commercial'
                              ? 'bg-blue-100 text-blue-700'
                              : tag === 'Emergency'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{contact.address}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors">
                    Edit
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    Call
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Last Contact</div>
                  <div className="font-medium text-neutral-900">{contact.last_contact}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Services</div>
                  <div className="font-medium text-neutral-900">{contact.service_count}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Lifetime Value</div>
                  <div className="font-medium text-green-600">{contact.lifetime_value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="bg-white border border-neutral-200 rounded-lg px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing <span className="font-medium">1-5</span> of <span className="font-medium">342</span> contacts
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm font-medium bg-neutral-900 text-white rounded">
              1
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors">
              3
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
