"use client";

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { 
  LayoutDashboard, 
  Phone, 
  Calendar, 
  Users, 
  Settings,
  ChevronLeft,
  Search,
  Bell,
  User,
  Mail,
  MessageSquare,
  Video,
  Target,
  Bot,
  Database,
  BarChart3,
  Inbox,
  ChevronDown,
  Plus,
  PhoneOutgoing,
  Brain,
  HelpCircle,
  Activity
} from 'lucide-react';
import FeedbackWidget from './FeedbackWidget';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const navigation = {
    main: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Inbox', href: '/inbox', icon: Inbox },
      { name: 'Calls', href: '/calls', icon: Phone },
      { name: 'Outbound Calls', href: '/admin/outbound-calls', icon: PhoneOutgoing },
      { name: 'Appointments', href: '/appointments', icon: Calendar },
    ],
    crm: [
      { name: 'Leads', href: '/leads', icon: Target },
      { name: 'Contacts', href: '/contacts', icon: Users },
      { name: 'Email', href: '/email', icon: Mail },
      { name: 'AI Chats', href: '/ai-chats', icon: Bot },
    ],
    communication: [
      { name: 'Team Messages', href: '/messages', icon: MessageSquare },
      { name: 'Video Meetings', href: '/meetings', icon: Video },
    ],
    tools: [
      { name: 'Call Intelligence', href: '/admin/call-intelligence', icon: Brain },
      { name: 'Scrapers', href: '/scrapers', icon: Database },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Help Center', href: '/help', icon: HelpCircle },
      { name: 'System Status', href: '/status', icon: Activity },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } bg-[#0d0d0d] border-r border-neutral-800 flex flex-col transition-all duration-200`}
      >
        {/* Workspace Selector */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-neutral-800/50">
          {!sidebarCollapsed ? (
            <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-800/50 rounded-md transition-colors w-full">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                KC
              </div>
              <span className="text-sm font-medium text-white flex-1 text-left">KC Comfort Air</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          ) : (
            <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mx-auto">
              KC
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-5 overflow-y-auto">
          {/* Main Section */}
          <div className="space-y-0.5">
            {navigation.main.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-neutral-800 text-white' 
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* CRM Section */}
          {!sidebarCollapsed && (
            <div className="space-y-0.5">
              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">CRM</span>
                <button className="p-0.5 hover:bg-neutral-800 rounded transition-colors" aria-label="Add new CRM item">
                  <Plus className="w-3 h-3 text-neutral-500" />
                </button>
              </div>
              {navigation.crm.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-neutral-800 text-white' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Communication Section */}
          {!sidebarCollapsed && (
            <div className="space-y-0.5">
              <div className="px-2 py-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Communication</span>
              </div>
              {navigation.communication.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-neutral-800 text-white' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Tools Section */}
          {!sidebarCollapsed && (
            <div className="space-y-0.5">
              <div className="px-2 py-1">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tools</span>
              </div>
              {navigation.tools.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-neutral-800 text-white' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="p-2 border-t border-neutral-800/50">
          <div className={`flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-neutral-800/50 cursor-pointer transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin User</p>
                <p className="text-xs text-neutral-500 truncate">Online</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-1.5 text-sm bg-neutral-50 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-neutral-100 rounded-md transition-colors relative" aria-label="View notifications">
              <Bell className="w-5 h-5 text-neutral-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}
