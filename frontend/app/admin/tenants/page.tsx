'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/AdminShell';
import QuickAddTenantModal from '@/components/admin/QuickAddTenantModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { parseError, logError } from '@/lib/errors';
import { Users, Building, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Tenant {
  id: string;
  slug: string;
  company_name: string;
  owner_email: string;
  plan_tier: string;
  subscription_status: string;
  is_active: boolean;
  twilio_phone_number?: string;
  total_calls: number;
  total_appointments: number;
  created_at: string;
}

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    mrr: 0
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/admin/tenants/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      const data = await response.json();
      setTenants(data);

      const active = data.filter((t: Tenant) => t.subscription_status === 'active').length;
      const trial = data.filter((t: Tenant) => t.subscription_status === 'trial').length;
      const mrr = data.reduce((sum: number, t: Tenant) => {
        const planPrices: { [key: string]: number } = {
          starter: 997,
          professional: 1497,
          premium: 2497,
          enterprise: 5000
        };
        return sum + (t.subscription_status === 'active' ? (planPrices[t.plan_tier] || 0) : 0);
      }, 0);

      setStats({
        total: data.length,
        active,
        trial,
        mrr
      });
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, 'TenantsPage.fetchTenants');
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantClick = (tenantId: string) => {
    router.push(`/admin/tenants/${tenantId}`);
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Tenants</h1>
            <p className="text-slate-400 mt-2">Manage all customer accounts</p>
          </div>
          <QuickAddTenantModal onSuccess={fetchTenants} />
        </div>

        {error && <ErrorMessage message={error} type="error" />}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Tenants</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{stats.total}</p>
              </div>
              <Building className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Trial</p>
                <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.trial}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg hover:bg-slate-800/60 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total MRR</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">${(stats.mrr / 1000).toFixed(1)}K</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Total Calls
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {tenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No tenants found. Click "Add New Tenant" to get started.
                    </td>
                  </tr>
                ) : (
                  tenants.map((tenant) => (
                    <tr 
                      key={tenant.id} 
                      className="hover:bg-slate-900/30 transition-colors cursor-pointer"
                      onClick={() => handleTenantClick(tenant.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building className="w-5 h-5 text-slate-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-slate-100">{tenant.company_name}</div>
                            <div className="text-xs text-slate-500">{tenant.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {tenant.total_calls}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 capitalize">
                        {tenant.plan_tier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          tenant.subscription_status === 'active' 
                            ? 'bg-green-600/20 text-green-400' 
                            : tenant.subscription_status === 'trial'
                            ? 'bg-yellow-600/20 text-yellow-400'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {tenant.subscription_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {tenant.twilio_phone_number || 'Not provisioned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTenantClick(tenant.id);
                          }}
                          className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
