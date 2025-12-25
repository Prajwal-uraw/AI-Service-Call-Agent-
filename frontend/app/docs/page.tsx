import Link from 'next/link';
import { FileText, Book, Code, Zap, Shield, Users } from 'lucide-react';

export const metadata = {
  title: 'Documentation | KestrelVoice',
  description: 'Complete documentation for KestrelVoice AI voice operations platform',
};

export default function DocsPage() {
  const docSections = [
    {
      icon: Zap,
      title: 'Getting Started',
      description: 'Quick start guide to get up and running in minutes',
      links: [
        { label: 'Introduction', href: '#intro' },
        { label: 'Setup Guide', href: '#setup' },
        { label: 'First Call', href: '#first-call' },
      ]
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Complete API documentation and integration guides',
      links: [
        { label: 'Authentication', href: '#auth' },
        { label: 'Endpoints', href: '#endpoints' },
        { label: 'Webhooks', href: '#webhooks' },
      ]
    },
    {
      icon: Book,
      title: 'Guides',
      description: 'Step-by-step tutorials and best practices',
      links: [
        { label: 'CRM Integration', href: '/integrations' },
        { label: 'Call Workflows', href: '#workflows' },
        { label: 'Analytics', href: '/admin/analytics' },
      ]
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Security features and compliance information',
      links: [
        { label: 'Security Overview', href: '/security' },
        { label: 'Data Privacy', href: '/privacy' },
        { label: 'Compliance', href: '/compliance' },
      ]
    },
    {
      icon: Users,
      title: 'Support',
      description: 'Get help from our team',
      links: [
        { label: 'Contact Support', href: '/contact' },
        { label: 'FAQ', href: '/#faq' },
        { label: 'Status', href: '/status' },
      ]
    },
    {
      icon: FileText,
      title: 'Resources',
      description: 'Industry reports and case studies',
      links: [
        { label: 'HVAC Report 2024', href: '/hvac-call-automation-report-2024' },
        { label: 'Case Studies', href: '/case-studies' },
        { label: 'Sample Report', href: '/sample-report' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">Documentation</h1>
            <p className="text-xl text-blue-100">
              Everything you need to build, integrate, and scale with KestrelVoice
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-6 max-w-7xl -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <input
            type="text"
            placeholder="Search documentation..."
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="container mx-auto px-6 max-w-7xl py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {docSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-neutral-200 p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900">{section.title}</h2>
                </div>
                <p className="text-neutral-600 mb-6">{section.description}</p>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2"
                      >
                        <span>→</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">Popular Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/production-pilot"
              className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Production Pilot Program</h3>
              <p className="text-neutral-600">
                7-day risk-free pilot with full analytics and ROI report
              </p>
            </Link>
            <Link
              href="/sample-report"
              className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Sample Pilot Report</h3>
              <p className="text-neutral-600">
                See what insights you'll get from your pilot program
              </p>
            </Link>
            <Link
              href="/hvac-call-automation-report-2024"
              className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Industry Report 2024</h3>
              <p className="text-neutral-600">
                Comprehensive analysis of HVAC call automation trends
              </p>
            </Link>
            <Link
              href="/calendar"
              className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Book a Demo</h3>
              <p className="text-neutral-600">
                Schedule a personalized walkthrough with our team
              </p>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Need Help?</h2>
          <p className="text-xl text-neutral-600 mb-8">
            Our team is here to help you succeed
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/calendar"
              className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Schedule Call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
