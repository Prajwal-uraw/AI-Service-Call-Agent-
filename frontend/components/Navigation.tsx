'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, ChevronDown, LayoutDashboard, Users, Settings, CreditCard, Briefcase } from 'lucide-react';

export default function Navigation() {
  const [showMultiTenant, setShowMultiTenant] = useState(false);
  const [showCRM, setShowCRM] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      logout();
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Kestrel Voice Operations" width={40} height={40} className="w-10 h-10" />
            <div className="text-xl font-bold text-blue-600">Kestrel Voice Operations</div>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            {/* Multi-Tenant Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowMultiTenant(true)}
                onMouseLeave={() => setShowMultiTenant(false)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium"
              >
                <LayoutDashboard size={16} />
                Multi-Tenant
                <ChevronDown size={16} />
              </button>
              {showMultiTenant && (
                <div
                  onMouseEnter={() => setShowMultiTenant(true)}
                  onMouseLeave={() => setShowMultiTenant(false)}
                  className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50"
                >
                  <Link href="/onboarding" className="block px-4 py-2 hover:bg-gray-50">Onboarding</Link>
                  <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-50">Dashboard</Link>
                  <Link href="/settings" className="block px-4 py-2 hover:bg-gray-50">Settings</Link>
                  <Link href="/billing" className="block px-4 py-2 hover:bg-gray-50">Billing</Link>
                </div>
              )}
            </div>

            {/* CRM Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCRM(true)}
                onMouseLeave={() => setShowCRM(false)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium"
              >
                <Users size={16} />
                CRM
                <ChevronDown size={16} />
              </button>
              {showCRM && (
                <div
                  onMouseEnter={() => setShowCRM(true)}
                  onMouseLeave={() => setShowCRM(false)}
                  className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50"
                >
                  <Link href="/crm/pipeline" className="block px-4 py-2 hover:bg-gray-50">Pipeline</Link>
                  <Link href="/crm/email-campaigns" className="block px-4 py-2 hover:bg-gray-50">Email Campaigns</Link>
                  <Link href="/crm/scrapers" className="block px-4 py-2 hover:bg-gray-50">Scrapers</Link>
                  <Link href="/crm/tasks" className="block px-4 py-2 hover:bg-gray-50">Tasks</Link>
                </div>
              )}
            </div>

            {/* Admin Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowAdmin(true)}
                onMouseLeave={() => setShowAdmin(false)}
                className="flex items-center gap-1 text-gray-700 hover:text-blue-600 font-medium"
              >
                <Briefcase size={16} />
                Admin
                <ChevronDown size={16} />
              </button>
              {showAdmin && (
                <div
                  onMouseEnter={() => setShowAdmin(true)}
                  onMouseLeave={() => setShowAdmin(false)}
                  className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50"
                >
                  <Link href="/admin/portal" className="block px-4 py-2 hover:bg-gray-50">Portal</Link>
                  <Link href="/admin/signals" className="block px-4 py-2 hover:bg-gray-50">Pain Signals</Link>
                  <Link href="/admin/analytics-enhanced" className="block px-4 py-2 hover:bg-gray-50">Analytics</Link>
                </div>
              )}
            </div>

            <a href="/video" className="text-gray-700 hover:text-blue-600 transition-colors">
              Video Calls
            </a>
            <a href="/calendar" className="text-gray-700 hover:text-blue-600 transition-colors">
              Calendar
            </a>
            <a href="/book-ai-demo" className="text-gray-700 hover:text-blue-600 transition-colors">
              Book AI Demo
            </a>
            <div className="relative group">
              <button className="text-gray-700 hover:text-blue-600 transition-colors">
                Products ▾
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <a href="/products/call-intelligence" className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="font-semibold text-gray-900">AI Call Intelligence</div>
                  <div className="text-xs text-gray-600">Real-time coaching</div>
                </a>
                <a href="/products/follow-up-autopilot" className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="font-semibold text-gray-900">Follow-Up Autopilot</div>
                  <div className="text-xs text-gray-600">Auto-generate emails</div>
                </a>
                <a href="/products/click-to-call" className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="font-semibold text-gray-900">Click-to-Call Dialer</div>
                  <div className="text-xs text-gray-600">Call + auto-log</div>
                </a>
              </div>
            </div>
            <a href="/demo" className="text-gray-700 hover:text-blue-600 transition-colors">
              Demo
            </a>
            <a href="/reports/weekly" className="text-gray-700 hover:text-blue-600 transition-colors">
              Reports
            </a>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600 font-medium"
            >
              Logout
            </button>
            <a 
              href="tel:+15551234567" 
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Phone size={20} />
              <span className="hidden sm:inline">(555) 123-4567</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
