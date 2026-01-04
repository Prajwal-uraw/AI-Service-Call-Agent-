'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, AlertCircle } from 'lucide-react';
import DashboardStats from '@/components/alertstream/DashboardStats';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Mock data - will be replaced with real API calls
  const stats = {
    websites: 3,
    triggers: 12,
    smsSent: 1247,
    deliveryRate: 98.5,
  };

  const recentAlerts = [
    {
      id: '1',
      website: 'example.com',
      trigger: 'Form Submission',
      phone: '+1 (555) 123-4567',
      status: 'delivered',
      time: '2 minutes ago',
    },
    {
      id: '2',
      website: 'shop.example.com',
      trigger: 'New Order',
      phone: '+1 (555) 987-6543',
      status: 'delivered',
      time: '15 minutes ago',
    },
    {
      id: '3',
      website: 'example.com',
      trigger: 'Contact Form',
      phone: '+1 (555) 123-4567',
      status: 'delivered',
      time: '1 hour ago',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your alerts.</p>
      </div>

      {/* Stats */}
      <DashboardStats {...stats} />

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/alertstream/dashboard/websites/new"
              className="flex items-center justify-between p-4 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="h-5 w-5 text-sky-600" />
                <span className="font-medium text-gray-900">Add New Website</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
            <Link
              href="/alertstream/dashboard/triggers/new"
              className="flex items-center justify-between p-4 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="h-5 w-5 text-sky-600" />
                <span className="font-medium text-gray-900">Create New Trigger</span>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">SMS Usage</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-semibold text-gray-900">45 / 50 SMS</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Approaching Limit</p>
                <p className="text-xs text-yellow-700">You've used 90% of your monthly SMS. Consider upgrading.</p>
              </div>
            </div>
            <Link
              href="/alertstream/pricing"
              className="block w-full text-center py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
            <Link href="/alertstream/dashboard/sms" className="text-sky-500 hover:text-sky-600 text-sm font-medium">
              View All
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-medium text-gray-900">{alert.website}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{alert.trigger}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span>{alert.phone}</span>
                    <span>•</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {alert.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
