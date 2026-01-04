'use client';

import { Globe, Zap, MessageCircle, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-sky-600" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-4 w-4 ${!trendUp && 'rotate-180'}`} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

interface DashboardStatsProps {
  websites: number;
  triggers: number;
  smsSent: number;
  deliveryRate: number;
}

export default function DashboardStats({ websites, triggers, smsSent, deliveryRate }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Websites"
        value={websites}
        icon={Globe}
      />
      <StatCard
        title="Active Triggers"
        value={triggers}
        icon={Zap}
      />
      <StatCard
        title="SMS Sent (30d)"
        value={smsSent.toLocaleString()}
        icon={MessageCircle}
        trend="+12%"
        trendUp={true}
      />
      <StatCard
        title="Delivery Rate"
        value={`${deliveryRate}%`}
        icon={TrendingUp}
        trend="+2.5%"
        trendUp={true}
      />
    </div>
  );
}
