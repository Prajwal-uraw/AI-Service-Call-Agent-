"use client"

import { useState } from 'react'
import { Search, Check, ExternalLink, Zap, Shield, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  logo: string
  features: string[]
  isPremium: boolean
  isPopular: boolean
  isConnected: boolean
  setupTime: string
}

const integrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Native platform connector for Salesforce with bidirectional data sync and workflow automation.',
    category: 'CRM',
    logo: '/integrations/salesforce.svg',
    features: ['Two-way sync', 'Real-time updates', 'Custom field mapping', 'Automated workflows'],
    isPremium: false,
    isPopular: true,
    isConnected: false,
    setupTime: '5 minutes'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Platform integration with HubSpot for automated lead routing and operational data pipelines.',
    category: 'CRM',
    logo: '/integrations/hubspot.svg',
    features: ['Contact sync', 'Deal tracking', 'Email integration', 'Marketing automation'],
    isPremium: false,
    isPopular: true,
    isConnected: true,
    setupTime: '5 minutes'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Automatically sync invoices, payments, and financial data with QuickBooks Online.',
    category: 'Accounting',
    logo: '/integrations/quickbooks.svg',
    features: ['Invoice sync', 'Payment tracking', 'Expense management', 'Financial reporting'],
    isPremium: false,
    isPopular: true,
    isConnected: false,
    setupTime: '10 minutes'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments securely and manage subscriptions with Stripe integration.',
    category: 'Payments',
    logo: '/integrations/stripe.svg',
    features: ['Payment processing', 'Subscription management', 'Refund handling', 'Webhook support'],
    isPremium: false,
    isPopular: true,
    isConnected: true,
    setupTime: '5 minutes'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Enable SMS notifications and voice calls through Twilio communication platform.',
    category: 'Communication',
    logo: '/integrations/twilio.svg',
    features: ['SMS notifications', 'Voice calls', 'Call recording', 'Number management'],
    isPremium: false,
    isPopular: true,
    isConnected: true,
    setupTime: '10 minutes'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get real-time notifications and updates in your Slack workspace.',
    category: 'Communication',
    logo: '/integrations/slack.svg',
    features: ['Real-time alerts', 'Custom channels', 'Bot commands', 'File sharing'],
    isPremium: false,
    isPopular: true,
    isConnected: false,
    setupTime: '3 minutes'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps through Zapier to automate your workflows.',
    category: 'Automation',
    logo: '/integrations/zapier.svg',
    features: ['5000+ app connections', 'Custom workflows', 'Multi-step zaps', 'Conditional logic'],
    isPremium: true,
    isPopular: true,
    isConnected: false,
    setupTime: '15 minutes'
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync appointments and service schedules with Google Calendar.',
    category: 'Scheduling',
    logo: '/integrations/google-calendar.svg',
    features: ['Calendar sync', 'Event creation', 'Reminder notifications', 'Availability checking'],
    isPremium: false,
    isPopular: true,
    isConnected: false,
    setupTime: '5 minutes'
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description: 'Collaborate with your team and receive notifications in Microsoft Teams.',
    category: 'Communication',
    logo: '/integrations/teams.svg',
    features: ['Team notifications', 'Channel integration', 'File sharing', 'Bot commands'],
    isPremium: false,
    isPopular: false,
    isConnected: false,
    setupTime: '5 minutes'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync customer lists and automate email marketing campaigns.',
    category: 'Marketing',
    logo: '/integrations/mailchimp.svg',
    features: ['List sync', 'Campaign automation', 'Segmentation', 'Analytics'],
    isPremium: false,
    isPopular: false,
    isConnected: false,
    setupTime: '10 minutes'
  },
  {
    id: 'servicetitan',
    name: 'ServiceTitan',
    description: 'Integrate with ServiceTitan for comprehensive field service management.',
    category: 'Field Service',
    logo: '/integrations/servicetitan.svg',
    features: ['Job sync', 'Technician dispatch', 'Inventory management', 'Customer portal'],
    isPremium: true,
    isPopular: true,
    isConnected: false,
    setupTime: '20 minutes'
  },
  {
    id: 'jobber',
    name: 'Jobber',
    description: 'Connect with Jobber to manage quotes, jobs, and invoicing.',
    category: 'Field Service',
    logo: '/integrations/jobber.svg',
    features: ['Quote management', 'Job scheduling', 'Invoice generation', 'Client communication'],
    isPremium: false,
    isPopular: false,
    isConnected: false,
    setupTime: '15 minutes'
  },
]

const categories = ['All', 'CRM', 'Accounting', 'Payments', 'Communication', 'Automation', 'Scheduling', 'Marketing', 'Field Service']

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showConnectedOnly, setShowConnectedOnly] = useState(false)

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'All' || integration.category === selectedCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesConnected = !showConnectedOnly || integration.isConnected
    return matchesCategory && matchesSearch && matchesConnected
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Platform Integrations
            </h1>
            <p className="text-xl text-brand-100 mb-8">
              Native connectors and RESTful API for seamless data pipelines and workflow automation
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-brand-100 rounded-lg">
                <Zap className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{integrations.length}+</p>
                <p className="text-sm text-neutral-600">Available Integrations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-success-100 rounded-lg">
                <Check className="h-6 w-6 text-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {integrations.filter(i => i.isConnected).length}
                </p>
                <p className="text-sm text-neutral-600">Connected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-warning-100 rounded-lg">
                <Shield className="h-6 w-6 text-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">Enterprise</p>
                <p className="text-sm text-neutral-600">Grade Security</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="all" onClick={() => setShowConnectedOnly(false)}>
              All Integrations
            </TabsTrigger>
            <TabsTrigger value="connected" onClick={() => setShowConnectedOnly(true)}>
              Connected
            </TabsTrigger>
            <TabsTrigger value="popular">
              Popular
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-brand-600">
                      {integration.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {integration.isPopular && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {integration.isPremium && (
                      <Badge className="bg-warning-500 text-white text-xs">
                        Premium
                      </Badge>
                    )}
                    {integration.isConnected && (
                      <Badge className="bg-success-500 text-white text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">{integration.name}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-neutral-700">Key Features:</p>
                  <ul className="space-y-1">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="text-sm text-neutral-600 flex items-start gap-2">
                        <Check className="h-4 w-4 text-success-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Badge variant="outline" className="text-xs">
                    {integration.category}
                  </Badge>
                  <span>•</span>
                  <span>{integration.setupTime} setup</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                {integration.isConnected ? (
                  <>
                    <Button variant="outline" className="flex-1">
                      Configure
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button className="flex-1 bg-brand-600 hover:bg-brand-700">
                    Connect
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600 text-lg">No integrations found matching your criteria.</p>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-8 sm:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Integration?</h2>
          <p className="text-brand-100 mb-8 max-w-2xl mx-auto">
            Our team can build custom integrations tailored to your specific needs. Contact us to discuss your requirements.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50">
              Request Custom Integration
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              View API Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
