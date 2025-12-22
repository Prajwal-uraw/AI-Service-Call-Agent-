"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminShell from "@/components/AdminShell";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  MessageSquare,
  Bell,
  Mail,
  Sparkles,
  Send,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Phone,
  Calendar,
  Activity,
  BarChart3
} from "lucide-react";

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [aiGuruOpen, setAiGuruOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("ceo");
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  const stats = {
    total_tenants: 12,
    active_tenants: 10,
    mrr: 17964,
    arr: 215568,
    churn_rate: 5,
    avg_health_score: 82,
    total_calls_today: 234,
    pending_tasks: 8,
    unread_emails: 15
  };

  const roles = [
    { id: "ceo", name: "CEO", icon: Target, color: "purple", personality: "Strategic visionary focused on growth and market position" },
    { id: "cfo", name: "CFO", icon: DollarSign, color: "green", personality: "Numbers-driven, focused on profitability and cash flow" },
    { id: "cto", name: "CTO", icon: Zap, color: "blue", personality: "Technical expert focused on scalability and architecture" },
    { id: "sales", name: "Sales/Marketing", icon: TrendingUp, color: "orange", personality: "Revenue-focused, customer acquisition expert" },
    { id: "ops", name: "Admin/Ops", icon: Users, color: "indigo", personality: "Process-oriented, efficiency expert" },
    { id: "legal", name: "Legal", icon: AlertCircle, color: "red", personality: "Risk-averse, compliance-focused" }
  ];

  const aiPersonalities = {
    ceo: {
      systemPrompt: "You are a battle-tested CEO advisor with 20+ years scaling SaaS companies. You focus on growth, market position, and strategic decisions. You're direct, data-driven, and don't sugarcoat. Keep responses under 100 words. Only answer business-related questions about this company.",
      greeting: "What strategic decision needs my input?"
    },
    cfo: {
      systemPrompt: "You are a veteran CFO who's taken 5 companies public. You focus on unit economics, burn rate, and profitability. You're blunt about financial reality. Keep responses under 100 words. Only answer business-related financial questions.",
      greeting: "Show me the numbers. What's the financial question?"
    },
    cto: {
      systemPrompt: "You are a CTO who's built systems for 100M+ users. You focus on scalability, technical debt, and architecture. You're pragmatic about trade-offs. Keep responses under 100 words. Only answer technical business questions.",
      greeting: "What's the technical challenge?"
    },
    sales: {
      systemPrompt: "You are a VP Sales who's built multiple $100M ARR teams. You focus on pipeline, conversion, and customer acquisition. You're aggressive but realistic. Keep responses under 100 words. Only answer sales/marketing questions.",
      greeting: "What's blocking revenue growth?"
    },
    ops: {
      systemPrompt: "You are a COO who's scaled operations from 10 to 1000 employees. You focus on processes, efficiency, and team productivity. You're practical and systems-focused. Keep responses under 100 words. Only answer operational questions.",
      greeting: "What process needs optimization?"
    },
    legal: {
      systemPrompt: "You are a General Counsel for tech companies. You focus on compliance, risk, and legal protection. You're cautious but practical. Keep responses under 100 words. Only answer legal/compliance questions.",
      greeting: "What's the legal or compliance concern?"
    }
  };

  const handleAskAI = async () => {
    if (!aiMessage.trim()) return;

    setLoading(true);
    const userMessage = { role: "user", content: aiMessage };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      // Call OpenAI API with role-specific personality
      const response = await fetch("/api/ai-guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          message: aiMessage,
          systemPrompt: aiPersonalities[selectedRole as keyof typeof aiPersonalities].systemPrompt,
          context: {
            stats,
            currentStage: "Early growth - 12 tenants, $18K MRR",
            constraints: "Limited team, bootstrap budget",
            opportunities: "Multi-tenant SaaS, HVAC market"
          }
        })
      });

      const data = await response.json();
      const aiResponse = { role: "assistant", content: data.response };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Guru error:", error);
      const errorMsg = { role: "assistant", content: "Error connecting to AI Guru. Try again." };
      setChatHistory(prev => [...prev, errorMsg]);
    }

    setAiMessage("");
    setLoading(false);
  };

  return (
    <AdminShell>
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">Operations Dashboard</h1>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                <span className="text-slate-600">•</span>
                <span>{stats.active_tenants} active tenants</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setAiGuruOpen(!aiGuruOpen)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Guru
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* Active Tenants Card */}
          <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Tenants
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400 mb-2">{stats.active_tenants}</div>
              <p className="text-xs text-slate-500 mb-3">of {stats.total_tenants} total</p>
              <div className="bg-slate-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.active_tenants / stats.total_tenants) * 100}%` }}
                />
              </div>
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+2 this month</span>
              </div>
            </CardContent>
          </Card>

          {/* MRR Card */}
          <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400 mb-2">${stats.mrr.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mb-3">${stats.arr.toLocaleString()} ARR</p>
              <div className="bg-slate-700 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
              </div>
              <div className="flex items-center text-sm text-green-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+18% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Calls Today Card */}
          <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                Calls Today
              </CardTitle>
              <Phone className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400 mb-2">{stats.total_calls_today}</div>
              <p className="text-xs text-slate-500 mb-3">Across all tenants</p>
              <div className="bg-slate-700 rounded-full h-2 mb-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
              <div className="flex items-center text-sm text-purple-400">
                <Activity className="h-4 w-4 mr-1" />
                <span>Peak: 2-4 PM</span>
              </div>
            </CardContent>
          </Card>

          {/* Health Score Card */}
          <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                System Health
              </CardTitle>
              <AlertCircle className={`h-5 w-5 ${stats.avg_health_score >= 80 ? 'text-green-400' : 'text-yellow-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-2 ${stats.avg_health_score >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                {stats.avg_health_score}
              </div>
              <p className="text-xs text-slate-500 mb-3">{stats.churn_rate}% churn rate</p>
              <div className="bg-slate-700 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${stats.avg_health_score >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${stats.avg_health_score}%` }}
                />
              </div>
              <Badge className={stats.avg_health_score >= 80 ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-yellow-900/30 text-yellow-400 border-yellow-700'}>
                {stats.avg_health_score >= 80 ? '✓ Excellent' : '⚠️ Monitor'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Activity - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <>

                {/* Recent Activity */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-xl font-bold text-slate-100">Recent Activity</span>
                      <Badge variant="outline" className="text-sm border-slate-600 text-slate-300">{stats.total_calls_today} events today</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-600 p-2.5 rounded-lg">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">New tenant signed up</p>
                            <p className="text-sm text-slate-400">Acme Plumbing - Professional Plan</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">2h ago</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-600 p-2.5 rounded-lg">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">Payment received</p>
                            <p className="text-sm text-slate-400">$2,497 from Premium customer</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">4h ago</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-600 p-2.5 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">Health score dropped</p>
                            <p className="text-sm text-slate-400">Smith HVAC - from 85 to 62</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">6h ago</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors border border-slate-600">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-600 p-2.5 rounded-lg">
                            <Phone className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">High call volume</p>
                            <p className="text-sm text-slate-400">234 calls handled today</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Just now</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "customer-setup" && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Setup (Admin)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">Set up new customers on behalf of your team</p>
                    
                    <Button 
                      onClick={() => window.location.href = "/onboarding/phone-setup"}
                      className="w-full"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Start Customer Setup
                    </Button>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium mb-3">Recent Setups</h3>
                      <div className="space-y-2">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Acme HVAC</p>
                              <p className="text-sm text-gray-600">+1-555-123-4567</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Smith Plumbing</p>
                              <p className="text-sm text-gray-600">+1-555-987-6543</p>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "inbox" && (
              <Card>
                <CardHeader>
                  <CardTitle>Email Inbox (Resend)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-blue-100 text-blue-800">New Lead</Badge>
                            <span className="font-medium">john@hvacpro.com</span>
                          </div>
                          <p className="text-sm text-gray-600">Interested in Premium plan - wants demo</p>
                        </div>
                        <span className="text-xs text-gray-500">10m ago</span>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-green-100 text-green-800">Support</Badge>
                            <span className="font-medium">sarah@acmehvac.com</span>
                          </div>
                          <p className="text-sm text-gray-600">Question about call forwarding setup</p>
                        </div>
                        <span className="text-xs text-gray-500">1h ago</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Guru Sidebar - Takes 1 column */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-6 w-6 text-blue-400" />
                  <span className="text-slate-100 font-bold">AI Guru</span>
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">Your AI business advisor</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Role Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Expert</label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map(role => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-3 border rounded-lg text-left transition-all ${
                            selectedRole === role.id
                              ? `border-${role.color}-500 bg-${role.color}-50`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon className={`h-4 w-4 text-${role.color}-600 mb-1`} />
                          <div className="text-xs font-medium">{role.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="border rounded-lg p-4 bg-gray-50 h-64 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                      <p className="text-sm font-medium">
                        {aiPersonalities[selectedRole as keyof typeof aiPersonalities].greeting}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-blue-100 ml-8"
                              : "bg-white mr-8"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAskAI()}
                    placeholder="Ask for advice..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    disabled={loading}
                  />
                  <Button onClick={handleAskAI} disabled={loading} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ Brief, actionable answers only</p>
                  <p>✓ No sugarcoating, veteran SME advice</p>
                  <p>✓ Business questions only (3 personal/day)</p>
                  <p>✓ Uses GPT-4o for best recommendations</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-100">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500 transition-colors">
                  <CheckCircle className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="font-medium">View Pending Tasks ({stats.pending_tasks})</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500 transition-colors">
                  <Calendar className="h-4 w-4 mr-2 text-green-400" />
                  <span className="font-medium">Schedule Meeting</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500 transition-colors">
                  <BarChart3 className="h-4 w-4 mr-2 text-purple-400" />
                  <span className="font-medium">View Analytics</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500 transition-colors">
                  <MessageSquare className="h-4 w-4 mr-2 text-orange-400" />
                  <span className="font-medium">Team Chat</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
