"use client"

import { useState } from 'react'
import { Calendar, Tag, Sparkles, Bug, Zap, Shield, TrendingUp, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ChangelogEntry {
  id: string
  version: string
  date: string
  title: string
  description: string
  changes: Change[]
  isLatest?: boolean
}

interface Change {
  type: 'feature' | 'improvement' | 'bugfix' | 'security'
  description: string
}

const changelogData: ChangelogEntry[] = [
  {
    id: '1',
    version: '2.5.0',
    date: '2024-01-15',
    title: 'AI Voice Agent Enhancements',
    description: 'Major improvements to AI voice capabilities and new integration options.',
    isLatest: true,
    changes: [
      {
        type: 'feature',
        description: 'Added support for multi-language voice interactions (Spanish, French, German)'
      },
      {
        type: 'feature',
        description: 'New ServiceTitan integration for seamless field service management'
      },
      {
        type: 'improvement',
        description: 'Reduced voice response latency by 40% with optimized AI models'
      },
      {
        type: 'improvement',
        description: 'Enhanced natural language understanding for complex service requests'
      },
      {
        type: 'bugfix',
        description: 'Fixed issue where call recordings were not saving properly in certain scenarios'
      },
      {
        type: 'security',
        description: 'Implemented end-to-end encryption for all voice communications'
      }
    ]
  },
  {
    id: '2',
    version: '2.4.2',
    date: '2024-01-08',
    title: 'Performance & Stability Update',
    description: 'Critical bug fixes and performance improvements.',
    changes: [
      {
        type: 'improvement',
        description: 'Improved dashboard loading speed by 60%'
      },
      {
        type: 'improvement',
        description: 'Optimized database queries for faster report generation'
      },
      {
        type: 'bugfix',
        description: 'Resolved issue with calendar sync failing for recurring appointments'
      },
      {
        type: 'bugfix',
        description: 'Fixed timezone handling in scheduling system'
      },
      {
        type: 'security',
        description: 'Updated dependencies to address security vulnerabilities'
      }
    ]
  },
  {
    id: '3',
    version: '2.4.0',
    date: '2024-01-01',
    title: 'New Year Feature Release',
    description: 'Exciting new features to start the year strong.',
    changes: [
      {
        type: 'feature',
        description: 'Introduced AI-powered call sentiment analysis'
      },
      {
        type: 'feature',
        description: 'Added custom branding options for customer-facing communications'
      },
      {
        type: 'feature',
        description: 'New mobile app for iOS and Android'
      },
      {
        type: 'improvement',
        description: 'Redesigned user interface with improved accessibility'
      },
      {
        type: 'improvement',
        description: 'Enhanced reporting with new visualization options'
      }
    ]
  },
  {
    id: '4',
    version: '2.3.5',
    date: '2023-12-20',
    title: 'Holiday Season Updates',
    description: 'Preparing for high-volume holiday season.',
    changes: [
      {
        type: 'improvement',
        description: 'Increased system capacity to handle 3x call volume'
      },
      {
        type: 'improvement',
        description: 'Added queue management for high-traffic periods'
      },
      {
        type: 'feature',
        description: 'Holiday hours scheduling with automated announcements'
      },
      {
        type: 'bugfix',
        description: 'Fixed issue with SMS notifications not sending during peak hours'
      }
    ]
  },
  {
    id: '5',
    version: '2.3.0',
    date: '2023-12-10',
    title: 'Integration Expansion',
    description: 'New integrations and API improvements.',
    changes: [
      {
        type: 'feature',
        description: 'Added Zapier integration for workflow automation'
      },
      {
        type: 'feature',
        description: 'New REST API endpoints for custom integrations'
      },
      {
        type: 'feature',
        description: 'Webhook support for real-time event notifications'
      },
      {
        type: 'improvement',
        description: 'Enhanced API documentation with interactive examples'
      },
      {
        type: 'security',
        description: 'Implemented OAuth 2.0 for third-party integrations'
      }
    ]
  },
  {
    id: '6',
    version: '2.2.0',
    date: '2023-11-25',
    title: 'Analytics & Reporting Overhaul',
    description: 'Comprehensive analytics improvements.',
    changes: [
      {
        type: 'feature',
        description: 'New analytics dashboard with customizable widgets'
      },
      {
        type: 'feature',
        description: 'Advanced filtering and segmentation options'
      },
      {
        type: 'feature',
        description: 'Scheduled report delivery via email'
      },
      {
        type: 'improvement',
        description: 'Export data in multiple formats (CSV, Excel, PDF)'
      }
    ]
  }
]

const getChangeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <Sparkles className="h-4 w-4" />
    case 'improvement':
      return <TrendingUp className="h-4 w-4" />
    case 'bugfix':
      return <Bug className="h-4 w-4" />
    case 'security':
      return <Shield className="h-4 w-4" />
    default:
      return <Zap className="h-4 w-4" />
  }
}

const getChangeBadgeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-brand-100 text-brand-700 border-brand-200'
    case 'improvement':
      return 'bg-success-100 text-success-700 border-success-200'
    case 'bugfix':
      return 'bg-warning-100 text-warning-700 border-warning-200'
    case 'security':
      return 'bg-error-100 text-error-700 border-error-200'
    default:
      return 'bg-neutral-100 text-neutral-700 border-neutral-200'
  }
}

export default function ChangelogPage() {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChangelog = changelogData.map(entry => ({
    ...entry,
    changes: entry.changes.filter(change => {
      const matchesType = selectedType === 'all' || change.type === selectedType
      const matchesSearch = change.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           entry.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  })).filter(entry => entry.changes.length > 0)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Changelog
            </h1>
            <p className="text-xl text-brand-100 mb-8">
              Stay up to date with new features, improvements, and bug fixes
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" onClick={() => setSelectedType('all')}>
                All
              </TabsTrigger>
              <TabsTrigger value="feature" onClick={() => setSelectedType('feature')}>
                Features
              </TabsTrigger>
              <TabsTrigger value="improvement" onClick={() => setSelectedType('improvement')}>
                Improvements
              </TabsTrigger>
              <TabsTrigger value="bugfix" onClick={() => setSelectedType('bugfix')}>
                Bug Fixes
              </TabsTrigger>
              <TabsTrigger value="security" onClick={() => setSelectedType('security')}>
                Security
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-8">
            {filteredChangelog.map((entry) => (
              <Card key={entry.id} className="relative overflow-hidden">
                {entry.isLatest && (
                  <div className="absolute top-0 right-0">
                    <Badge className="bg-success-500 text-white rounded-none rounded-bl-lg">
                      Latest
                    </Badge>
                  </div>
                )}
                <CardHeader className="border-b border-neutral-200 bg-neutral-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono text-sm">
                          v{entry.version}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-neutral-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-neutral-900">{entry.title}</h2>
                      <p className="text-neutral-600 mt-1">{entry.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {entry.changes.map((change, index) => (
                      <div key={index} className="flex items-start gap-3 group">
                        <div className={`p-2 rounded-lg ${getChangeBadgeColor(change.type)} shrink-0 mt-0.5`}>
                          {getChangeIcon(change.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`text-xs capitalize ${getChangeBadgeColor(change.type)}`}>
                              {change.type}
                            </Badge>
                          </div>
                          <p className="text-neutral-700">{change.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredChangelog.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-600 text-lg">No updates found matching your criteria.</p>
            </div>
          )}

          <div className="mt-12 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Subscribe to Updates</h2>
            <p className="text-brand-100 mb-6 max-w-2xl mx-auto">
              Get notified when we release new features and improvements
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <button className="px-6 py-3 bg-white text-brand-700 rounded-lg font-medium hover:bg-brand-50 transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          <div className="mt-8 p-6 bg-brand-50 border border-brand-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Tag className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Release Schedule</h3>
                <p className="text-sm text-neutral-700">
                  We release major updates monthly, with bug fixes and security patches as needed. 
                  Follow our <a href="/blog" className="text-brand-600 hover:underline">blog</a> for 
                  detailed release notes and feature announcements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
