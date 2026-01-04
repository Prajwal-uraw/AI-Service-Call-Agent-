'use client';

import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, MessageCircle, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  // Mock data
  const volumeData = [
    { date: 'Jan 1', sms: 45 },
    { date: 'Jan 2', sms: 52 },
    { date: 'Jan 3', sms: 38 },
    { date: 'Jan 4', sms: 61 },
    { date: 'Jan 5', sms: 55 },
    { date: 'Jan 6', sms: 48 },
    { date: 'Jan 7', sms: 72 },
  ];

  const deliveryData = [
    { name: 'Delivered', value: 1247, color: '#10b981' },
    { name: 'Failed', value: 18, color: '#ef4444' },
    { name: 'Pending', value: 5, color: '#f59e0b' },
  ];

  const websiteData = [
    { name: 'Main Website', sms: 580 },
    { name: 'E-commerce Store', sms: 450 },
    { name: 'Blog', sms: 240 },
  ];

  const costData = [
    { date: 'Week 1', cost: 9.35 },
    { date: 'Week 2', cost: 11.20 },
    { date: 'Week 3', cost: 8.75 },
    { date: 'Week 4', cost: 10.50 },
  ];

  const stats = {
    totalSMS: 1270,
    deliveryRate: 98.2,
    avgCost: 0.0075,
    totalCost: 9.53,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track your SMS performance and costs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total SMS</p>
            <MessageCircle className="h-5 w-5 text-sky-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalSMS.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-2">↑ 12% from last period</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Delivery Rate</p>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.deliveryRate}%</p>
          <p className="text-sm text-green-600 mt-2">↑ 2.5% from last period</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Cost/SMS</p>
            <DollarSign className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.avgCost.toFixed(4)}</p>
          <p className="text-sm text-gray-500 mt-2">Consistent</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Cost</p>
            <DollarSign className="h-5 w-5 text-sky-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalCost.toFixed(2)}</p>
          <p className="text-sm text-green-600 mt-2">Within budget</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sms" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deliveryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {deliveryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Website Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS by Website</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={websiteData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sms" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
