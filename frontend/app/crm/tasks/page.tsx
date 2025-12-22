"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Plus,
  RefreshCw,
  Filter
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  status: string;
  priority: string;
  due_date: string;
  lead_id: string;
  leads?: {
    business_name: string;
    contact_name: string;
  };
  created_at: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTasks(),
        fetchSummary()
      ]);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const params = new URLSearchParams();
    if (filter !== "all") params.append("status", filter);
    
    const response = await fetch(`${API_URL}/api/crm/tasks?${params}`);
    const data = await response.json();
    setTasks(data.tasks || []);
  };

  const fetchSummary = async () => {
    const response = await fetch(`${API_URL}/api/crm/tasks/upcoming/summary`);
    const data = await response.json();
    setSummary(data);
  };

  const completeTask = async (taskId: string) => {
    try {
      await fetch(`${API_URL}/api/crm/tasks/${taskId}/complete`, {
        method: "POST"
      });
      
      fetchData();
    } catch (error) {
      console.error("Failed to complete task:", error);
      alert("Failed to complete task");
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500"
    };
    return colors[priority] || "bg-gray-500";
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "call": return "📞";
      case "email": return "📧";
      case "meeting": return "🤝";
      case "follow_up": return "🔄";
      case "demo": return "🎯";
      case "proposal": return "📄";
      default: return "✅";
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tasks & Follow-ups</h1>
          <p className="text-gray-600">Manage your tasks and reminders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Due Today</p>
                  <p className="text-2xl font-bold text-blue-600">{summary.today}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Priority</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.high_priority}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Button 
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button 
          variant={filter === "in_progress" ? "default" : "outline"}
          onClick={() => setFilter("in_progress")}
        >
          In Progress
        </Button>
        <Button 
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button 
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-gray-500">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`border rounded-lg p-4 ${task.status === "completed" ? "bg-gray-50" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTaskTypeIcon(task.task_type)}</span>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                            {task.title}
                          </h3>
                          {task.leads && (
                            <p className="text-sm text-gray-600">
                              {task.leads.business_name} - {task.leads.contact_name}
                            </p>
                          )}
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {task.task_type.replace(/_/g, " ")}
                        </Badge>
                        {task.due_date && (
                          <Badge 
                            variant="outline" 
                            className={isOverdue(task.due_date) && task.status !== "completed" ? "border-red-500 text-red-600" : ""}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(task.due_date).toLocaleDateString()}
                            {isOverdue(task.due_date) && task.status !== "completed" && " (Overdue)"}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {task.status !== "completed" && (
                        <Button 
                          size="sm"
                          onClick={() => completeTask(task.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
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
