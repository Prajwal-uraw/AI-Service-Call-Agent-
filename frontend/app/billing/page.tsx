"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calendar,
  Download,
  ArrowUpRight
} from "lucide-react";

export default function BillingPage() {
  const [currentPlan] = useState({
    tier: "professional",
    monthly_cost: 1497,
    setup_fee: 4997,
    max_calls: 1500,
    status: "active"
  });

  const [usage] = useState({
    calls_this_month: 87,
    total_calls: 342,
    billing_cycle_start: "2025-12-01",
    billing_cycle_end: "2025-12-31",
    next_billing_date: "2026-01-01"
  });

  // SECRET TIP #3: Health Score Breakdown
  const [healthMetrics] = useState({
    overall_score: 85,
    usage_score: 90,
    engagement_score: 85,
    payment_score: 100,
    support_score: 75
  });

  const usagePercentage = Math.round((usage.calls_this_month / currentPlan.max_calls) * 100);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-yellow-50";
    return "bg-red-50";
  };

  const invoices = [
    { id: "INV-001", date: "2025-12-01", amount: 1497, status: "paid" },
    { id: "INV-002", date: "2025-11-01", amount: 1497, status: "paid" },
    { id: "INV-003", date: "2025-10-01", amount: 6494, status: "paid", note: "Setup + First Month" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Billing & Usage</h1>
          <p className="text-gray-600">Manage your subscription and view usage</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Plan */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Plan
                  </span>
                  <Badge className="bg-blue-100 text-blue-800">ACTIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Professional Plan</h3>
                    <p className="text-gray-600">Perfect for growing HVAC companies</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Monthly Cost</p>
                      <p className="text-3xl font-bold text-blue-600">${currentPlan.monthly_cost}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Call Limit</p>
                      <p className="text-3xl font-bold">{currentPlan.max_calls}</p>
                      <p className="text-xs text-gray-500">calls/month</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Next Billing</p>
                      <p className="text-lg font-bold">Jan 1, 2026</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex gap-3">
                    <Button variant="outline" className="flex-1">
                      Change Plan
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                      Cancel Subscription
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage This Month */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold text-blue-600">{usage.calls_this_month}</p>
                      <p className="text-sm text-gray-600">of {currentPlan.max_calls} calls</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-400">{usagePercentage}%</p>
                      <p className="text-xs text-gray-500">used</p>
                    </div>
                  </div>

                  <div className="bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all ${
                        usagePercentage > 80 ? 'bg-orange-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Remaining Calls</p>
                      <p className="text-2xl font-bold">{currentPlan.max_calls - usage.calls_this_month}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Billing Cycle</p>
                      <p className="text-sm font-medium">Dec 1 - Dec 31</p>
                    </div>
                  </div>

                  {usagePercentage > 80 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-800 font-medium mb-1">⚠️ High Usage Alert</p>
                      <p className="text-xs text-orange-700">
                        You've used {usagePercentage}% of your monthly calls. Consider upgrading to Premium for unlimited calls.
                      </p>
                      <Button size="sm" className="mt-3 bg-orange-600 hover:bg-orange-700 text-white">
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Invoice History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Invoice History
                  </span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map(invoice => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-gray-600">{invoice.date}</p>
                          {invoice.note && (
                            <p className="text-xs text-gray-500 mt-1">{invoice.note}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">${invoice.amount}</p>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* SECRET TIP #3: Account Health Score */}
            <Card className={`border-2 ${getHealthBgColor(healthMetrics.overall_score)}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className={`h-5 w-5 ${getHealthColor(healthMetrics.overall_score)}`} />
                  Account Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getHealthColor(healthMetrics.overall_score)}`}>
                      {healthMetrics.overall_score}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Overall Score</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <HealthMetric 
                      label="Usage Rate"
                      score={healthMetrics.usage_score}
                      description="Healthy usage level"
                    />
                    <HealthMetric 
                      label="Engagement"
                      score={healthMetrics.engagement_score}
                      description="Regular activity"
                    />
                    <HealthMetric 
                      label="Payment Status"
                      score={healthMetrics.payment_score}
                      description="All payments current"
                    />
                    <HealthMetric 
                      label="Support"
                      score={healthMetrics.support_score}
                      description="Low ticket volume"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-600 mb-3">
                      💡 <strong>What affects your score:</strong>
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Using 20-80% of plan = healthy</li>
                      <li>• Regular calls = good engagement</li>
                      <li>• On-time payments = excellent</li>
                      <li>• Few support tickets = stable</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Options */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-purple-600" />
                  Upgrade to Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-purple-600">$2,497<span className="text-lg text-gray-600">/mo</span></p>
                    <p className="text-sm text-gray-600 mt-1">+ $9,997 setup fee</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm"><strong>Unlimited calls</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Multi-location support</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">Custom voice cloning</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm">24/7 priority support</span>
                    </div>
                  </div>

                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Upgrade Now
                  </Button>

                  <p className="text-xs text-center text-gray-600">
                    Pro-rated billing • Cancel anytime
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="bg-gray-100 p-2 rounded">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">•••• 4242</p>
                    <p className="text-xs text-gray-600">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Update Card
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthMetric({ label, score, description }: { label: string; score: number; description: string }) {
  const getColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <div className={`text-lg font-bold ${getColor(score)}`}>
        {score}
      </div>
    </div>
  );
}
