'use client';

import { useState, useEffect } from 'react';
import { 
  Database, 
  Filter, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Download,
  ExternalLink
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  location: string;
  source: string;
  priority: string;
  created_at: string;
  notes: string;
  url?: string;
  pain_score?: number;
}

export default function ScrapedLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, [filter, sourceFilter]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      
      if (filter !== 'all') params.append('priority', filter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      
      const response = await fetch(`${apiUrl}/api/scraped-leads?${params.toString()}`);
      const data = await response.json();
      
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.location?.toLowerCase().includes(query) ||
      lead.source?.toLowerCase().includes(query) ||
      lead.notes?.toLowerCase().includes(query)
    );
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('Job Board')) return '💼';
    if (source.includes('BBB')) return '⭐';
    if (source.includes('Licensing')) return '📜';
    if (source.includes('Local Business')) return '🏪';
    return '📡';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                Scraped Leads
              </h1>
              <p className="mt-2 text-gray-600">
                Real-time leads from job boards, BBB, licensing databases, and local businesses
              </p>
            </div>
            <button
              onClick={fetchLeads}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
            <div className="text-sm text-gray-600">Total Leads</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {leads.filter(l => l.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {leads.filter(l => l.priority === 'medium').length}
            </div>
            <div className="text-sm text-gray-600">Medium Priority</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {leads.filter(l => l.priority === 'low').length}
            </div>
            <div className="text-sm text-gray-600">Low Priority</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Priority Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="job_board">Job Boards</option>
              <option value="bbb">BBB</option>
              <option value="licensing">Licensing</option>
              <option value="local_business">Local Business</option>
              <option value="signals">Signals</option>
            </select>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600 mb-4">
                {leads.length === 0 
                  ? 'Run scrapers to populate the database with leads'
                  : 'Try adjusting your filters or search query'
                }
              </p>
              {leads.length === 0 && (
                <a
                  href="/scrapers"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Go to Scrapers
                </a>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getSourceIcon(lead.source)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {lead.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lead.location}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>{lead.source}</span>
                          </div>
                        </div>
                      </div>

                      {lead.notes && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {lead.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3">
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </a>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </a>
                        )}
                        {lead.url && (
                          <a
                            href={lead.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Source
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(lead.priority)}`}>
                        {lead.priority.toUpperCase()}
                      </span>
                      {lead.pain_score !== undefined && (
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {lead.pain_score}
                          </span>
                          <span className="text-gray-500">score</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Button */}
        {filteredLeads.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                const csv = [
                  ['Name', 'Phone', 'Email', 'Location', 'Source', 'Priority', 'Score', 'Notes'],
                  ...filteredLeads.map(l => [
                    l.name,
                    l.phone || '',
                    l.email || '',
                    l.location,
                    l.source,
                    l.priority,
                    l.pain_score?.toString() || '',
                    l.notes
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scraped-leads-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export to CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
