"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Video, Users, Clock, ExternalLink } from "lucide-react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState("book-demo");

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        styles: { branding: { brandColor: "#2563eb" } },
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Calendar & Scheduling</h1>
          <p className="text-gray-600">Book demos, schedule meetings, and manage your calendar</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {["book-demo", "internal-meetings", "upcoming"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "book-demo" && "Book Demo"}
              {tab === "internal-meetings" && "Internal Meetings"}
              {tab === "upcoming" && "Upcoming"}
            </button>
          ))}
        </div>

        {activeTab === "book-demo" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Widget */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule a Demo with Kestrel Voice Operations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg">
                    {/* Cal.com Embed */}
                    <Cal
                      calLink="team/kestrel-ai/demo"
                      style={{ width: "100%", height: "100%", overflow: "scroll" }}
                      config={{
                        name: "Demo Call",
                        email: "customer@example.com",
                        notes: "Interested in AI voice agent for HVAC business",
                        theme: "light"
                      }}
                    />
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>What happens after booking:</strong>
                    </p>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• Confirmation email with Daily.co video room link</li>
                      <li>• Calendar invite (Google/Outlook)</li>
                      <li>• SMS reminder 1 hour before</li>
                      <li>• Auto-created video room ready to join</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Demo Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-gray-600">30-45 minutes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Format</p>
                      <p className="text-sm text-gray-600">Video call via Daily.co</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Who Joins</p>
                      <p className="text-sm text-gray-600">Sales team + you</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What We'll Cover</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>AI voice agent capabilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Live demo with your business scenario</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Pricing and implementation timeline</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span>Q&A session</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "internal-meetings" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recurring Meetings */}
            <Card>
              <CardHeader>
                <CardTitle>Recurring Meetings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">Daily Standup</p>
                      <p className="text-sm text-gray-600">Every weekday at 9:00 AM</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                  </div>
                  <Button size="sm" className="w-full mt-2">
                    <Video className="h-4 w-4 mr-2" />
                    Join Now
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">Weekly Review</p>
                      <p className="text-sm text-gray-600">Every Friday at 3:00 PM</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">Code Review</p>
                      <p className="text-sm text-gray-600">On-demand</p>
                    </div>
                    <Badge className="bg-gray-100 text-gray-800">On-Demand</Badge>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    <Video className="h-4 w-4 mr-2" />
                    Start Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Create ad-hoc meetings with team members
                </p>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Meeting Type</label>
                  <select aria-label="Select meeting type" className="w-full border rounded-lg px-4 py-2">
                    <option>Team Sync</option>
                    <option>1-on-1</option>
                    <option>Code Review</option>
                    <option>Planning Session</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Duration</label>
                  <select aria-label="Select meeting duration" className="w-full border rounded-lg px-4 py-2">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>1 hour</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Participants</label>
                  <input
                    type="text"
                    placeholder="Enter email addresses..."
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "upcoming" && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Video className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Demo with Acme HVAC</p>
                        <p className="text-sm text-gray-600">john@acmehvac.com</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Today, 2:00 PM - 2:45 PM</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Join
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Daily Standup</p>
                        <p className="text-sm text-gray-600">Internal team</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Tomorrow, 9:00 AM - 9:15 AM</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Video className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Support Call - Smith Plumbing</p>
                        <p className="text-sm text-gray-600">sarah@smithplumbing.com</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Dec 23, 10:00 AM - 10:30 AM</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
