'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, TrendingUp, Loader } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  notes?: string;
}

interface LeadsPreviewProps {
  onSelectLead: (lead: Lead) => void;
  selectedLeadId?: string;
}

export default function LeadsPreview({ onSelectLead, selectedLeadId }: LeadsPreviewProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLeads();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLeads, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/scraped-leads?limit=50&status=new');
      const data = await response.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-neutral-900">Live Leads Feed</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
            {leads.length} new
          </span>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            autoRefresh
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {autoRefresh ? '🟢 Auto' : '⚪ Manual'}
        </button>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {leads.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No new leads yet</p>
            <p className="text-xs mt-1">Leads from scraping will appear here</p>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedLeadId === lead.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-neutral-200 bg-white hover:border-blue-300'
              }`}
            >
              {/* Priority Badge */}
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-neutral-900 text-sm">{lead.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(lead.priority)}`}>
                  {lead.priority}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <Phone className="w-3 h-3" />
                  <span className="font-mono">{lead.phone}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.location && (
                  <div className="flex items-center gap-2 text-xs text-neutral-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{lead.location}</span>
                  </div>
                )}
              </div>

              {/* Source & Time */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">
                  Source: <span className="font-medium text-neutral-700">{lead.source}</span>
                </span>
                <div className="flex items-center gap-1 text-neutral-500">
                  <Clock className="w-3 h-3" />
                  {formatTime(lead.created_at)}
                </div>
              </div>

              {/* Notes Preview */}
              {lead.notes && (
                <p className="text-xs text-neutral-600 mt-2 line-clamp-2 italic">
                  "{lead.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-3 border-t border-neutral-200 text-xs text-neutral-600">
        <div className="flex justify-between">
          <span>High Priority: {leads.filter(l => l.priority === 'high').length}</span>
          <span>Medium: {leads.filter(l => l.priority === 'medium').length}</span>
          <span>Low: {leads.filter(l => l.priority === 'low').length}</span>
        </div>
      </div>
    </div>
  );
}
