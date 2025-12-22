'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, TrendingUp, Mail, FileText, DollarSign, Calendar } from 'lucide-react';

interface DashboardStats {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  qualified_leads: number;
  total_potential_revenue: number;
  avg_monthly_loss: number;
  conversion_rate: number;
  email_open_rate: number;
  pdf_download_rate: number;
  leads_last_7_days: number;
  leads_last_30_days: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/admin/dashboard/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kestrel Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Calculator Lead Management</p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Leads */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats?.total_leads || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Calculator Submissions</p>
          </div>

          {/* Hot Leads */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="text-red-600" size={24} />
              </div>
              <span className="text-sm text-gray-500">Priority</span>
            </div>
            <div className="text-3xl font-bold text-red-600">{stats?.hot_leads || 0}</div>
            <p className="text-sm text-gray-600 mt-1">Hot Leads</p>
          </div>

          {/* Revenue Potential */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <span className="text-sm text-gray-500">Annual</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${((stats?.total_potential_revenue || 0) / 1000000).toFixed(1)}M
            </div>
            <p className="text-sm text-gray-600 mt-1">Revenue Potential</p>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <span className="text-sm text-gray-500">Last 7 Days</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats?.leads_last_7_days || 0}</div>
            <p className="text-sm text-gray-600 mt-1">New Submissions</p>
          </div>

        </div>

        {/* Lead Tier Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lead Quality Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">{stats?.hot_leads || 0}</div>
              <div className="text-sm font-medium text-gray-700">Hot Leads</div>
              <div className="text-xs text-gray-500 mt-1">&gt;$50k/month loss</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-4xl font-bold text-orange-600 mb-2">{stats?.warm_leads || 0}</div>
              <div className="text-sm font-medium text-gray-700">Warm Leads</div>
              <div className="text-xs text-gray-500 mt-1">$20k-$50k/month loss</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats?.qualified_leads || 0}</div>
              <div className="text-sm font-medium text-gray-700">Qualified Leads</div>
              <div className="text-xs text-gray-500 mt-1">&lt;$20k/month loss</div>
            </div>

          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">Email Open Rate</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats?.email_open_rate.toFixed(1) || 0}%</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${stats?.email_open_rate || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-green-600" size={20} />
              <h3 className="font-semibold text-gray-900">PDF Download Rate</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats?.pdf_download_rate.toFixed(1) || 0}%</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats?.pdf_download_rate || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-purple-600" size={20} />
              <h3 className="font-semibold text-gray-900">Conversion Rate</h3>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats?.conversion_rate.toFixed(1) || 0}%</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${stats?.conversion_rate || 0}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link
            href="/admin/leads"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <Users className="mx-auto mb-3 text-blue-600" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">View All Leads</h3>
            <p className="text-sm text-gray-600">Browse and filter submissions</p>
          </Link>

          <Link
            href="/admin/leads?tier=Hot"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <TrendingUp className="mx-auto mb-3 text-red-600" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">Hot Leads Only</h3>
            <p className="text-sm text-gray-600">High-value opportunities</p>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <TrendingUp className="mx-auto mb-3 text-green-600" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">Charts and insights</p>
          </Link>

          <button
            onClick={() => {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
              window.open(`${apiUrl}/api/admin/export/csv`, '_blank');
            }}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-center"
          >
            <FileText className="mx-auto mb-3 text-purple-600" size={32} />
            <h3 className="font-semibold text-gray-900 mb-1">Export CSV</h3>
            <p className="text-sm text-gray-600">Download all leads</p>
          </button>

        </div>

      </div>
    </div>
  );
}
