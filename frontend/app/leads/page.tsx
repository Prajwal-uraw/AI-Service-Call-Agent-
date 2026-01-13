'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Target, Phone, Mail, Calendar, DollarSign, Filter, Search, Plus, Database, ExternalLink, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type LeadFormData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'hot' | 'warm' | 'cold';
  value: number;
  source: string;
  notes: string;
};

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState<LeadFormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'warm',
    value: 0,
    source: 'Manual',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0
  });
  const [contactLead, setContactLead] = useState<any>(null);
  const [detailLead, setDetailLead] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const supabase = createClient();
      
      // Fetch all data in parallel
      const [
        { data: signals = [], error: signalsError },
        { data: jobSignals = [], error: jobSignalsError },
        { data: bbbSignals = [], error: bbbSignalsError },
        { data: localSignals = [], error: localSignalsError },
        { data: manualLeads = [], error: manualLeadsError }
      ] = await Promise.all([
        supabase.from('signals').select('*').order('created_at', { ascending: false }),
        supabase.from('job_board_signals').select('*').order('created_at', { ascending: false }),
        supabase.from('bbb_signals').select('*').order('created_at', { ascending: false }),
        supabase.from('local_business_signals').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false })
      ]);

      // Log any fetch errors (but don't fail the whole operation)
      [signalsError, jobSignalsError, bbbSignalsError, localSignalsError, manualLeadsError]
        .filter(Boolean)
        .forEach((error, index) => {
          console.error(`Error fetching lead source ${index}:`, error);
        });

      // Helper function to safely parse dates
      const safeDate = (dateString: string) => {
        try {
          return new Date(dateString).toLocaleDateString();
        } catch {
          return new Date().toLocaleDateString();
        }
      };

      // Transform and combine all leads
      const allLeads = [
        ...(signals || []).map(s => ({
          id: `signal_${s.id}`,
          name: s.business_name || 'Unknown',
          company: s.business_name || 'Unknown',
          email: s.email || '',
          phone: s.phone || '',
          value: Number(s.pain_score || 0) * 100,
          status: (s.pain_score || 0) >= 70 ? 'hot' : (s.pain_score || 0) >= 50 ? 'warm' : 'cold',
          source: 'Signals',
          lastContact: safeDate(s.created_at),
          nextAction: 'New lead - needs follow-up'
        })),
        ...(jobSignals || []).map(s => ({
          id: `job_${s.id}`,
          name: s.company_name || 'Unknown',
          company: s.company_name || 'Unknown',
          email: s.contact_email || '',
          phone: s.contact_phone || '',
          value: Number(s.score || 0) * 100,
          status: (s.score || 0) >= 70 ? 'hot' : (s.score || 0) >= 50 ? 'warm' : 'cold',
          source: 'Job Board',
          lastContact: safeDate(s.created_at),
          nextAction: 'Job posting detected'
        })),
        ...(bbbSignals || []).map(s => ({
          id: `bbb_${s.id}`,
          name: s.business_name || 'Unknown',
          company: s.business_name || 'Unknown',
          email: '',
          phone: s.phone || '',
          value: 100 - (Number(s.complaints_count) || 0) * 10,
          status: (s.complaints_count || 0) > 20 ? 'hot' : (s.complaints_count || 0) > 10 ? 'warm' : 'cold',
          source: 'BBB',
          lastContact: safeDate(s.created_at),
          nextAction: 'BBB complaints detected'
        })),
        ...(localSignals || []).map(s => ({
          id: `local_${s.id}`,
          name: s.business_name || 'Unknown',
          company: s.business_name || 'Unknown',
          email: s.email || '',
          phone: s.phone || '',
          value: (Number(s.google_rating) || 0) * 2000,
          status: (s.google_rating || 0) < 3 ? 'hot' : (s.google_rating || 0) < 4 ? 'warm' : 'cold',
          source: 'Local Business',
          lastContact: safeDate(s.created_at),
          nextAction: 'Low rating - opportunity'
        })),
        // Add manually created leads
        ...(manualLeads || []).map(lead => ({
          id: `manual_${lead.id}`,
          name: lead.contact_name || 'Unknown',
          company: lead.business_name || 'Unknown',
          email: lead.email || '',
          phone: lead.phone || '',
          value: Number(lead.conversion_value) || 0,
          status: lead.tier || 'warm',
          source: lead.source || 'Manual',
          lastContact: safeDate(lead.created_at),
          nextAction: lead.notes ? `Note: ${String(lead.notes).substring(0, 50)}` : 'Manual lead - follow up'
        }))
      ];

      setLeads(allLeads);
      
      // Calculate stats
      const hot = allLeads.filter(l => l.status === 'hot').length;
      const warm = allLeads.filter(l => l.status === 'warm').length;
      const cold = allLeads.filter(l => l.status === 'cold').length;
      
      setStats({
        total: allLeads.length,
        hot,
        warm,
        cold
      });
    } catch (error) {
      console.error('Error in fetchLeads:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          contact_name: newLead.name,
          business_name: newLead.company,
          email: newLead.email,
          phone: newLead.phone,
          tier: newLead.status,
          conversion_value: newLead.value,
          source: newLead.source,
          notes: newLead.notes
        }])
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      // Refresh leads list
      await fetchLeads();
      setShowAddModal(false);
      setNewLead({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'warm',
        value: 0,
        source: 'Manual',
        notes: ''
      });
    } catch (error: any) {
      console.error('Error adding lead:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      alert(`Failed to add lead: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLead(prev => ({
      ...prev,
      [name]: name === 'value' ? Number(value) : value
    }));
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Leads</h1>
            <p className="text-sm text-neutral-600 mt-1">Manage and track your sales leads from scraped data</p>
          </div>
          <div className="flex gap-3">
            <a
              href="/admin/scraped-leads"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <Database className="w-4 h-4" />
              View All Scraped Data
            </a>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading leads from database...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 bg-white border border-neutral-200 rounded-lg">
              <Database className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No leads found</h3>
              <p className="text-neutral-600 mb-4">Run scrapers to populate the database with leads</p>
              <a
                href="/scrapers"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Database className="w-4 h-4" />
                Go to Scrapers
              </a>
            </div>
          ) : leads.map((lead) => (
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
                  <button 
                    onClick={() => setDetailLead(lead)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => {
                      setContactLead(lead);
                      // Add a small delay to ensure state updates before showing modal
                      setTimeout(() => setShowContactModal(true), 0);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {detailLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">{detailLead.name}</h2>
                  <p className="text-neutral-600">{detailLead.company}</p>
                </div>
                <button 
                  onClick={() => setDetailLead(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500">Email</p>
                      <p className="text-neutral-900">{detailLead.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Phone</p>
                      <p className="text-neutral-900">{detailLead.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Source</p>
                      <p className="text-neutral-900">{detailLead.source || 'Manual'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-4">Lead Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-neutral-500">Status</p>
                      <div className="mt-1">{getStatusBadge(detailLead.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Estimated Value</p>
                      <p className="text-neutral-900">${detailLead.value?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Last Contact</p>
                      <p className="text-neutral-900">{detailLead.lastContact || 'No contact yet'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {detailLead.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-line text-neutral-800">{detailLead.notes}</p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setDetailLead(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setContactLead(detailLead);
                    setDetailLead(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Contact Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Contact {contactLead.name}</h2>
                <button 
                  onClick={() => {
                    setContactLead(null);
                    setShowContactModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Contact Information</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a href={`mailto:${contactLead.email}`} className="text-blue-600 hover:underline">
                      {contactLead.email || 'No email'}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href={`tel:${contactLead.phone}`} className="text-blue-600 hover:underline">
                      {contactLead.phone || 'No phone'}
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium mb-2">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {contactLead.email ? (
                      <a
                        href={`mailto:${contactLead.email}`}
                        className="px-3 py-2 text-sm text-center bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      >
                        Send Email
                      </a>
                    ) : (
                      <span className="px-3 py-2 text-sm text-center bg-gray-100 text-gray-400 rounded cursor-not-allowed">
                        No Email
                      </span>
                    )}
                    {contactLead.phone ? (
                      <a
                        href={`tel:${contactLead.phone}`}
                        className="px-3 py-2 text-sm text-center bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors"
                      >
                        Call Now
                      </a>
                    ) : (
                      <span className="px-3 py-2 text-sm text-center bg-gray-100 text-gray-400 rounded cursor-not-allowed">
                        No Phone
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Lead</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddLead} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newLead.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={newLead.company}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newLead.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newLead.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={newLead.status}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="hot">Hot</option>
                      <option value="warm">Warm</option>
                      <option value="cold">Cold</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                    <input
                      type="number"
                      name="value"
                      value={newLead.value}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input
                    type="text"
                    name="source"
                    value={newLead.source}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={newLead.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </>
                    ) : 'Add Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
