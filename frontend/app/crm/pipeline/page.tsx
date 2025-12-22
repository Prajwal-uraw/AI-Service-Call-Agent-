"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  RefreshCw,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Lead {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  lead_score: number;
  tier: string;
  status: string;
  source_type: string;
  pending_tasks: number;
  last_activity_date: string;
}

interface Stage {
  name: string;
  color: string;
  position: number;
  leads: Lead[];
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<Stage[]>([]);
  const [leadsByStage, setLeadsByStage] = useState<Record<string, Lead[]>>({});
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/crm/pipeline/view`);
      const data = await response.json();
      setPipeline(data);
    } catch (error) {
      console.error("Failed to fetch pipeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Find the lead
    const sourceStage = pipeline.find(s => s.name === source.droppableId);
    const destStage = pipeline.find(s => s.name === destination.droppableId);

    if (!sourceStage || !destStage) return;

    const lead = sourceStage.leads.find(l => l.id === draggableId);
    if (!lead) return;

    // Optimistic update
    const newPipeline = [...pipeline];
    const sourceStageIndex = newPipeline.findIndex(s => s.name === source.droppableId);
    const destStageIndex = newPipeline.findIndex(s => s.name === destination.droppableId);

    // Remove from source
    newPipeline[sourceStageIndex].leads.splice(source.index, 1);

    // Add to destination
    newPipeline[destStageIndex].leads.splice(destination.index, 0, lead);

    setPipeline(newPipeline);

    // Update backend
    try {
      await fetch(`${API_URL}/api/crm/pipeline/leads/${draggableId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage_name: destStage.name,
          notes: `Moved from ${sourceStage.name} to ${destStage.name}`
        })
      });
    } catch (error) {
      console.error("Failed to move lead:", error);
      // Revert on error
      fetchPipeline();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-red-600 font-bold";
    if (score >= 70) return "text-orange-600 font-semibold";
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
          <p className="text-gray-600">Drag and drop leads between stages</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPipeline} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {pipeline.map((stage) => (
          <Card key={stage.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stage.name}</p>
                  <p className="text-2xl font-bold">{stage.leads.length}</p>
                </div>
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: stage.color }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipeline.map((stage) => (
            <div key={stage.name} className="flex flex-col">
              {/* Stage Header */}
              <div 
                className="p-4 rounded-t-lg text-white font-semibold flex items-center justify-between"
                style={{ backgroundColor: stage.color }}
              >
                <span>{stage.name}</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {stage.leads.length}
                </Badge>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={stage.name}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 space-y-2 bg-gray-50 rounded-b-lg min-h-[500px] ${
                      snapshot.isDraggingOver ? "bg-blue-50" : ""
                    }`}
                  >
                    {stage.leads
                      .filter(lead => 
                        !searchTerm || 
                        lead.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-move ${
                                snapshot.isDragging ? "shadow-lg ring-2 ring-blue-500" : ""
                              }`}
                            >
                              {/* Lead Card */}
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-sm">
                                      {lead.business_name || "Unnamed Business"}
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                      {lead.contact_name || "No contact"}
                                    </p>
                                  </div>
                                  <Badge className={getTierBadge(lead.tier)} variant="default">
                                    {lead.tier}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">
                                    {lead.city}, {lead.state}
                                  </span>
                                  <span className={getScoreColor(lead.lead_score)}>
                                    {lead.lead_score}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Badge variant="outline" className="text-xs">
                                    {lead.source_type}
                                  </Badge>
                                  {lead.pending_tasks > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {lead.pending_tasks} tasks
                                    </Badge>
                                  )}
                                </div>

                                {lead.last_activity_date && (
                                  <p className="text-xs text-gray-400">
                                    Last activity: {new Date(lead.last_activity_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}

                    {stage.leads.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <p className="text-sm">No leads in this stage</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
