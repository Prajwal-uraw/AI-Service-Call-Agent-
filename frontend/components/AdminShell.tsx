'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Phone, 
  Video,
  BarChart3, 
  Settings,
  AlertCircle,
  Database,
  Mail,
  Search,
  Bell,
  User,
  ChevronDown,
  Activity,
  Zap,
  FileText,
  Shield
} from 'lucide-react';
import { logout } from '@/lib/auth';

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [environment] = useState<'production' | 'staging'>('staging');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    {
      section: 'Operations',
      items: [
        { name: 'Dashboard', href: '/admin/portal', icon: LayoutDashboard },
        { name: 'System Health', href: '/admin/health', icon: Activity },
        { name: 'Call Logs', href: '/admin/calls', icon: Phone },
        { name: 'Video Sessions', href: '/admin/video', icon: Video },
      ]
    },
    {
      section: 'Management',
      items: [
        { name: 'Tenants', href: '/admin/tenants', icon: Users },
        { name: 'Analytics', href: '/admin/analytics-enhanced', icon: BarChart3 },
        { name: 'Pain Signals', href: '/admin/signals', icon: AlertCircle },
        { name: 'Database', href: '/admin/database', icon: Database },
      ]
    },
    {
      section: 'Configuration',
      items: [
        { name: 'Integrations', href: '/admin/integrations', icon: Zap },
        { name: 'Email Templates', href: '/admin/email-templates', icon: Mail },
        { name: 'Reports', href: '/admin/reports', icon: FileText },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    },
    {
      section: 'Security',
      items: [
        { name: 'Access Control', href: '/admin/access', icon: Shield },
        { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
      ]
    }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left: Logo + Environment */}
          <div className="flex items-center gap-6">
            <Link href="/admin/portal" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-100">Kestrel Ops</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Environment:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                environment === 'production' 
                  ? 'bg-green-900/30 text-green-400 border border-green-700' 
                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
              }`}>
                {environment.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tenants, calls, IDs..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-medium text-slate-100">Admin User</div>
                  <div className="text-xs text-slate-400">admin@kestrel.com</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-2 z-50">
                  <Link href="/admin/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                    Profile Settings
                  </Link>
                  <Link href="/admin/preferences" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                    Preferences
                  </Link>
                  <div className="border-t border-slate-700 my-2"></div>
                  <button 
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto">
        <nav className="p-4 space-y-6">
          {navigation.map((section) => (
            <div key={section.section}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {section.section}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* System Status Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900/50 border-t border-slate-700">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">API Status</span>
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Database</span>
              <span className="flex items-center gap-1 text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Connected
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              v1.0.0 • Build 2025.12.22
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-16 min-h-[calc(100vh-4rem)]">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
