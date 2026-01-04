'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Linkedin, Zap, Code, Chrome, Smartphone, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'available' | 'coming_soon';
  category: 'email' | 'social' | 'automation' | 'developer';
  setupUrl: string;
}

export default function IntegrationsPage() {
  const [filter, setFilter] = useState<string>('all');

  const integrations: Integration[] = [
    {
      id: 'email-monitoring',
      name: 'Email Monitoring',
      description: 'Get SMS alerts for important emails. Supports Gmail, Outlook, Yahoo, and more.',
      icon: Mail,
      status: 'available',
      category: 'email',
      setupUrl: '/alertstream/dashboard/integrations/email',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Monitor',
      description: 'Track profile views, messages, and connection requests via browser extension.',
      icon: Linkedin,
      status: 'available',
      category: 'social',
      setupUrl: '/alertstream/dashboard/integrations/linkedin',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect AlertStream to 5,000+ apps. Automate workflows without code.',
      icon: Zap,
      status: 'available',
      category: 'automation',
      setupUrl: '/alertstream/dashboard/integrations/zapier',
    },
    {
      id: 'javascript-sdk',
      name: 'JavaScript SDK',
      description: 'Track custom events from your website with our lightweight SDK.',
      icon: Code,
      status: 'active',
      category: 'developer',
      setupUrl: '/alertstream/dashboard/integrations/javascript',
    },
    {
      id: 'browser-extension',
      name: 'Browser Extension',
      description: 'Monitor web activity and get alerts directly in your browser.',
      icon: Chrome,
      status: 'available',
      category: 'developer',
      setupUrl: '/alertstream/dashboard/integrations/extension',
    },
    {
      id: 'wordpress',
      name: 'WordPress Plugin',
      description: 'Easy integration for WordPress sites. Track forms, comments, and more.',
      icon: Code,
      status: 'available',
      category: 'developer',
      setupUrl: '/alertstream/dashboard/integrations/wordpress',
    },
    {
      id: 'mobile-app',
      name: 'Mobile App',
      description: 'Manage alerts and view analytics on the go.',
      icon: Smartphone,
      status: 'coming_soon',
      category: 'automation',
      setupUrl: '#',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Integrations' },
    { id: 'email', label: 'Email' },
    { id: 'social', label: 'Social Media' },
    { id: 'automation', label: 'Automation' },
    { id: 'developer', label: 'Developer Tools' },
  ];

  const filteredIntegrations = filter === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === filter);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      available: 'bg-blue-100 text-blue-800',
      coming_soon: 'bg-gray-100 text-gray-600',
    };
    const labels = {
      active: 'Active',
      available: 'Available',
      coming_soon: 'Coming Soon',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">Connect AlertStream with your favorite tools and platforms</p>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setFilter(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === category.id
                ? 'bg-sky-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Integrations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map(integration => {
          const Icon = integration.icon;
          return (
            <div
              key={integration.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Icon className="h-6 w-6 text-sky-600" />
                </div>
                {getStatusBadge(integration.status)}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {integration.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {integration.description}
              </p>

              {integration.status === 'coming_soon' ? (
                <button
                  disabled
                  className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
                >
                  Coming Soon
                </button>
              ) : integration.status === 'active' ? (
                <Link
                  href={integration.setupUrl}
                  className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Manage</span>
                </Link>
              ) : (
                <Link
                  href={integration.setupUrl}
                  className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  <span>Setup</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-sky-50 rounded-lg border border-sky-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Need Help?</h2>
        <p className="text-gray-700 mb-4">
          Check out our comprehensive integration guides and documentation.
        </p>
        <Link
          href="/alertstream/docs"
          className="inline-flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-medium"
        >
          <span>View Documentation</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
