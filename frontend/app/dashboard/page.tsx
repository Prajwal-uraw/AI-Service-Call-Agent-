'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Phone, Calendar, TrendingUp, AlertCircle, Clock, Users, DollarSign, ArrowUpRight,
  Target, Mail, MessageSquare, Bot, CheckCircle, XCircle, PhoneIncoming, PhoneOutgoing, Database, Video
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createClient } from '@/lib/supabase/client';

// Force dynamic rendering to avoid build-time Supabase client creation
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [scrapedLeads, setScrapedLeads] = useState<any[]>([]);
  const supabase = createClient();

  // Call statistics data for charts
  const callVolumeData = [
    { day: 'Mon', calls: 45, answered: 42, missed: 3 },
    { day: 'Tue', calls: 52, answered: 48, missed: 4 },
    { day: 'Wed', calls: 38, answered: 36, missed: 2 },
    { day: 'Thu', calls: 61, answered: 58, missed: 3 },
    { day: 'Fri', calls: 55, answered: 51, missed: 4 },
    { day: 'Sat', calls: 28, answered: 25, missed: 3 },
    { day: 'Sun', calls: 18, answered: 16, missed: 2 },
  ];

  const hourlyCallData = [
    { hour: '9AM', calls: 12 },
    { hour: '10AM', calls: 18 },
    { hour: '11AM', calls: 24 },
    { hour: '12PM', calls: 15 },
    { hour: '1PM', calls: 20 },
    { hour: '2PM', calls: 28 },
    { hour: '3PM', calls: 22 },
    { hour: '4PM', calls: 19 },
    { hour: '5PM', calls: 14 },
  ];

  const outcomeData = [
    { name: 'Booked', value: 156, color: '#10b981' },
    { name: 'Follow-up', value: 42, color: '#f59e0b' },
    { name: 'Missed', value: 14, color: '#ef4444' },
    { name: 'Quote Sent', value: 28, color: '#3b82f6' },
  ];

  const revenueData = [
    { month: 'Jul', revenue: 18500 },
    { month: 'Aug', revenue: 22300 },
    { month: 'Sep', revenue: 19800 },
    { month: 'Oct', revenue: 24100 },
    { month: 'Nov', revenue: 26700 },
    { month: 'Dec', revenue: 24800 },
  ];

  const recentLeads = [
    { id: 1, name: 'Sarah Mitchell', company: 'Tech Solutions Inc', value: '$12,500', status: 'hot', source: 'AI Chat' },
    { id: 2, name: 'James Wilson', company: 'Wilson & Co', value: '$8,200', status: 'warm', source: 'Phone Call' },
    { id: 3, name: 'Emily Chen', company: 'Chen Enterprises', value: '$15,000', status: 'hot', source: 'Email' },
  ];

  const recentActivity = [
    { id: 1, type: 'call', user: 'AI Agent', action: 'Booked appointment with John Smith', time: '5 min ago' },
    { id: 2, type: 'email', user: 'Sarah J.', action: 'Sent quote to Mike Davis', time: '12 min ago' },
    { id: 3, type: 'message', user: 'Team', action: 'New lead assigned to you', time: '23 min ago' },
    { id: 4, type: 'call', user: 'AI Agent', action: 'Handled emergency call', time: '1 hour ago' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    fetchScrapedLeads();
    return () => clearTimeout(timer);
  }, []);

  const fetchScrapedLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) {
        setScrapedLeads(data);
      }
    } catch (error) {
      console.error('Error fetching scraped leads:', error);
    }
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
            <p className="text-sm text-neutral-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              New Lead
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total Calls</span>
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900 mb-1">297</div>
            <div className="flex items-center text-xs text-green-600 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>12% vs last week</span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Active Leads</span>
              <Target className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900 mb-1">42</div>
            <div className="flex items-center text-xs text-green-600 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>8 new today</span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Appointments</span>
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900 mb-1">24</div>
            <div className="flex items-center text-xs text-neutral-600 font-medium">
              <span>12 upcoming</span>
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Revenue</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900 mb-1">$24.8K</div>
            <div className="flex items-center text-xs text-green-600 font-medium">
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              <span>18% vs last month</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Volume Chart */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-neutral-900">Call Volume</h3>
              <p className="text-sm text-neutral-600">Last 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={callVolumeData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="day" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="calls" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Distribution */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-neutral-900">Hourly Distribution</h3>
              <p className="text-sm text-neutral-600">Today's call pattern</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyCallData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="hour" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip />
                <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Second Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Call Outcomes */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-neutral-900">Call Outcomes</h3>
              <p className="text-sm text-neutral-600">This month</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {outcomeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-neutral-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-neutral-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-neutral-900">Revenue Trend</h3>
              <p className="text-sm text-neutral-600">Last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="month" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip formatter={(value) => `$${typeof value === 'number' ? value.toLocaleString() : value}`} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CRM Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900">Recent Leads</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
            </div>
            <div className="p-6 space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">{lead.name}</div>
                      <div className="text-sm text-neutral-600">{lead.company}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-neutral-900">{lead.value}</div>
                    <div className={`text-xs font-medium ${lead.status === 'hot' ? 'text-red-600' : 'text-amber-600'}`}>
                      {lead.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-neutral-900">Recent Activity</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
            </div>
            <div className="p-6 space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'call' ? 'bg-blue-100' :
                    activity.type === 'email' ? 'bg-purple-100' : 'bg-green-100'
                  }`}>
                    {activity.type === 'call' && <Phone className="w-4 h-4 text-blue-600" />}
                    {activity.type === 'email' && <Mail className="w-4 h-4 text-purple-600" />}
                    {activity.type === 'message' && <MessageSquare className="w-4 h-4 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scraped Leads from Supabase */}
        {scrapedLeads.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold text-neutral-900">Scraped Leads</h3>
              </div>
              <a href="/admin/scraping" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</a>
            </div>
            <div className="p-6 space-y-4">
              {scrapedLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-neutral-900">{lead.business_name || 'Unknown Business'}</div>
                    <div className="text-sm text-neutral-600 mt-1">
                      {lead.phone && <span className="mr-3">📞 {lead.phone}</span>}
                      {lead.city && lead.state && <span>{lead.city}, {lead.state}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        lead.pain_score >= 70 ? 'bg-red-100 text-red-700' :
                        lead.pain_score >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        Score: {lead.pain_score || 0}
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open(`tel:${lead.phone}`, '_self')}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => window.open(`mailto:${lead.email}`, '_self')}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Email"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-neutral-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <Phone className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-neutral-900">Make Call</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <Mail className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-neutral-900">Send Email</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <Calendar className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-neutral-900">Schedule</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              <Bot className="w-6 h-6 text-amber-600" />
              <span className="text-sm font-medium text-neutral-900">AI Chat</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
