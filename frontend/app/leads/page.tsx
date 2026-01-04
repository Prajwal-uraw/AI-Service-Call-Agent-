'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Target, Phone, Mail, Calendar, DollarSign, Filter, Search, Plus, Database, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const supabase = createClient();
      
      // Fetch all scraped leads from different sources
      const { data: signals } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: jobSignals } = await supabase
        .from('job_board_signals')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: bbbSignals } = await supabase
        .from('bbb_signals')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: localSignals } = await supabase
        .from('local_business_signals')
        .select('*')
        .order('created_at', { ascending: false });

      // Transform and combine all leads
      const allLeads = [
        ...(signals || []).map(s => ({
          id: s.id,
          name: s.business_name || 'Unknown',
          company: s.business_name || 'Unknown',
          email: s.email || '',
          phone: s.phone || '',
          value: (s.pain_score || 0) * 100,
          status: s.pain_score >= 70 ? 'hot' : s.pain_score >= 50 ? 'warm' : 'cold',
          source: 'Signals',
          lastContact: new Date(s.created_at).toLocaleDateString(),
          nextAction: 'New lead - needs follow-up'
        })),
        ...(jobSignals || []).map(s => ({
          id: s.id,
          name: s.company_name || 'Unknown',
          company: s.company_name || 'Unknown',
          email: s.contact_email || '',
          phone: s.contact_phone || '',
          value: (s.score || 0) * 100,
          status: s.score >= 70 ? 'hot' : s.score >= 50 ? 'warm' : 'cold',
          source: 'Job Board',
          lastContact: new Date(s.created_at).toLocaleDateString(),
          nextAction: 'Job posting detected'
        })),
        ...(bbbSignals || []).map(s => ({
          id: s.id,
          name: s.business_name || 'Unknown',
          company: s.business_name || 'Unknown',
          email: '',
          phone: s.phone || '',
          value: (100 - (s.complaints_count || 0) * 10),
          status: s.complaints_count > 20 ? 'hot' : s.complaints_count > 10 ? 'warm' : 'cold',
          source: 'BBB',
          lastContact: new Date(s.created_at).toLocaleDateString(),
          nextAction: 'BBB complaints detected'
        })),
        ...(localSignals || []).map(s => ({
          id: s.id,
          name: s.business_name || 'Unknown',
          company: s.business_name || 'Unknown',
          email: s.email || '',
          phone: s.phone || '',
          value: (s.google_rating || 0) * 2000,
          status: s.google_rating < 3 ? 'hot' : s.google_rating < 4 ? 'warm' : 'cold',
          source: 'Local Business',
          lastContact: new Date(s.created_at).toLocaleDateString(),
          nextAction: 'Low rating - opportunity'
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
      console.error('Error fetching leads:', error);
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
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
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
