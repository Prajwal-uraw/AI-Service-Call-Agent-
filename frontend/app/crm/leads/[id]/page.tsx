"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  MessageSquare,
  User,
  Edit,
  Trash,
  Plus
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Lead {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  business_type: string;
  lead_score: number;
  tier: string;
  status: string;
  source_type: string;
  created_at: string;
  last_contact_at: string;
  next_follow_up_at: string;
  notes: string;
}

interface TimelineItem {
  type: string;
  date: string;
  data: any;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");

  useEffect(() => {
    if (leadId) {
      fetchLeadData();
    }
  }, [leadId]);

  const fetchLeadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLead(),
        fetchTimeline(),
        fetchContacts(),
        fetchTasks()
      ]);
    } catch (error) {
      console.error("Failed to fetch lead data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLead = async () => {
    const response = await fetch(`${API_URL}/api/admin/leads/${leadId}`);
    const data = await response.json();
    setLead(data);
  };

  const fetchTimeline = async () => {
    const response = await fetch(`${API_URL}/api/crm/activities/lead/${leadId}/timeline`);
    const data = await response.json();
    setTimeline(data);
  };

  const fetchContacts = async () => {
    const response = await fetch(`${API_URL}/api/crm/contacts/lead/${leadId}`);
    const data = await response.json();
    setContacts(data);
  };

  const fetchTasks = async () => {
    const response = await fetch(`${API_URL}/api/crm/tasks?lead_id=${leadId}`);
    const data = await response.json();
    setTasks(data.tasks || []);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-red-600";
    if (score >= 70) return "text-orange-600";
    if (score >= 50) return "text-yellow-600";
    return "text-gray-600";
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      hot: "bg-red-500",
      warm: "bg-orange-500",
      cold: "bg-blue-500",
      nurture: "bg-gray-500"
    };
    return colors[tier] || "bg-gray-500";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "call": return <Phone className="h-4 w-4" />;
      case "note": return <MessageSquare className="h-4 w-4" />;
      case "meeting": return <Calendar className="h-4 w-4" />;
      case "task": return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Lead not found</p>
          <Button onClick={() => router.push("/crm/pipeline")} className="mt-4">
            Back to Pipeline
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/crm/pipeline")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lead.business_name || "Unnamed Business"}</h1>
            <p className="text-gray-600">{lead.contact_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Lead Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lead Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(lead.lead_score)}`}>
                  {lead.lead_score}
                </p>
              </div>
              <Badge className={getTierBadge(lead.tier)}>{lead.tier}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-lg font-semibold capitalize">{lead.status.replace(/_/g, " ")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Source</p>
            <p className="text-lg font-semibold capitalize">{lead.source_type}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Business Type</p>
            <p className="text-lg font-semibold">{lead.business_type || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                    {lead.phone}
                  </a>
                </div>
              )}
              {(lead.city || lead.state) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{lead.city}, {lead.state}</span>
                </div>
              )}
              {lead.business_type && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span>{lead.business_type}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contacts ({contacts.length})</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-gray-500">No contacts added</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-semibold text-sm">
                            {contact.first_name} {contact.last_name}
                          </p>
                          <p className="text-xs text-gray-600">{contact.job_title}</p>
                          <p className="text-xs text-blue-600">{contact.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tasks ({tasks.filter(t => t.status === "pending").length})</CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-500">No tasks</p>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 mt-0.5 ${task.status === "completed" ? "text-green-600" : "text-gray-400"}`} />
                      <div className="flex-1">
                        <p className={task.status === "completed" ? "line-through text-gray-500" : ""}>
                          {task.title}
                        </p>
                        {task.due_date && (
                          <p className="text-xs text-gray-500">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Timeline & Notes */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {timeline.length === 0 ? (
                    <p className="text-sm text-gray-500">No activity yet</p>
                  ) : (
                    <div className="space-y-4">
                      {timeline.map((item, index) => (
                        <div key={index} className="flex gap-4 border-l-2 border-gray-200 pl-4 pb-4">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(item.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm capitalize">
                                {item.type === "activity" ? item.data.activity_type : item.type}
                              </p>
                              <span className="text-xs text-gray-500">
                                {new Date(item.date).toLocaleString()}
                              </span>
                            </div>
                            {item.data.subject && (
                              <p className="text-sm font-medium mt-1">{item.data.subject}</p>
                            )}
                            {item.data.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.data.description}</p>
                            )}
                            {item.data.content && (
                              <p className="text-sm text-gray-600 mt-1">{item.data.content}</p>
                            )}
                            {item.data.title && (
                              <p className="text-sm text-gray-600 mt-1">{item.data.title}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Notes</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {lead.notes ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No notes added</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
