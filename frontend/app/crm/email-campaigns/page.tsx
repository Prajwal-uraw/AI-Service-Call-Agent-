"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail,
  Plus,
  Send,
  Edit,
  Trash,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  RefreshCw
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  total_recipients: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  scheduled_at: string;
  sent_at: string;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subject: string;
  is_active: boolean;
}

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchTemplates()
      ]);
    } catch (error) {
      console.error("Failed to fetch email data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/crm/email-marketing/campaigns`);
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/crm/email-marketing/templates`);
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500",
      scheduled: "bg-blue-500",
      sending: "bg-yellow-500",
      sent: "bg-green-500",
      cancelled: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getOpenRate = (campaign: EmailCampaign) => {
    if (campaign.total_sent === 0) return 0;
    return ((campaign.total_opened / campaign.total_sent) * 100).toFixed(1);
  };

  const getClickRate = (campaign: EmailCampaign) => {
    if (campaign.total_sent === 0) return 0;
    return ((campaign.total_clicked / campaign.total_sent) * 100).toFixed(1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Marketing</h1>
          <p className="text-gray-600">Manage campaigns and templates</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowNewTemplate(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
          <Button onClick={() => setShowNewCampaign(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {campaigns.reduce((sum, c) => sum + c.total_sent, 0)}
            </div>
            <p className="text-xs text-gray-500">Emails delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {campaigns.length > 0
                ? (campaigns.reduce((sum, c) => sum + parseFloat(getOpenRate(c)), 0) / campaigns.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-gray-500">Across all campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {campaigns.length > 0
                ? (campaigns.reduce((sum, c) => sum + parseFloat(getClickRate(c)), 0) / campaigns.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-gray-500">Across all campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No campaigns yet</p>
              <Button onClick={() => setShowNewCampaign(true)} className="mt-4">
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        <Badge className={getStatusBadge(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Subject:</strong> {campaign.subject}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{campaign.total_recipients} recipients</span>
                        </div>
                        {campaign.sent_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Sent {new Date(campaign.sent_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {campaign.total_sent > 0 && (
                    <div className="grid grid-cols-4 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-xs text-gray-600">Sent</p>
                        <p className="text-lg font-semibold">{campaign.total_sent}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Opened</p>
                        <p className="text-lg font-semibold text-green-600">
                          {campaign.total_opened} ({getOpenRate(campaign)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Clicked</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {campaign.total_clicked} ({getClickRate(campaign)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Performance</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold">
                            {parseFloat(getOpenRate(campaign)) > 20 ? 'Good' : 'Average'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Email Templates ({templates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <Send className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No templates yet</p>
              <Button onClick={() => setShowNewTemplate(true)} className="mt-4">
                Create Your First Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                    {template.is_active && (
                      <Badge className="bg-green-500">Active</Badge>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600">Subject</p>
                    <p className="text-sm font-medium">{template.subject}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Campaign Modal Placeholder */}
      {showNewCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Promotion 2025"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject Line</label>
                  <input
                    type="text"
                    placeholder="e.g., Special Offer Just for You"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Select Template</label>
                  <select aria-label="Select email template" className="w-full border rounded-lg px-4 py-2">
                    <option value="">Choose a template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <select aria-label="Select target audience" className="w-full border rounded-lg px-4 py-2">
                    <option value="">All leads</option>
                    <option value="hot">Hot leads only</option>
                    <option value="warm">Warm leads only</option>
                    <option value="cold">Cold leads only</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setShowNewCampaign(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
