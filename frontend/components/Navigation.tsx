'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, ChevronDown, LayoutDashboard, Users, Settings, CreditCard, Briefcase } from 'lucide-react';
import { logout, isAuthenticated } from '@/libs/auth';

export default function Navigation() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

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
            <img 
              src="/website-logo-wide.png" 
              alt="Kestrel" 
              className="h-9 w-auto max-w-[180px] object-contain"
            />
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Products Dropdown - Always visible */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('products')}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <span>Products</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {openDropdown === 'products' && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <Link href="/products/call-intelligence" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <div className="font-semibold">AI Call Agent</div>
                  <div className="text-xs text-gray-500">24/7 voice receptionist</div>
                </Link>
                <Link href="/products/click-to-call" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <div className="font-semibold">Click-to-Call</div>
                  <div className="text-xs text-gray-500">One-click dialing</div>
                </Link>
                <Link href="/products/follow-up-autopilot" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <div className="font-semibold">Follow-Up Autopilot</div>
                  <div className="text-xs text-gray-500">Automated follow-ups</div>
                </Link>
                <Link href="/video" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <div className="font-semibold">Video Calls</div>
                  <div className="text-xs text-gray-500">HD video conferencing</div>
                </Link>
              </div>
              )}
            </div>

            {isLoggedIn && (
              <>
                {/* CRM Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('crm')}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span>CRM</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {openDropdown === 'crm' && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                      <Link href="/crm/leads" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Leads</Link>
                      <Link href="/crm/contacts" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Contacts</Link>
                      <Link href="/crm/pipeline" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Pipeline</Link>
                    </div>
                  )}
                </div>

                {/* Admin Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('admin')}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span>Admin</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {openDropdown === 'admin' && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                      <Link href="/admin/portal" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</Link>
                      <Link href="/admin/analytics" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Analytics</Link>
                      <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Settings</Link>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            )}

            {!isLoggedIn && (
              <a
                href="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
