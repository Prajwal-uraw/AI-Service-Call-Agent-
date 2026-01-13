'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import AddContactModal from '@/components/AddContactModal';
import { Search, Phone, Mail, MapPin, Calendar, Tag, Plus, Download, Filter } from 'lucide-react';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  address?: string;
  email_subscribed?: boolean;
  created_at: string;
  updated_at: string;
  tags?: string[];
  last_contact?: string;
  service_count?: number;
  lifetime_value?: string;
  name?: string; // For backward compatibility
}

const API_BASE_URL = 'http://localhost:8000/api/crm/contacts'; // Updated to match the backend route

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const router = useRouter();

  // Safe version of contacts that's always an array
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  // Fetch contacts with proper error handling
  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${API_BASE_URL}?search=${encodeURIComponent(searchQuery)}`;
      console.log('Fetching contacts from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch contacts: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      // The contacts are in the 'contacts' property of the response
      const contactsData = Array.isArray(responseData.contacts) ? responseData.contacts : [];
      console.log('Extracted contacts:', contactsData);
      setContacts(contactsData);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please try again later.');
      setContacts([]); // Ensure contacts is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [searchQuery]);

  const handleExport = () => {
    try {
      if (!safeContacts || safeContacts.length === 0) {
        console.error('No contacts to export');
        return;
      }

      // Convert contacts to CSV
      const headers = Object.keys(safeContacts[0]).join(',');
      const csvRows = safeContacts.map(contact => 
        Object.values(contact).map(field => {
          // Handle null/undefined values
          if (field === null || field === undefined) return '';
          // Convert to string and escape quotes
          const str = String(field);
          return `"${str.replace(/"/g, '""')}"`;
        }).join(',')
      );
      
      const csvContent = [headers, ...csvRows].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting contacts:', error);
    }
  };

  const openAddContactModal = () => {
    setShowAddContactModal(true);
  };

  const handleAddContact = async (newContact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Format the contact data to match the backend's ContactCreate model
      const contactData = {
        first_name: newContact.first_name || '',
        last_name: newContact.last_name || '',
        email: newContact.email,
        phone: newContact.phone || '',
        company_name: newContact.company_name || '',
        address: newContact.address || '',
        email_subscribed: newContact.email_subscribed !== false, // Default to true if not provided
        tags: newContact.tags || [],
      };

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to add contact');
      }

      if (response.ok) {
        const savedContact = await response.json();
        setContacts(prevContacts => [savedContact, ...prevContacts]);
        setShowAddContactModal(false);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  // Safe stats calculation with null checks
  const stats = {
    total_contacts: safeContacts.length,
    active: safeContacts.length,
    new_this_month: safeContacts.filter(c => 
      c?.created_at?.startsWith?.(new Date().toISOString().split('T')[0].substring(0, 7))
    ).length,
    high_value: safeContacts.filter(c => 
      c?.company_name ? c.company_name.length > 0 : false
    ).length
  };

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading contacts...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }


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
            <button 
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={openAddContactModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
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
                    <h3 className="text-lg font-semibold text-neutral-900">
                      {contact.first_name} {contact.last_name}
                    </h3>
                    <div className="flex gap-2">
                      {contact.tags?.map((tag, index) => (
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
      <AddContactModal
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        onAddContact={handleAddContact}
      />
    </AdminLayout>
  );
}
