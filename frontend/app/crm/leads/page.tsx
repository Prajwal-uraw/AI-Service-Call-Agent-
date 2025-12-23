"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  RefreshCw,
  Search,
  ArrowRight,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type PipelineLead = {
  id: string;
  business_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  lead_score?: number;
  tier?: string;
  status?: string;
  source_type?: string;
  pending_tasks?: number;
  last_activity_date?: string;
  stage_name?: string;
  stage_color?: string;
  stage_position?: number;
};

type PipelineStage = {
  name: string;
  color?: string;
  position?: number;
  leads: PipelineLead[];
};

export default function LeadsPage() {
  const [loading, setLoading] = useState(true);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [search, setSearch] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/crm/pipeline/view`);
      const data = (await response.json()) as PipelineStage[];
      setPipeline(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
      setPipeline([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const leads = useMemo(() => {
    const flattened: PipelineLead[] = [];
    for (const stage of pipeline) {
      for (const lead of stage.leads || []) {
        flattened.push({
          ...lead,
          stage_name: stage.name,
          stage_color: stage.color,
          stage_position: stage.position,
        });
      }
    }
    return flattened;
  }, [pipeline]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) => {
      return (
        l.business_name?.toLowerCase().includes(q) ||
        l.contact_name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.state?.toLowerCase().includes(q) ||
        l.stage_name?.toLowerCase().includes(q)
      );
    });
  }, [leads, search]);

  const stats = useMemo(() => {
    const total = leads.length;
    const hot = leads.filter((l) => (l.tier || "").toLowerCase() === "hot").length;
    const withTasks = leads.filter((l) => (l.pending_tasks || 0) > 0).length;
    const avgScore = total > 0 ? Math.round(leads.reduce((s, l) => s + (l.lead_score || 0), 0) / total) : 0;
    return { total, hot, withTasks, avgScore };
  }, [leads]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Leads</h1>
          <p className="text-slate-400 mt-2">A single list across all pipeline stages.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLeads} variant="outline" className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Leads</p>
                <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Hot Leads</p>
            <p className="text-2xl font-bold text-red-300">{stats.hot}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-400">Pending Tasks</p>
            <p className="text-2xl font-bold text-yellow-300">{stats.withTasks}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Score</p>
                <p className="text-2xl font-bold text-green-300">{stats.avgScore}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
        <CardHeader className="space-y-4">
          <CardTitle className="text-slate-100">All Leads</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads, stages, contacts..."
                aria-label="Search leads"
                className="w-full h-10 rounded-md pl-10 pr-3 bg-slate-900/30 border border-white/10 text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <RefreshCw className="h-10 w-10 animate-spin mx-auto text-slate-400" />
              <p className="mt-3 text-slate-400">Loading leads...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-400">No leads found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-slate-900/30 backdrop-blur-md rounded-xl border border-white/10 p-4 hover:bg-slate-900/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="font-semibold text-slate-100 truncate">
                          {lead.business_name || "Unnamed Business"}
                        </div>
                        {lead.stage_name && (
                          <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/20">
                            {lead.stage_name}
                          </Badge>
                        )}
                        {lead.tier && (
                          <Badge className="bg-white/5 text-slate-200 border border-white/10">
                            {lead.tier}
                          </Badge>
                        )}
                        {typeof lead.lead_score === "number" && (
                          <Badge className="bg-green-500/10 text-green-300 border border-green-400/20">
                            Score {lead.lead_score}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2 min-w-0">
                          <UsersIconFallback />
                          <span className="truncate">{lead.contact_name || "Unknown contact"}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="h-4 w-4" />
                          {lead.email ? (
                            <a className="truncate text-blue-300 hover:underline" href={`mailto:${lead.email}`}>
                              {lead.email}
                            </a>
                          ) : (
                            <span className="truncate">No email</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="h-4 w-4" />
                          {lead.phone ? (
                            <a className="truncate text-blue-300 hover:underline" href={`tel:${lead.phone}`}>
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="truncate">No phone</span>
                          )}
                        </div>
                        {(lead.city || lead.state) && (
                          <div className="flex items-center gap-2 min-w-0 md:col-span-3">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{lead.city}{lead.city && lead.state ? ", " : ""}{lead.state}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/crm/leads/${lead.id}`}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsersIconFallback() {
  return <div className="w-4 h-4 rounded bg-white/10" aria-hidden="true" />;
}
