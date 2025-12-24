'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Search, Book, Video, FileText, MessageCircle, 
  ChevronRight, ExternalLink, Play, Download,
  HelpCircle, Zap, Phone, Settings, BarChart3
} from 'lucide-react';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'getting-started', name: 'Getting Started', icon: Zap },
    { id: 'calls', name: 'Calls & Voice', icon: Phone },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I set up my first AI voice agent?',
      answer: 'Follow our interactive onboarding wizard. It takes just 5 minutes to configure your company info, choose a plan, and set up call forwarding. Our team will have you live in 48 hours.'
    },
    {
      category: 'getting-started',
      question: 'What happens during the 48-hour deployment?',
      answer: 'Our team will: 1) Set up your Twilio phone number, 2) Configure your AI agent with industry-specific knowledge, 3) Test the system thoroughly, 4) Train your team on the dashboard.'
    },
    {
      category: 'calls',
      question: 'How does the AI handle emergency calls?',
      answer: 'The AI is trained to detect emergency keywords (gas leak, no heat, etc.) and immediately transfers to your emergency phone number. It also logs these as high-priority in your dashboard.'
    },
    {
      category: 'calls',
      question: 'Can I customize what the AI says?',
      answer: 'Yes! Go to Settings > AI Personality to customize greetings, tone, and responses. You can also add custom scripts for specific scenarios.'
    },
    {
      category: 'calls',
      question: 'What is the AI response time?',
      answer: 'Our AI responds in under 200ms - 10x faster than competitors. This creates natural, human-like conversations without awkward pauses.'
    },
    {
      category: 'settings',
      question: 'How do I connect my Twilio account?',
      answer: 'Go to Settings > Integrations > Twilio. Enter your Account SID and Auth Token. We\'ll verify the connection and show your available phone numbers.'
    },
    {
      category: 'settings',
      question: 'Can I set business hours for the AI?',
      answer: 'Yes! Go to Settings > Business Hours. Set your operating hours, holidays, and after-hours behavior (voicemail, emergency-only, etc.).'
    },
    {
      category: 'analytics',
      question: 'How do I view call transcripts?',
      answer: 'Go to Calls > Call History. Click any call to see the full transcript, sentiment analysis, and AI insights.'
    },
    {
      category: 'analytics',
      question: 'What metrics should I track?',
      answer: 'Key metrics: Call volume, answer rate, average duration, sentiment score, booking conversion rate, and missed opportunities.'
    },
    {
      category: 'analytics',
      question: 'Can I export reports?',
      answer: 'Yes! All analytics pages have an Export button. Choose PDF for presentations or CSV for Excel analysis.'
    },
  ];

  const videoTutorials = [
    {
      title: 'Platform Overview',
      duration: '2:30',
      thumbnail: '/videos/overview-thumb.jpg',
      url: '#',
      description: 'Quick tour of the Kestrel VoiceOps dashboard'
    },
    {
      title: 'AI Agent in Action',
      duration: '3:15',
      thumbnail: '/videos/ai-demo-thumb.jpg',
      url: '#',
      description: 'Watch the AI handle real customer calls'
    },
    {
      title: 'Setup Walkthrough',
      duration: '5:00',
      thumbnail: '/videos/setup-thumb.jpg',
      url: '#',
      description: 'Step-by-step guide to getting started'
    },
    {
      title: 'CRM Features',
      duration: '3:45',
      thumbnail: '/videos/crm-thumb.jpg',
      url: '#',
      description: 'Managing contacts and leads effectively'
    },
  ];

  const guides = [
    {
      title: 'Quick Start Guide',
      description: 'Get up and running in 5 minutes',
      icon: Zap,
      url: '#'
    },
    {
      title: 'Best Practices',
      description: 'Tips for maximizing AI performance',
      icon: Book,
      url: '#'
    },
    {
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: HelpCircle,
      url: '#'
    },
    {
      title: 'API Documentation',
      description: 'For developers and integrations',
      icon: FileText,
      url: '#'
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Help Center</h1>
          <p className="text-neutral-600">Find answers, watch tutorials, and get support</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <a
                key={guide.title}
                href={guide.url}
                className="bg-white border border-neutral-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <Icon className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-blue-600">
                  {guide.title}
                </h3>
                <p className="text-sm text-neutral-600">{guide.description}</p>
              </a>
            );
          })}
        </div>

        {/* Video Tutorials */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-neutral-900">Video Tutorials</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoTutorials.map((video) => (
              <a
                key={video.title}
                href={video.url}
                className="group"
              >
                <div className="relative bg-neutral-200 rounded-lg overflow-hidden mb-3 aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600 mb-1">
                  {video.title}
                </h3>
                <p className="text-sm text-neutral-600">{video.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-neutral-900">Frequently Asked Questions</h2>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:border-blue-500'
                  }`}
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
                <p className="text-neutral-600">No results found. Try a different search term.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-white border border-neutral-200 rounded-lg p-6 group"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <h3 className="font-semibold text-neutral-900 group-hover:text-blue-600">
                      {faq.question}
                    </h3>
                    <ChevronRight className="text-neutral-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-neutral-700 leading-relaxed">{faq.answer}</p>
                </details>
              ))
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
              <p className="text-blue-100 mb-4">Our support team is here to assist you</p>
              <div className="flex gap-4">
                <a
                  href="mailto:support@kestrel.ai"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Email Support
                </a>
                <a
                  href="#"
                  className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={20} />
                  Live Chat
                </a>
              </div>
            </div>
            <MessageCircle className="w-24 h-24 text-white/20" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
