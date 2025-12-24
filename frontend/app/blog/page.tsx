"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: {
    name: string
    avatar: string
    role: string
  }
  publishedAt: string
  readTime: string
  category: string
  tags: string[]
  image: string
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'How AI Voice Agents Are Transforming HVAC Service Calls',
    excerpt: 'Discover how artificial intelligence is revolutionizing customer service in the HVAC industry, reducing response times and improving customer satisfaction.',
    content: '',
    author: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      role: 'Product Manager'
    },
    publishedAt: '2024-01-15',
    readTime: '5 min read',
    category: 'Industry Insights',
    tags: ['AI', 'HVAC', 'Customer Service'],
    image: '/blog/ai-voice-agents.jpg'
  },
  {
    id: '2',
    title: '10 Ways to Improve Your Service Call Response Time',
    excerpt: 'Learn practical strategies to reduce response times and increase customer satisfaction in your HVAC business.',
    content: '',
    author: {
      name: 'Michael Chen',
      avatar: '/avatars/michael.jpg',
      role: 'Customer Success Lead'
    },
    publishedAt: '2024-01-10',
    readTime: '7 min read',
    category: 'Best Practices',
    tags: ['Operations', 'Efficiency', 'Tips'],
    image: '/blog/response-time.jpg'
  },
  {
    id: '3',
    title: 'The ROI of Automating Your HVAC Service Scheduling',
    excerpt: 'A comprehensive analysis of how automation can impact your bottom line and improve operational efficiency.',
    content: '',
    author: {
      name: 'David Martinez',
      avatar: '/avatars/david.jpg',
      role: 'Solutions Architect'
    },
    publishedAt: '2024-01-05',
    readTime: '6 min read',
    category: 'ROI & Analytics',
    tags: ['Automation', 'ROI', 'Analytics'],
    image: '/blog/roi-automation.jpg'
  },
  {
    id: '4',
    title: 'Customer Experience Trends in Home Services 2024',
    excerpt: 'Stay ahead of the curve with the latest trends shaping customer expectations in the home services industry.',
    content: '',
    author: {
      name: 'Emily Rodriguez',
      avatar: '/avatars/emily.jpg',
      role: 'Industry Analyst'
    },
    publishedAt: '2024-01-01',
    readTime: '8 min read',
    category: 'Trends',
    tags: ['CX', 'Trends', '2024'],
    image: '/blog/cx-trends.jpg'
  },
]

const categories = ['All', 'Industry Insights', 'Best Practices', 'ROI & Analytics', 'Trends', 'Case Studies']

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              HVAC AI Insights & Resources
            </h1>
            <p className="text-xl text-brand-100 mb-8">
              Expert insights, industry trends, and practical guides to help you grow your HVAC business
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0">
                <div className="relative h-48 bg-gradient-to-br from-brand-100 to-brand-200 rounded-t-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-brand-600 font-semibold">
                    {post.title.substring(0, 30)}...
                  </div>
                  <Badge className="absolute top-4 left-4 bg-white text-brand-700">
                    {post.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-brand-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-neutral-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold">
                      {post.author.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{post.author.name}</p>
                      <p className="text-xs text-neutral-600">{post.author.role}</p>
                    </div>
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <Button variant="ghost" size="sm" className="group-hover:text-brand-600">
                      Read <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-600 text-lg">No articles found matching your criteria.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      </div>

      <div className="bg-brand-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-brand-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest insights, tips, and industry news delivered to your inbox.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <Button className="bg-white text-brand-700 hover:bg-brand-50">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
