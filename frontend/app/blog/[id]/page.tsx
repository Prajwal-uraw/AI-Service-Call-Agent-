"use client"

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Share2, Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface BlogPost {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
    role: string
    bio: string
  }
  publishedAt: string
  readTime: string
  category: string
  tags: string[]
}

const blogPostData: Record<string, BlogPost> = {
  '1': {
    id: '1',
    title: 'How AI Voice Agents Are Transforming HVAC Service Calls',
    content: `
      <h2>The Evolution of Customer Service in HVAC</h2>
      <p>The HVAC industry has traditionally relied on phone calls and manual scheduling for service requests. This approach, while functional, often leads to missed calls, scheduling conflicts, and frustrated customers waiting on hold.</p>
      
      <p>AI voice agents are changing this paradigm by providing 24/7 availability, instant response times, and intelligent routing of service requests. These systems can handle multiple calls simultaneously, ensuring no customer is left waiting.</p>
      
      <h2>Key Benefits of AI Voice Agents</h2>
      <ul>
        <li><strong>24/7 Availability:</strong> Never miss a service call, even outside business hours</li>
        <li><strong>Instant Response:</strong> Customers get immediate assistance without waiting on hold</li>
        <li><strong>Intelligent Routing:</strong> Calls are automatically directed to the right technician based on location and expertise</li>
        <li><strong>Consistent Quality:</strong> Every customer receives the same high-quality service experience</li>
        <li><strong>Cost Efficiency:</strong> Reduce staffing costs while improving service quality</li>
      </ul>
      
      <h2>Real-World Impact</h2>
      <p>HVAC companies implementing AI voice agents have reported significant improvements in key metrics:</p>
      <ul>
        <li>40% reduction in missed calls</li>
        <li>60% faster response times</li>
        <li>35% increase in customer satisfaction scores</li>
        <li>25% improvement in first-call resolution rates</li>
      </ul>
      
      <h2>Implementation Best Practices</h2>
      <p>To successfully implement AI voice agents in your HVAC business, consider these best practices:</p>
      <ol>
        <li>Start with a pilot program to test the system with a subset of customers</li>
        <li>Train your team on how to work alongside the AI system</li>
        <li>Monitor performance metrics and adjust as needed</li>
        <li>Gather customer feedback and iterate on the experience</li>
        <li>Ensure seamless handoff between AI and human agents when needed</li>
      </ol>
      
      <h2>The Future of HVAC Customer Service</h2>
      <p>As AI technology continues to advance, we can expect even more sophisticated capabilities, including predictive maintenance scheduling, personalized service recommendations, and integration with smart home systems.</p>
      
      <p>The key to success is viewing AI as a tool to enhance human capabilities, not replace them. The best implementations combine the efficiency of AI with the empathy and problem-solving skills of human technicians.</p>
    `,
    author: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      role: 'Product Manager',
      bio: 'Sarah has over 10 years of experience in SaaS product management, specializing in AI-powered solutions for service industries.'
    },
    publishedAt: '2024-01-15',
    readTime: '5 min read',
    category: 'Industry Insights',
    tags: ['AI', 'HVAC', 'Customer Service']
  }
}

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const post = blogPostData[id] || blogPostData['1']

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog">
            <Button variant="ghost" className="text-white hover:text-brand-100 mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
          <div className="max-w-4xl mx-auto">
            <Badge className="bg-white text-brand-700 mb-4">
              {post.category}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-brand-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{post.author.name}</p>
                  <p className="text-sm">{post.author.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-8">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>

          <Card className="mb-8">
            <CardContent className="prose prose-lg max-w-none p-8">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <Card className="bg-brand-50 border-brand-200">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 font-semibold text-xl shrink-0">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    About {post.author.name}
                  </h3>
                  <p className="text-neutral-700 mb-3">{post.author.bio}</p>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Badge className="mb-3">Best Practices</Badge>
                  <h3 className="text-lg font-bold mb-2">
                    10 Ways to Improve Your Service Call Response Time
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    Learn practical strategies to reduce response times and increase customer satisfaction.
                  </p>
                  <Link href="/blog/2">
                    <Button variant="ghost" size="sm">
                      Read Article
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Badge className="mb-3">ROI & Analytics</Badge>
                  <h3 className="text-lg font-bold mb-2">
                    The ROI of Automating Your HVAC Service Scheduling
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4">
                    A comprehensive analysis of how automation can impact your bottom line.
                  </p>
                  <Link href="/blog/3">
                    <Button variant="ghost" size="sm">
                      Read Article
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
