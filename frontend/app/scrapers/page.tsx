'use client';

import AdminLayout from '@/components/AdminLayout';
import { Database, Play, Pause, Settings, TrendingUp, Plus } from 'lucide-react';

export default function ScrapersPage() {
  const scrapers = [
    { id: 1, name: 'Lead Generation - LinkedIn', status: 'active', lastRun: '2 hours ago', leads: 156, success: 98 },
    { id: 2, name: 'Market Research - Competitors', status: 'paused', lastRun: '1 day ago', leads: 42, success: 95 },
    { id: 3, name: 'Contact Enrichment', status: 'active', lastRun: '30 min ago', leads: 89, success: 100 },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Data Scrapers</h1>
            <p className="text-sm text-neutral-600 mt-1">Automated data collection and enrichment</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Scraper
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Active Scrapers</span>
              <Database className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">2</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Leads Collected</span>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">287</div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Success Rate</span>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-semibold text-neutral-900">98%</div>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-base font-semibold text-neutral-900">Your Scrapers</h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {scrapers.map((scraper) => (
              <div key={scraper.id} className="p-6 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      scraper.status === 'active' ? 'bg-green-100' : 'bg-neutral-100'
                    }`}>
                      <Database className={`w-6 h-6 ${scraper.status === 'active' ? 'text-green-600' : 'text-neutral-600'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{scraper.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-neutral-600">
                        <span>Last run: {scraper.lastRun}</span>
                        <span>•</span>
                        <span>{scraper.leads} leads</span>
                        <span>•</span>
                        <span>{scraper.success}% success</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      scraper.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {scraper.status}
                    </span>
                    <button className="p-2 hover:bg-neutral-100 rounded transition-colors" aria-label={scraper.status === 'active' ? 'Pause scraper' : 'Start scraper'}>
                      {scraper.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button className="p-2 hover:bg-neutral-100 rounded transition-colors" aria-label="Scraper settings">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
