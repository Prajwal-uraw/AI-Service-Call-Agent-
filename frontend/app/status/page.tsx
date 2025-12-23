'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  CheckCircle, XCircle, AlertCircle, Clock, 
  Activity, Server, Database, Phone, Zap
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  uptime: number;
  responseTime: number;
  icon: any;
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Server',
      status: 'operational',
      uptime: 99.98,
      responseTime: 45,
      icon: Server
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: 99.99,
      responseTime: 12,
      icon: Database
    },
    {
      name: 'Twilio Voice',
      status: 'operational',
      uptime: 99.95,
      responseTime: 185,
      icon: Phone
    },
    {
      name: 'AI Engine',
      status: 'operational',
      uptime: 99.97,
      responseTime: 165,
      icon: Zap
    },
  ]);

  const [incidents, setIncidents] = useState([
    {
      date: '2025-12-20',
      title: 'Scheduled Maintenance',
      status: 'resolved',
      description: 'Database optimization and security updates completed successfully.',
      duration: '30 minutes'
    },
    {
      date: '2025-12-15',
      title: 'Elevated API Latency',
      status: 'resolved',
      description: 'Brief increase in API response times due to traffic spike. Resolved by auto-scaling.',
      duration: '15 minutes'
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'maintenance':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const overallStatus = services.every(s => s.status === 'operational') 
    ? 'operational' 
    : services.some(s => s.status === 'down') 
    ? 'down' 
    : 'degraded';

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">System Status</h1>
          <p className="text-neutral-600">Real-time status of all Kestrel VoiceOps services</p>
        </div>

        {/* Overall Status */}
        <div className={`rounded-lg p-6 mb-8 ${
          overallStatus === 'operational' 
            ? 'bg-green-50 border-2 border-green-200' 
            : overallStatus === 'down'
            ? 'bg-red-50 border-2 border-red-200'
            : 'bg-yellow-50 border-2 border-yellow-200'
        }`}>
          <div className="flex items-center gap-4">
            {getStatusIcon(overallStatus)}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                {overallStatus === 'operational' && 'All Systems Operational'}
                {overallStatus === 'degraded' && 'Partial System Outage'}
                {overallStatus === 'down' && 'System Outage'}
              </h2>
              <p className="text-neutral-700">
                {overallStatus === 'operational' && 'All services are running smoothly'}
                {overallStatus === 'degraded' && 'Some services are experiencing issues'}
                {overallStatus === 'down' && 'Critical services are down'}
              </p>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Service Status</h2>
          <div className="space-y-4">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.name}
                  className="bg-white border border-neutral-200 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-neutral-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(service.status)}
                          <span className={`text-sm font-medium px-2 py-0.5 rounded ${getStatusColor(service.status)}`}>
                            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-neutral-600">Uptime</div>
                      <div className="text-2xl font-bold text-neutral-900">{service.uptime}%</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">Response Time</div>
                      <div className="text-lg font-semibold text-neutral-900">{service.responseTime}ms</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">Last Checked</div>
                      <div className="text-lg font-semibold text-neutral-900">Just now</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incident History */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Recent Incidents</h2>
          {incidents.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-neutral-600">No incidents in the last 30 days</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident, index) => (
                <div
                  key={index}
                  className="bg-white border border-neutral-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Resolved</span>
                      </div>
                      <h3 className="font-semibold text-neutral-900">{incident.title}</h3>
                    </div>
                    <span className="text-sm text-neutral-600">{incident.date}</span>
                  </div>
                  <p className="text-neutral-700 mb-2">{incident.description}</p>
                  <div className="text-sm text-neutral-600">
                    Duration: <span className="font-medium">{incident.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe to Updates */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Get Status Updates</h2>
          <p className="text-blue-100 mb-4">Subscribe to receive notifications about incidents and maintenance</p>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-neutral-900"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
