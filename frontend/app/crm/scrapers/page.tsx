"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Scraper {
  type: string;
  name: string;
  description: string;
  status: string;
  config_options: any;
}

interface ScraperJob {
  id: string;
  scraper_type: string;
  job_name: string;
  status: string;
  signals_found: number;
  signals_new: number;
  duration_seconds: number;
  started_at: string;
  completed_at: string;
  error_message: string;
}

export default function ScrapersPage() {
  const [scrapers, setScrapers] = useState<Scraper[]>([]);
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchJobs, 5000); // Refresh jobs every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchScrapers(),
        fetchJobs(),
        fetchStats()
      ]);
    } catch (error) {
      console.error("Failed to fetch scraper data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScrapers = async () => {
    const response = await fetch(`${API_URL}/api/crm/scrapers/available`);
    const data = await response.json();
    setScrapers(data.scrapers || []);
  };

  const fetchJobs = async () => {
    const response = await fetch(`${API_URL}/api/crm/scrapers/jobs?limit=20`);
    const data = await response.json();
    setJobs(data.jobs || []);
  };

  const fetchStats = async () => {
    const response = await fetch(`${API_URL}/api/crm/scrapers/stats`);
    const data = await response.json();
    setStats(data);
  };

  const runScraper = async (scraperType: string) => {
    try {
      setRunningJobs(prev => new Set(prev).add(scraperType));
      
      const response = await fetch(`${API_URL}/api/crm/scrapers/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scraper_type: scraperType,
          triggered_by_user: "admin"
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`${scraperType} scraper started successfully!`);
        fetchJobs();
      } else {
        alert("Failed to start scraper");
      }
    } catch (error) {
      console.error("Failed to run scraper:", error);
      alert("Error starting scraper");
    } finally {
      setTimeout(() => {
        setRunningJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(scraperType);
          return newSet;
        });
      }, 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-500",
      failed: "bg-red-500",
      running: "bg-blue-500",
      pending: "bg-gray-500"
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Loading scrapers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Scraper Control Panel</h1>
          <p className="text-gray-600">Trigger and monitor pain signal scrapers</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.total_jobs}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.by_status?.completed || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Running</p>
              <p className="text-2xl font-bold text-blue-600">{stats.by_status?.running || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.by_status?.failed || 0}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Scrapers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Scrapers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scrapers.map((scraper) => (
              <Card key={scraper.type} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scraper.name}</CardTitle>
                    <Badge variant={scraper.status === "active" ? "default" : "secondary"}>
                      {scraper.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{scraper.description}</p>
                  
                  {stats?.signals_by_source?.[scraper.type] && (
                    <div className="text-sm">
                      <p className="text-gray-600">Total Signals:</p>
                      <p className="text-xl font-bold">{stats.signals_by_source[scraper.type]}</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => runScraper(scraper.type)}
                    disabled={runningJobs.has(scraper.type) || scraper.status !== "active"}
                    className="w-full"
                  >
                    {runningJobs.has(scraper.type) ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Scraper
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scraper Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No scraper jobs yet</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-semibold">{job.job_name}</p>
                        <p className="text-sm text-gray-600 capitalize">{job.scraper_type}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(job.status)}>
                      {job.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-600">Signals Found</p>
                      <p className="font-semibold">{job.signals_found || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">New Signals</p>
                      <p className="font-semibold text-green-600">{job.signals_new || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-semibold">
                        {job.duration_seconds ? `${job.duration_seconds}s` : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Started</p>
                      <p className="font-semibold">
                        {job.started_at ? new Date(job.started_at).toLocaleTimeString() : "-"}
                      </p>
                    </div>
                  </div>

                  {job.error_message && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm font-semibold">Error:</p>
                      </div>
                      <p className="text-sm text-red-600 mt-1">{job.error_message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signals by Source */}
      {stats?.signals_by_source && (
        <Card>
          <CardHeader>
            <CardTitle>Signals by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.signals_by_source).map(([source, count]) => (
                <div key={source} className="text-center p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 capitalize">{source}</p>
                  <p className="text-2xl font-bold">{count as number}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
