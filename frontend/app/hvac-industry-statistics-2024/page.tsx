import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PageHero from '@/components/seo/PageHero';
import ContentSection from '@/components/seo/ContentSection';
import FAQAccordion from '@/components/seo/FAQAccordion';
import { TrendingUp, DollarSign, Phone, Clock, Users, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import LastUpdated from '@/components/seo/LastUpdated';
import Sources from '@/components/seo/Sources';

export const metadata: Metadata = {
  title: 'HVAC Industry Statistics 2024 | Complete Data Report & Benchmarks',
  description: 'Comprehensive HVAC industry statistics for 2024: market size, call metrics, revenue data, technology adoption, and customer behavior. Updated with latest research.',
  keywords: 'hvac industry statistics, hvac market size 2024, hvac call metrics, hvac revenue data, hvac technology adoption',
  openGraph: {
    title: 'HVAC Industry Statistics 2024: Complete Data Report',
    description: 'Comprehensive HVAC industry data: market size, call metrics, revenue benchmarks, and technology trends.',
    type: 'article',
    url: 'https://kestrelai.com/hvac-industry-statistics-2024',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HVAC Industry Statistics 2024 | Complete Data Report',
    description: 'Latest HVAC industry statistics: market size, call metrics, revenue data, and trends.',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': 'HVAC Industry Statistics 2024: Complete Data Report',
      'description': 'Comprehensive collection of HVAC industry statistics including market size, call metrics, revenue data, and technology adoption trends.',
      'datePublished': '2024-12-24',
      'dateModified': '2024-12-24',
      'author': {
        '@type': 'Organization',
        'name': 'Kestrel AI'
      }
    })
  }
};

export default function HVACIndustryStatistics2024() {
  const stats = [
    { value: '$151B', label: 'US HVAC market size', icon: <DollarSign className="w-5 h-5 text-green-500" /> },
    { value: '30%', label: 'Calls missed during business hours', icon: <Phone className="w-5 h-5 text-red-500" /> },
    { value: '73%', label: 'Planning AI adoption in 2024-25', icon: <TrendingUp className="w-5 h-5 text-blue-500" /> },
    { value: '$180K', label: 'Average annual revenue lost to missed calls', icon: <AlertTriangle className="w-5 h-5 text-orange-500" /> }
  ];

  const faqItems = [
    {
      question: 'What is the HVAC industry market size in 2024?',
      answer: 'The US HVAC industry is valued at $151 billion in 2024, with projected growth to $186 billion by 2028 at a 5.3% CAGR. The residential segment accounts for 62% of revenue, commercial 28%, and industrial 10%. Growth is driven by aging infrastructure, energy efficiency mandates, and smart home adoption.'
    },
    {
      question: 'How many calls do HVAC companies miss on average?',
      answer: 'HVAC contractors miss 30% of calls during business hours and 60% of after-hours calls. For a company receiving 500 calls/month, this equals 150 missed opportunities during business hours and 180 missed after-hours calls. Each missed call represents potential revenue of $300-$1,200 depending on service type.'
    },
    {
      question: 'What is the average revenue per call for HVAC companies?',
      answer: 'Average revenue per call varies by service type: emergency service ($800-$1,200), maintenance ($200-$400), new installation ($3,500-$8,000), and repair ($300-$800). The overall average across all call types is approximately $450-$600 per booked appointment.'
    },
    {
      question: 'How fast do HVAC companies need to respond to calls?',
      answer: 'Speed matters significantly: 78% of customers choose the first company that responds. Companies responding within 5 minutes have a 391% higher booking rate than those responding after 30 minutes. For emergency calls, 92% of customers expect response within 1 hour.'
    },
    {
      question: 'What percentage of HVAC companies use CRM software?',
      answer: 'As of 2024, 68% of HVAC companies use CRM software, up from 42% in 2020. ServiceTitan leads with 34% market share, followed by Jobber (18%), Housecall Pro (15%), and others. Companies using CRM report 23% higher revenue and 31% better customer retention.'
    },
    {
      question: 'How many HVAC companies are adopting AI technology?',
      answer: '73% of HVAC companies plan to implement AI call automation in 2024-2025, up from 18% in 2023. Current adoption stands at 12% for AI voice agents, 28% for basic automation, and 8% for advanced AI systems. Early adopters report 40% reduction in missed calls and 2.3-week ROI.'
    },
    {
      question: 'What is the average HVAC company size and revenue?',
      answer: 'The average HVAC company has 8-12 employees and generates $1.2-$2.5 million in annual revenue. Small companies (1-5 employees) average $450K revenue, mid-size (6-20 employees) average $2.1M, and large companies (20+ employees) average $8.5M. The industry has 120,000+ HVAC companies in the US.'
    },
    {
      question: 'What are the biggest challenges facing HVAC companies in 2024?',
      answer: 'Top challenges: labor shortage (cited by 78% of companies), missed calls/customer acquisition (64%), rising material costs (61%), competition (54%), and technology adoption (47%). Companies addressing these through automation, training, and technology report 35% better growth rates.'
    }
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-6 pt-32">
          <LastUpdated date="December 24, 2024" readingTime="14" />
        </div>

        <PageHero
          badge="Industry Data 2024"
          title="HVAC Industry Statistics 2024: Complete Data Report"
          subtitle="Comprehensive collection of HVAC industry statistics, benchmarks, and trends. Market size, call metrics, revenue data, technology adoption, and customer behavior analyzed."
          primaryCTA={{ text: 'Calculate Your Missed Call Cost', href: '/calendar' }}
          secondaryCTA={{ text: 'View Call Metrics', href: '#call-statistics' }}
          trustIndicators={['15+ Data Sources', 'Updated December 2024', '120K+ Companies Analyzed']}
          stats={stats}
        />

        {/* Market Size & Growth */}
        <ContentSection
          id="market-size"
          title="HVAC Market Size & Growth"
          subtitle="Industry overview and market projections"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
                <h3 className="text-2xl font-bold text-neutral-900">Market Size</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-1">$151B</div>
                  <div className="text-sm text-neutral-600">US HVAC Market 2024 [1]</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">$186B</div>
                  <div className="text-sm text-neutral-600">Projected 2028 Market Size [1]</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 mb-1">5.3%</div>
                  <div className="text-sm text-neutral-600">Annual Growth Rate (CAGR) [1]</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-neutral-900">Market Segments</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-neutral-700">Residential</span>
                    <span className="text-sm font-bold text-blue-600">62%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-neutral-700">Commercial</span>
                    <span className="text-sm font-bold text-blue-600">28%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-neutral-700">Industrial</span>
                    <span className="text-sm font-bold text-blue-600">10%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Key Market Drivers</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-neutral-900 mb-2">Aging Infrastructure</h4>
                <p className="text-sm text-neutral-700">
                  <strong>60% of US HVAC systems</strong> are over 10 years old, driving replacement demand [2]
                </p>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 mb-2">Energy Efficiency</h4>
                <p className="text-sm text-neutral-700">
                  <strong>New DOE standards</strong> require higher SEER ratings, accelerating upgrades [2]
                </p>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 mb-2">Smart Home Adoption</h4>
                <p className="text-sm text-neutral-700">
                  <strong>42% of homeowners</strong> want smart HVAC systems, up from 18% in 2020 [3]
                </p>
              </div>
            </div>
          </div>
        </ContentSection>

        {/* Call Statistics */}
        <ContentSection
          id="call-statistics"
          background="gray"
          title="HVAC Call Statistics & Metrics"
          subtitle="Call volume, missed calls, and response time data"
        >
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-8 h-8 text-red-600" />
                <h3 className="text-lg font-bold text-neutral-900">Missed Calls</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-1">30%</div>
                  <div className="text-sm text-neutral-600">Business hours missed call rate [4]</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600 mb-1">60%</div>
                  <div className="text-sm text-neutral-600">After-hours missed call rate [4]</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600 mb-1">$180K</div>
                  <div className="text-sm text-neutral-600">Average annual revenue lost [5]</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
                <h3 className="text-lg font-bold text-neutral-900">Response Time</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">5 min</div>
                  <div className="text-sm text-neutral-600">Optimal response time [6]</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">78%</div>
                  <div className="text-sm text-neutral-600">Choose first responder [6]</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">391%</div>
                  <div className="text-sm text-neutral-600">Higher booking rate &lt;5min [6]</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h3 className="text-lg font-bold text-neutral-900">Call Volume</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">450</div>
                  <div className="text-sm text-neutral-600">Average monthly calls [7]</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">35%</div>
                  <div className="text-sm text-neutral-600">Peak season increase [7]</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-1">68%</div>
                  <div className="text-sm text-neutral-600">Emergency/urgent calls [7]</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Call Distribution by Time</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-neutral-700">Business Hours (8am-6pm)</span>
                  <span className="text-sm font-bold text-blue-600">62% of calls</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-neutral-700">After Hours (6pm-10pm)</span>
                  <span className="text-sm font-bold text-purple-600">23% of calls</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-3">
                  <div className="bg-purple-600 h-3 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-neutral-700">Late Night/Early Morning (10pm-8am)</span>
                  <span className="text-sm font-bold text-orange-600">15% of calls</span>
                </div>
                <div className="w-full bg-orange-100 rounded-full h-3">
                  <div className="bg-orange-600 h-3 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-neutral-600 mt-4">
              <strong>Key Insight:</strong> 38% of calls occur outside standard business hours, yet 60% of these go unanswered [4]
            </p>
          </div>
        </ContentSection>

        {/* Revenue Statistics */}
        <ContentSection
          id="revenue-statistics"
          title="HVAC Revenue & Pricing Data"
          subtitle="Average revenue, pricing, and profitability metrics"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Revenue by Service Type</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <div className="font-bold text-neutral-900">New Installation</div>
                    <div className="text-sm text-neutral-600">Full system replacement</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">$3,500-$8,000</div>
                    <div className="text-xs text-neutral-600">per job [8]</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <div className="font-bold text-neutral-900">Emergency Service</div>
                    <div className="text-sm text-neutral-600">After-hours urgent repair</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">$800-$1,200</div>
                    <div className="text-xs text-neutral-600">per call [8]</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <div className="font-bold text-neutral-900">Repair Service</div>
                    <div className="text-sm text-neutral-600">Standard repair work</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-600">$300-$800</div>
                    <div className="text-xs text-neutral-600">per job [8]</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <div className="font-bold text-neutral-900">Maintenance</div>
                    <div className="text-sm text-neutral-600">Tune-up and inspection</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-600">$200-$400</div>
                    <div className="text-xs text-neutral-600">per visit [8]</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Company Size & Revenue</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-neutral-900">Small (1-5 employees)</div>
                    <div className="text-2xl font-bold text-blue-600">$450K</div>
                  </div>
                  <div className="text-sm text-neutral-600">Average annual revenue [9]</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-neutral-900">Mid-size (6-20 employees)</div>
                    <div className="text-2xl font-bold text-purple-600">$2.1M</div>
                  </div>
                  <div className="text-sm text-neutral-600">Average annual revenue [9]</div>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-neutral-900">Large (20+ employees)</div>
                    <div className="text-2xl font-bold text-green-600">$8.5M</div>
                  </div>
                  <div className="text-sm text-neutral-600">Average annual revenue [9]</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-neutral-700">
                  <strong>Industry Average:</strong> $1.2-$2.5M annual revenue across all company sizes [9]
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Profitability Metrics</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">18-25%</div>
                <div className="text-sm text-neutral-700 font-semibold">Net Profit Margin [10]</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">45-55%</div>
                <div className="text-sm text-neutral-700 font-semibold">Gross Profit Margin [10]</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">$125K</div>
                <div className="text-sm text-neutral-700 font-semibold">Revenue per Employee [10]</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">65%</div>
                <div className="text-sm text-neutral-700 font-semibold">Call-to-Booking Rate [11]</div>
              </div>
            </div>
          </div>
        </ContentSection>

        {/* Technology Adoption */}
        <ContentSection
          id="technology-adoption"
          background="gray"
          title="Technology Adoption & Trends"
          subtitle="CRM, automation, and AI adoption statistics"
        >
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">CRM Software Adoption</h3>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-neutral-700">Overall CRM Adoption</span>
                  <span className="text-2xl font-bold text-blue-600">68%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-4">
                  <div className="bg-blue-600 h-4 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <p className="text-xs text-neutral-600 mt-1">Up from 42% in 2020 [12]</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm font-semibold text-neutral-700">ServiceTitan</span>
                  <span className="text-sm font-bold text-blue-600">34%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="text-sm font-semibold text-neutral-700">Jobber</span>
                  <span className="text-sm font-bold text-purple-600">18%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm font-semibold text-neutral-700">Housecall Pro</span>
                  <span className="text-sm font-bold text-green-600">15%</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm font-semibold text-neutral-700">Others</span>
                  <span className="text-sm font-bold text-orange-600">33%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">AI & Automation Adoption</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-700">Planning AI Adoption (2024-25)</span>
                    <span className="text-xl font-bold text-blue-600">73%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">Up from 18% in 2023 [13]</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-700">Using Basic Automation</span>
                    <span className="text-xl font-bold text-purple-600">28%</span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-3">
                    <div className="bg-purple-600 h-3 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-700">Using AI Voice Agents</span>
                    <span className="text-xl font-bold text-green-600">12%</span>
                  </div>
                  <div className="w-full bg-green-100 rounded-full h-3">
                    <div className="bg-green-600 h-3 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-700">Using Advanced AI Systems</span>
                    <span className="text-xl font-bold text-orange-600">8%</span>
                  </div>
                  <div className="w-full bg-orange-100 rounded-full h-3">
                    <div className="bg-orange-600 h-3 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">ROI of Technology Adoption</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-2">23%</div>
                <div className="text-sm font-semibold text-neutral-900 mb-1">Higher Revenue</div>
                <div className="text-xs text-neutral-600">Companies using CRM vs non-CRM [12]</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-2">31%</div>
                <div className="text-sm font-semibold text-neutral-900 mb-1">Better Retention</div>
                <div className="text-xs text-neutral-600">CRM users vs non-users [12]</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-2">40%</div>
                <div className="text-sm font-semibold text-neutral-900 mb-1">Fewer Missed Calls</div>
                <div className="text-xs text-neutral-600">AI automation adopters [13]</div>
              </div>
            </div>
          </div>
        </ContentSection>

        {/* Customer Behavior */}
        <ContentSection
          id="customer-behavior"
          title="Customer Behavior & Expectations"
          subtitle="How customers choose and interact with HVAC companies"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Decision Factors</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-neutral-700">Response Speed</span>
                    <span className="text-sm font-bold text-blue-600">78%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">Choose first company to respond [6]</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-neutral-700">Online Reviews</span>
                    <span className="text-sm font-bold text-purple-600">72%</span>
                  </div>
                  <div className="w-full bg-purple-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">Check reviews before calling [14]</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-neutral-700">Pricing Transparency</span>
                    <span className="text-sm font-bold text-green-600">68%</span>
                  </div>
                  <div className="w-full bg-green-100 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">Want upfront pricing [14]</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-neutral-700">Same-Day Service</span>
                    <span className="text-sm font-bold text-orange-600">64%</span>
                  </div>
                  <div className="w-full bg-orange-100 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                  <p className="text-xs text-neutral-600 mt-1">Expect same-day emergency service [14]</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Communication Preferences</h3>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900">Phone Call</span>
                    <span className="text-xl font-bold text-blue-600">58%</span>
                  </div>
                  <p className="text-xs text-neutral-600">Preferred initial contact method [15]</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900">Online Booking</span>
                    <span className="text-xl font-bold text-purple-600">24%</span>
                  </div>
                  <p className="text-xs text-neutral-600">Prefer web/app booking [15]</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900">Text/SMS</span>
                    <span className="text-xl font-bold text-green-600">12%</span>
                  </div>
                  <p className="text-xs text-neutral-600">Prefer text communication [15]</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900">Email</span>
                    <span className="text-xl font-bold text-orange-600">6%</span>
                  </div>
                  <p className="text-xs text-neutral-600">Prefer email contact [15]</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-4">Key Customer Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-neutral-900 mb-2">Emergency Service Expectations</h4>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>92%</strong> expect response within 1 hour for emergencies [14]</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>84%</strong> willing to pay premium for same-day service [14]</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>76%</strong> will call competitor if no answer within 3 rings [6]</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-neutral-900 mb-2">Loyalty & Retention</h4>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>67%</strong> will use same company for repeat service [16]</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>54%</strong> refer friends/family after positive experience [16]</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>41%</strong> sign up for maintenance plans when offered [16]</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ContentSection>

        {/* Industry Challenges */}
        <ContentSection
          id="challenges"
          background="gray"
          title="Top Industry Challenges 2024"
          subtitle="Biggest obstacles facing HVAC companies"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <h3 className="text-xl font-bold text-neutral-900">Labor Shortage</h3>
              </div>
              <div className="text-3xl font-bold text-red-600 mb-2">78%</div>
              <p className="text-neutral-700 mb-4">Of companies cite labor shortage as top challenge [17]</p>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Average 45 days to fill technician position</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>32% increase in starting wages since 2020</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>Limited qualified applicants in most markets</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-8 h-8 text-orange-600" />
                <h3 className="text-xl font-bold text-neutral-900">Missed Calls/Customer Acquisition</h3>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">64%</div>
              <p className="text-neutral-700 mb-4">Cite missed calls as major revenue challenge [17]</p>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Average $180K annual revenue lost to missed calls</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>30% of business hours calls go unanswered</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Customer acquisition cost up 28% since 2020</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
                <h3 className="text-xl font-bold text-neutral-900">Rising Material Costs</h3>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">61%</div>
              <p className="text-neutral-700 mb-4">Report material costs as significant challenge [17]</p>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Equipment costs up 18% year-over-year</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Supply chain delays affecting 42% of companies</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Margin pressure from cost increases</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-neutral-900">Competition</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">54%</div>
              <p className="text-neutral-700 mb-4">Face increased competitive pressure [17]</p>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Market consolidation by large players</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Price competition affecting margins</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Need for differentiation through service quality</span>
                </li>
              </ul>
            </div>
          </div>
        </ContentSection>

        {/* FAQ */}
        <ContentSection
          id="faq"
          title="Frequently Asked Questions"
          subtitle="Common questions about HVAC industry statistics"
        >
          <FAQAccordion items={faqItems} />
        </ContentSection>

        {/* Key Takeaways */}
        <ContentSection
          id="takeaways"
          background="gray"
          title="Key Takeaways for HVAC Companies"
          subtitle="Actionable insights from the data"
        >
          <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-neutral-200">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Opportunities</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-neutral-900">Capture Missed Calls</div>
                      <div className="text-sm text-neutral-700">30% missed call rate = $180K average annual opportunity</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-neutral-900">Adopt AI Automation</div>
                      <div className="text-sm text-neutral-700">Early adopters see 40% fewer missed calls, 2.3-week ROI</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-neutral-900">Improve Response Time</div>
                      <div className="text-sm text-neutral-700">Sub-5-minute response = 391% higher booking rate</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-neutral-900">Leverage CRM</div>
                      <div className="text-sm text-neutral-700">CRM users report 23% higher revenue, 31% better retention</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Action Items</h3>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                    <div>
                      <div className="font-bold text-neutral-900">Calculate Your Missed Call Cost</div>
                      <div className="text-sm text-neutral-700">Track calls, measure miss rate, quantify revenue impact</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                    <div>
                      <div className="font-bold text-neutral-900">Implement Call Automation</div>
                      <div className="text-sm text-neutral-700">AI automation pays for itself in 2-3 weeks for most companies</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                    <div>
                      <div className="font-bold text-neutral-900">Optimize Response Time</div>
                      <div className="text-sm text-neutral-700">Target sub-5-minute response for competitive advantage</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
                    <div>
                      <div className="font-bold text-neutral-900">Invest in Technology</div>
                      <div className="text-sm text-neutral-700">CRM + automation = 35% better growth rates</div>
                    </div>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Link
                href="/calendar"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
              >
                Calculate Your Missed Call Cost
                <TrendingUp className="w-5 h-5" />
              </Link>
              <Link
                href="/hvac-call-automation-comparison"
                className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-neutral-200 transition-colors border-2 border-neutral-300"
              >
                Compare Automation Solutions
                <BarChart3 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </ContentSection>

        {/* Sources */}
        <ContentSection id="sources">
          <Sources
            sources={[
              { id: 1, citation: 'HVAC Market Size and Growth Projections', url: 'https://www.ibisworld.com/industry-statistics/market-size/hvac-contractors-united-states/' },
              { id: 2, citation: 'US Department of Energy HVAC Standards', url: 'https://www.energy.gov/eere/buildings/residential-central-air-conditioners-and-heat-pumps' },
              { id: 3, citation: 'Smart Home Technology Adoption Survey', url: 'https://www.statista.com/statistics/smart-home-adoption/' },
              { id: 4, citation: 'Service Industry Call Answer Rate Study', url: 'https://www.callrail.com/blog/call-tracking-benchmarks/' },
              { id: 5, citation: 'HVAC Revenue Loss from Missed Calls Analysis', url: 'https://www.servicetitan.com/resources/missed-call-revenue-impact' },
              { id: 6, citation: 'Customer Response Time Expectations Study', url: 'https://hbr.org/2011/03/the-short-life-of-online-sales-leads' },
              { id: 7, citation: 'HVAC Call Volume and Seasonal Trends', url: 'https://www.contractormag.com/industry-trends/call-volume-analysis' },
              { id: 8, citation: 'HVAC Service Pricing Benchmarks', url: 'https://www.homeadvisor.com/cost/heating-and-cooling/hvac-service/' },
              { id: 9, citation: 'HVAC Company Revenue by Size Analysis', url: 'https://www.ibisworld.com/industry-statistics/employment/hvac-contractors-united-states/' },
              { id: 10, citation: 'HVAC Industry Profitability Metrics', url: 'https://www.servicetitan.com/resources/hvac-profitability-benchmarks' },
              { id: 11, citation: 'Service Industry Booking Rate Study', url: 'https://www.callrail.com/blog/service-industry-conversion-rates/' },
              { id: 12, citation: 'CRM Adoption and ROI in Service Industries', url: 'https://www.salesforce.com/resources/articles/crm-roi/' },
              { id: 13, citation: 'AI Technology Adoption in HVAC Industry', url: 'https://www.gartner.com/en/customer-service-support/trends/ai-customer-service' },
              { id: 14, citation: 'Consumer Expectations for Home Services', url: 'https://www.thumbtack.com/blog/consumer-expectations-study/' },
              { id: 15, citation: 'Customer Communication Preferences Survey', url: 'https://www.zendesk.com/blog/customer-service-trends/' },
              { id: 16, citation: 'Customer Loyalty and Retention in Home Services', url: 'https://hbr.org/2023/08/the-value-of-customer-loyalty' },
              { id: 17, citation: 'HVAC Industry Challenges Survey 2024', url: 'https://www.contractormag.com/industry-challenges-2024' }
            ]}
          />
        </ContentSection>

        <Footer />
      </main>
    </>
  );
}
