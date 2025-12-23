"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { 
  Video, 
  Users, 
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Mail,
  CheckCircle,
  Phone,
  MessageSquare,
  Zap
} from "lucide-react";

export default function VideoCallsPage() {
  const [activeTab, setActiveTab] = useState("quick-start");
  const [createdRoom, setCreatedRoom] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [participantEmail, setParticipantEmail] = useState("");

  const handleQuickStart = async (meetingType: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/video/quick-start/${meetingType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: "demo_tenant",
          participant_email: participantEmail || undefined
        })
      });

      const data = await response.json();
      setCreatedRoom(data);
      
      // Auto-copy link to clipboard
      navigator.clipboard.writeText(data.room_url);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openRoom = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-8 pt-24">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Video Calls</h1>
          <p className="text-gray-600">One-click video rooms with Daily.co</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {["quick-start", "scheduled", "call-logs"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "quick-start" && "Quick Start"}
              {tab === "scheduled" && "Scheduled"}
              {tab === "call-logs" && "Call Logs"}
            </button>
          ))}
        </div>

        {activeTab === "quick-start" && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Quick Start Options */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Start Meeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Participant Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={participantEmail}
                      onChange={(e) => setParticipantEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleQuickStart("demo")}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Start Customer Demo
                    </Button>

                    <Button
                      onClick={() => handleQuickStart("support")}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Start Support Call
                    </Button>

                    <Button
                      onClick={() => handleQuickStart("internal")}
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Start Internal Meeting
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                    <p className="text-blue-800">
                      <strong>High-leverage approach:</strong> One-click creates room, 
                      copies link to clipboard, and generates invite message. 
                      No embedded video - just smart CRM wrapper.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Common Internal Meetings */}
              <Card>
                <CardHeader>
                  <CardTitle>Common Meetings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => handleQuickStart("internal")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Daily Standup
                  </Button>
                  <Button
                    onClick={() => handleQuickStart("internal")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly Review
                  </Button>
                  <Button
                    onClick={() => handleQuickStart("internal")}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Code Review
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Created Room Display */}
            <div>
              {createdRoom ? (
                <Card className="border-2 border-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Room Created!</CardTitle>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Room URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={createdRoom.room_url}
                          readOnly
                          aria-label="Room URL"
                          title="Room URL"
                          className="flex-1 border rounded-lg px-4 py-2 bg-gray-50"
                        />
                        <Button
                          onClick={() => copyToClipboard(createdRoom.room_url)}
                          variant="outline"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Meeting Type</label>
                      <Badge className="text-sm">
                        {createdRoom.meeting_type}
                      </Badge>
                    </div>

                    <div>
                      <label htmlFor="invite-message" className="block text-sm font-medium mb-2">Invite Message</label>
                      <textarea
                        id="invite-message"
                        value={createdRoom.invite_message}
                        readOnly
                        rows={6}
                        className="w-full border rounded-lg px-4 py-2 bg-gray-50 text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => openRoom(createdRoom.room_url)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Join Room
                      </Button>
                      {participantEmail && (
                        <Button
                          onClick={() => window.open(createdRoom.quick_actions.send_email)}
                          variant="outline"
                          className="flex-1"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                      )}
                    </div>

                    <Button
                      onClick={() => setCreatedRoom(null)}
                      variant="outline"
                      className="w-full"
                    >
                      Create Another Room
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">
                      Click a button to create a video room
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === "scheduled" && (
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded">
                        <Video className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Demo with Acme HVAC</p>
                        <p className="text-sm text-gray-600">john@acmehvac.com</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Today, 2:00 PM</p>
                      <Badge className="bg-blue-100 text-blue-800 mt-1">Demo</Badge>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Room
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Daily Standup</p>
                        <p className="text-sm text-gray-600">Internal team</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Tomorrow, 9:00 AM</p>
                      <Badge className="bg-purple-100 text-purple-800 mt-1">Internal</Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>

                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule New Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "call-logs" && (
          <Card>
            <CardHeader>
              <CardTitle>Call Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">Demo with john@hvacpro.com</p>
                      <p className="text-sm text-gray-600">45 minutes • Interested</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Wants to see call forwarding feature
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>2 hours ago</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">Support with sarah@acmehvac.com</p>
                      <p className="text-sm text-gray-600">20 minutes • Resolved</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Helped with Twilio configuration
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>4 hours ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </>
  );
}
