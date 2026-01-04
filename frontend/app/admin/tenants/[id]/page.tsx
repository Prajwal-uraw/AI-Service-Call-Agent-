"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { parseError, logError } from "@/lib/errors";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  Calendar,
  TrendingUp,
  Settings,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  PhoneCall,
  Key,
  Activity
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Tenant {
  id: string;
  slug: string;
  company_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone?: string;
  subdomain?: string;
  industry: string;
  website_url?: string;
  twilio_phone_number?: string;
  forward_to_number?: string;
  emergency_phone?: string;
  timezone: string;
  business_hours: any;
  ai_model: string;
  ai_voice: string;
  custom_system_prompt?: string;
  greeting_message?: string;
  plan_tier: string;
  subscription_status: string;
  is_active: boolean;
  features: any;
  max_monthly_calls: number;
  current_month_calls: number;
  total_calls: number;
  total_appointments: number;
  trial_ends_at?: string;
  subscription_started_at?: string;
  created_at: string;
}

interface TenantStats {
  total_calls: number;
  calls_this_month: number;
  max_monthly_calls: number;
  usage_percentage: number;
  total_appointments: number;
  upcoming_appointments: number;
  trial_ends_at?: string;
  is_active: boolean;
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.id as string;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (tenantId) {
      fetchTenantData();
    }
  }, [tenantId]);

  const fetchTenantData = async () => {
    setLoading(true);
    setError("");

    try {
      const [tenantRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/tenants/${tenantId}`),
        fetch(`${API_URL}/api/admin/tenants/${tenantId}/stats`)
      ]);

      if (!tenantRes.ok) {
        throw new Error("Failed to fetch tenant details");
      }

      const tenantData = await tenantRes.json();
      setTenant(tenantData);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, "TenantDetailPage.fetchTenantData");
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTenant = async () => {
    if (!confirm("Activate this tenant and start their trial/subscription?")) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_status: "active",
          is_active: true
        })
      });

      if (!response.ok) throw new Error("Failed to activate tenant");

      await fetchTenantData();
      alert("Tenant activated successfully!");
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, "TenantDetailPage.handleActivateTenant");
      alert(appError.userMessage);
    }
  };

  const handleSuspendTenant = async () => {
    if (!confirm("Suspend this tenant? They will lose access immediately.")) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/tenants/${tenantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: false,
          subscription_status: "suspended"
        })
      });

      if (!response.ok) throw new Error("Failed to suspend tenant");

      await fetchTenantData();
      alert("Tenant suspended successfully!");
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, "TenantDetailPage.handleSuspendTenant");
      alert(appError.userMessage);
    }
  };

  const handleDeleteTenant = async () => {
    if (!confirm("Are you sure you want to delete this tenant? This action cannot be undone.")) return;
    if (!confirm("FINAL WARNING: This will permanently delete all tenant data. Continue?")) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/tenants/${tenantId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete tenant");

      alert("Tenant deleted successfully!");
      router.push("/admin/tenants");
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, "TenantDetailPage.handleDeleteTenant");
      alert(appError.userMessage);
    }
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </AdminShell>
    );
  }

  if (error || !tenant) {
    return (
      <AdminShell>
        <ErrorMessage message={error || "Tenant not found"} type="error" />
        <Button onClick={() => router.push("/admin/tenants")} className="mt-4">
          Back to Tenants
        </Button>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-100">{tenant.company_name}</h1>
              <Badge
                variant={tenant.is_active ? "default" : "secondary"}
                className={tenant.is_active ? "bg-green-600" : "bg-gray-600"}
              >
                {tenant.subscription_status}
              </Badge>
            </div>
            <p className="text-slate-400">
              {tenant.subdomain}.kestrel.ai • Created {new Date(tenant.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/admin/tenants/${tenantId}/provision-phone`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="mr-2" size={16} />
              Provision Phone
            </Button>
            <Button
              onClick={() => router.push(`/admin/tenants/${tenantId}/edit`)}
              variant="outline"
            >
              <Edit className="mr-2" size={16} />
              Edit
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/40 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Calls</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.total_calls || 0}</p>
                </div>
                <PhoneCall className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">This Month</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.calls_this_month || 0}</p>
                  <p className="text-xs text-slate-500">of {stats?.max_monthly_calls || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Usage</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.usage_percentage || 0}%</p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Appointments</p>
                  <p className="text-2xl font-bold text-slate-100">{stats?.total_appointments || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          {["overview", "phone", "subscription", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Building2 size={20} />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Company Name</p>
                  <p className="text-slate-100">{tenant.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Industry</p>
                  <p className="text-slate-100 capitalize">{tenant.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Website</p>
                  <p className="text-slate-100">{tenant.website_url || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Timezone</p>
                  <p className="text-slate-100">{tenant.timezone}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Mail size={20} />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="text-slate-100">{tenant.owner_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-slate-100">{tenant.owner_email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="text-slate-100">{tenant.owner_phone || "Not provided"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "phone" && (
          <Card className="bg-slate-800/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Phone size={20} />
                Phone Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Twilio Phone Number</p>
                  {tenant.twilio_phone_number ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400" size={16} />
                      <p className="text-slate-100 font-mono">{tenant.twilio_phone_number}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="text-yellow-400" size={16} />
                      <p className="text-slate-400">Not provisioned</p>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/admin/tenants/${tenantId}/provision-phone`)}
                        className="ml-2"
                      >
                        Provision Now
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-1">Forward To Number</p>
                  <p className="text-slate-100 font-mono">{tenant.forward_to_number || "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-1">Emergency Phone</p>
                  <p className="text-slate-100 font-mono">{tenant.emergency_phone || "Not set"}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-1">AI Voice</p>
                  <p className="text-slate-100 capitalize">{tenant.ai_voice}</p>
                </div>
              </div>

              {tenant.custom_system_prompt && (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Custom System Prompt</p>
                  <p className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded">
                    {tenant.custom_system_prompt}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "subscription" && (
          <Card className="bg-slate-800/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Settings size={20} />
                Subscription & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Plan Tier</p>
                  <Badge className="capitalize">{tenant.plan_tier}</Badge>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <Badge
                    variant={tenant.is_active ? "default" : "secondary"}
                    className={tenant.is_active ? "bg-green-600" : "bg-red-600"}
                  >
                    {tenant.subscription_status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-1">Monthly Call Limit</p>
                  <p className="text-slate-100">{tenant.max_monthly_calls.toLocaleString()}</p>
                </div>
              </div>

              {tenant.trial_ends_at && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                  <p className="text-sm text-yellow-400">
                    Trial ends: {new Date(tenant.trial_ends_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {!tenant.is_active && (
                  <Button onClick={handleActivateTenant} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2" size={16} />
                    Activate Tenant
                  </Button>
                )}
                {tenant.is_active && (
                  <Button onClick={handleSuspendTenant} variant="outline" className="border-yellow-600 text-yellow-400">
                    <AlertCircle className="mr-2" size={16} />
                    Suspend Tenant
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "activity" && (
          <Card className="bg-slate-800/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-slate-100">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400">Activity log coming soon...</p>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="bg-red-900/10 border-red-600/30">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle size={20} />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDeleteTenant}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
            >
              <Trash2 className="mr-2" size={16} />
              Delete Tenant
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
