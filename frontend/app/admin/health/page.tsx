'use client';

import AdminShell from '@/components/AdminShell';
import { Activity, CheckCircle, AlertTriangle, XCircle, Server, Database, Zap, Clock } from 'lucide-react';

export default function SystemHealthPage() {
  const services = [
    { name: 'API Gateway', status: 'operational', uptime: '99.98%', responseTime: '45ms', icon: Server },
    { name: 'Database', status: 'operational', uptime: '99.99%', responseTime: '12ms', icon: Database },
    { name: 'Voice Engine', status: 'operational', uptime: '99.95%', responseTime: '180ms', icon: Zap },
    { name: 'Video Service', status: 'degraded', uptime: '98.50%', responseTime: '320ms', icon: Activity },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'down': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'down': return XCircle;
      default: return Activity;
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">System Health</h1>
          <p className="text-slate-400 mt-2">Real-time monitoring of all services</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const StatusIcon = getStatusIcon(service.status);
            const ServiceIcon = service.icon;
            return (
              <div key={service.name} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <ServiceIcon className="w-8 h-8 text-blue-400" />
                  <StatusIcon className={`w-6 h-6 ${getStatusColor(service.status)}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{service.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-medium capitalize ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uptime</span>
                    <span className="text-slate-200">{service.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Response</span>
                    <span className="text-slate-200">{service.responseTime}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-4">Recent Incidents</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-100">Video Service Degradation</h3>
                  <span className="text-sm text-slate-400">2 hours ago</span>
                </div>
                <p className="text-sm text-slate-400">
                  Increased latency detected in video streaming. Team investigating.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-100">Database Maintenance Completed</h3>
                  <span className="text-sm text-slate-400">1 day ago</span>
                </div>
                <p className="text-sm text-slate-400">
                  Scheduled maintenance completed successfully. All systems operational.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
