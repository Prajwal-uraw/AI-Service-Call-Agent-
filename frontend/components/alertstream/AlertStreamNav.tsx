'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, LayoutDashboard, Globe, Zap, MessageCircle, BarChart3, Settings, LogOut, Link2 } from 'lucide-react';

export default function AlertStreamNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/alertstream/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/alertstream/dashboard/websites', icon: Globe, label: 'Websites' },
    { href: '/alertstream/dashboard/triggers', icon: Zap, label: 'Triggers' },
    { href: '/alertstream/dashboard/sms', icon: MessageCircle, label: 'SMS History' },
    { href: '/alertstream/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/alertstream/dashboard/integrations', icon: Link2, label: 'Integrations' },
    { href: '/alertstream/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/alertstream" className="flex items-center space-x-2">
          <MessageSquare className="h-8 w-8 text-sky-500" />
          <span className="text-xl font-bold text-gray-900">AlertStream</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-600 border-r-4 border-sky-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Section */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
            <span className="text-sky-600 font-semibold">U</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">User</p>
            <p className="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
        <Link
          href="/logout"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Link>
      </div>
    </nav>
  );
}
