"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  DollarSign
} from "lucide-react";

export default function DashboardPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{stats.company_name}</h1>
          <p className="text-gray-600">Welcome back! Here's your voice agent performance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Calls This Month */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Calls This Month
              </CardTitle>
              <Phone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.calls_this_month}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                of {stats.max_monthly_calls} limit
              </p>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {usagePercentage}% used
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Upcoming Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.upcoming_appointments}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total_appointments} total scheduled
              </p>
              <div className="mt-3 flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Usage Percentage */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Plan Usage
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {usagePercentage}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.plan_tier.charAt(0).toUpperCase() + stats.plan_tier.slice(1)} Plan
              </p>
              <div className="mt-3">
                {usagePercentage > 80 ? (
                  <p className="text-xs text-orange-600">
                    ⚠️ Consider upgrading soon
                  </p>
                ) : (
                  <p className="text-xs text-green-600">
                    ✓ Healthy usage level
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Health (SECRET TIP #3) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Account Health
              </CardTitle>
              <AlertCircle className={`h-4 w-4 ${stats.health_score >= 80 ? 'text-green-600' : 'text-yellow-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stats.health_score >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                {stats.health_score}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getHealthScoreLabel(stats.health_score)}
              </p>
              <div className="mt-3">
                <Badge className={getHealthScoreColor(stats.health_score)}>
                  {stats.health_score >= 80 ? '✓ Healthy' : '⚠️ Review Needed'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Based on usage, engagement & billing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Calls Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Calls</span>
              <Badge variant="outline">{recentCalls.length} calls today</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Service</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Outcome</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((call) => (
                    <tr key={call.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium">{call.customer_name}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {call.from}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{call.service_type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(call.duration)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getOutcomeBadge(call.outcome)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {formatDate(call.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                View All Calls →
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">View Call Logs</h3>
                  <p className="text-sm text-gray-600">See all call history</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Manage Appointments</h3>
                  <p className="text-sm text-gray-600">View & edit bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-gray-600">Detailed insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
