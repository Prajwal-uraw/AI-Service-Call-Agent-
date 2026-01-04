'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import WebsiteCard from '@/components/alertstream/WebsiteCard';
import type { Website } from '@/lib/alertstream/types';

export default function WebsitesPage() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - will be replaced with real API calls
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: '1',
      user_id: 'user1',
      name: 'Main Website',
      domain: 'example.com',
      api_key: 'js_abc123def456ghi789',
      hmac_secret: 'secret_xyz',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      user_id: 'user1',
      name: 'E-commerce Store',
      domain: 'shop.example.com',
      api_key: 'js_jkl012mno345pqr678',
      hmac_secret: 'secret_abc',
      is_active: true,
      created_at: '2025-01-05T00:00:00Z',
      updated_at: '2025-01-05T00:00:00Z',
    },
    {
      id: '3',
      user_id: 'user1',
      name: 'Blog',
      domain: 'blog.example.com',
      api_key: 'js_stu901vwx234yz5678',
      hmac_secret: 'secret_def',
      is_active: false,
      created_at: '2025-01-10T00:00:00Z',
      updated_at: '2025-01-10T00:00:00Z',
    },
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this website?')) {
      setWebsites(websites.filter(w => w.id !== id));
    }
  };

  const handleToggle = (id: string) => {
    setWebsites(websites.map(w => 
      w.id === id ? { ...w, is_active: !w.is_active } : w
    ));
  };

  const filteredWebsites = websites.filter(website =>
    website.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    website.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Websites</h1>
          <p className="text-gray-600">Manage your websites and integration settings</p>
        </div>
        <Link
          href="/alertstream/dashboard/websites/new"
          className="flex items-center space-x-2 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Website</span>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search websites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Websites Grid */}
      {filteredWebsites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No websites found</p>
          <Link
            href="/alertstream/dashboard/websites/new"
            className="text-sky-500 hover:text-sky-600 font-medium"
          >
            Add your first website
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredWebsites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
