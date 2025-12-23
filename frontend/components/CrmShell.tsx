'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Kanban,
  ListChecks,
  Mail,
  Database,
  Search,
  Bell,
  User,
  ChevronDown,
  LayoutDashboard,
  Briefcase,
} from 'lucide-react';
import { logout } from '@/libs/auth';

interface CrmShellProps {
  children: ReactNode;
}

export default function CrmShell({ children }: CrmShellProps) {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigation = [
    {
      section: 'Overview',
      items: [{ name: 'CRM Home', href: '/crm', icon: LayoutDashboard }],
    },
    {
      section: 'Sales',
      items: [
        { name: 'Leads', href: '/crm/leads', icon: Briefcase },
        { name: 'Pipeline', href: '/crm/pipeline', icon: Kanban },
        { name: 'Tasks', href: '/crm/tasks', icon: ListChecks },
      ],
    },
    {
      section: 'Customers',
      items: [{ name: 'Contacts', href: '/crm/contacts', icon: Users }],
    },
    {
      section: 'Automation',
      items: [
        { name: 'Email Campaigns', href: '/crm/email-campaigns', icon: Mail },
        { name: 'Scrapers', href: '/crm/scrapers', icon: Database },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/crm') return pathname === '/crm';
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-slate-100">
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-800/40 backdrop-blur-md border-b border-white/10 z-[60] shadow-lg">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/crm" className="flex items-center gap-3">
              <img src="/website-logo-wide.png" alt="Kestrel" className="h-8 w-auto max-w-[180px] object-contain" />
            </Link>
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              CRM Online
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads, contacts, companies..."
                className="w-full bg-slate-700/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm" aria-label="Notifications">
              <Bell className="w-5 h-5 text-slate-300" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 z-[100]">
                  <Link href="/admin/portal" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">
                    Admin
                  </Link>
                  <div className="border-t border-slate-700 my-2" />
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

      <aside className="fixed top-16 left-0 bottom-0 w-64 bg-slate-800/40 backdrop-blur-xl border-r border-white/10 overflow-y-auto z-[50]">
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
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30 backdrop-blur-sm shadow-lg'
                          : 'text-slate-300 hover:bg-white/10 hover:text-slate-100 backdrop-blur-sm'
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
      </aside>

      <main className="ml-64 mt-16 min-h-[calc(100vh-4rem)]">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
