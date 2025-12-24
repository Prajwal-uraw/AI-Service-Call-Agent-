"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Phone, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  PhoneOff,
  Clock,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_calls: 342,
    calls_this_month: 87,
    max_monthly_calls: 1500,
    upcoming_appointments: 12,
    total_appointments: 156,
    health_score: 85,
    plan_tier: "professional",
    company_name: "Acme HVAC Services"
  });

  const [recentCalls, setRecentCalls] = useState([
    {
      id: "1",
      from: "+1-555-123-4567",
      customer_name: "John Smith",
      duration: 245,
      outcome: "appointment_scheduled",
      created_at: "2025-12-21T10:30:00Z",
      service_type: "AC Repair"
    },
    {
      id: "2",
      from: "+1-555-987-6543",
      customer_name: "Sarah Johnson",
      duration: 180,
      outcome: "transferred",
      created_at: "2025-12-21T09:15:00Z",
      service_type: "Emergency - No Heat"
    },
    {
      id: "3",
      from: "+1-555-456-7890",
      customer_name: "Mike Davis",
      duration: 320,
      outcome: "appointment_scheduled",
      created_at: "2025-12-20T14:45:00Z",
      service_type: "Maintenance"
    },
    {
      id: "4",
      from: "+1-555-321-0987",
      customer_name: "Emily Brown",
      duration: 95,
      outcome: "voicemail",
      created_at: "2025-12-20T11:20:00Z",
      service_type: "Quote Request"
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const usagePercentage = Math.round((stats.calls_this_month / stats.max_monthly_calls) * 100);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Attention";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOutcomeBadge = (outcome: string) => {
    const badges = {
      appointment_scheduled: { label: "Appointment", color: "bg-green-100 text-green-800" },
      transferred: { label: "Transferred", color: "bg-blue-100 text-blue-800" },
      voicemail: { label: "Voicemail", color: "bg-gray-100 text-gray-800" },
      hung_up: { label: "Hung Up", color: "bg-red-100 text-red-800" }
    };
    
    const badge = badges[outcome as keyof typeof badges] || { label: outcome, color: "bg-gray-100 text-gray-800" };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-neutral-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900 mb-1">{stats.company_name}</h1>
          <p className="text-sm text-neutral-500">Voice operations overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Calls This Month */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Calls</span>
              <div className="p-1.5 bg-blue-50 rounded">
                <Phone className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-neutral-900">
                {stats.calls_this_month}
              </div>
              <p className="text-xs text-neutral-500">
                of {stats.max_monthly_calls} limit
              </p>
            </div>
            <div className="mt-4">
              <div className="bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${usagePercentage > 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">
                {usagePercentage}% capacity
              </p>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Appointments</span>
              <div className="p-1.5 bg-green-50 rounded">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-neutral-900">
                {stats.upcoming_appointments}
              </div>
              <p className="text-xs text-neutral-500">
                {stats.total_appointments} total this month
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>12% vs last month</span>
            </div>
          </div>

          {/* Revenue Impact */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Revenue</span>
              <div className="p-1.5 bg-emerald-50 rounded">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-neutral-900">
                $24.8K
              </div>
              <p className="text-xs text-neutral-500">
                Estimated this month
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>18% vs last month</span>
            </div>
          </div>

          {/* Account Health */}
          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Health</span>
              <div className={`p-1.5 rounded ${stats.health_score >= 80 ? 'bg-green-50' : 'bg-amber-50'}`}>
                <AlertCircle className={`h-4 w-4 ${stats.health_score >= 80 ? 'text-green-600' : 'text-amber-600'}`} />
              </div>
            </div>
            <div className="space-y-1">
              <div className={`text-3xl font-semibold ${stats.health_score >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                {stats.health_score}
              </div>
              <p className="text-xs text-neutral-500">
                {getHealthScoreLabel(stats.health_score)}
              </p>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${stats.health_score >= 80 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                {stats.health_score >= 80 ? 'Healthy' : 'Review Needed'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Calls Table */}
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">Recent Calls</h2>
              <span className="text-xs text-neutral-500">{recentCalls.length} today</span>
            </div>
          </div>
          <div className="p-6">
            {recentCalls.length === 0 ? (
              <div className="text-center py-12">
                <PhoneOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No calls yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Your AI voice agent is ready to handle incoming calls. Configure your phone number to get started.
                </p>
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Configure Phone Number
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Customer</th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Phone</th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Service</th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Duration</th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Outcome</th>
                        <th className="text-left py-3 px-6 text-xs font-medium text-neutral-500 uppercase tracking-wide">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentCalls.map((call, index) => (
                        <tr key={call.id} className={`${index !== recentCalls.length - 1 ? 'border-b border-neutral-100' : ''} hover:bg-neutral-50 transition-colors cursor-pointer`}>
                          <td className="py-3.5 px-6">
                            <div className="text-sm font-medium text-neutral-900">{call.customer_name}</div>
                          </td>
                          <td className="py-3.5 px-6 text-sm text-neutral-600">
                            {call.from}
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="text-sm text-neutral-700">{call.service_type}</span>
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="flex items-center text-sm text-neutral-600">
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                              {formatDuration(call.duration)}
                            </div>
                          </td>
                          <td className="py-3.5 px-6">
                            {getOutcomeBadge(call.outcome)}
                          </td>
                          <td className="py-3.5 px-6 text-sm text-neutral-500">
                            {formatDate(call.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 pt-4 border-t border-neutral-200 text-center">
                  <button className="text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors inline-flex items-center">
                    View all calls
                    <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
