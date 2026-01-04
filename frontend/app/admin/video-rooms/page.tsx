'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Video, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Clock, 
  Users,
  RefreshCw,
  Search,
  Calendar,
  Play,
  MoreHorizontal
} from 'lucide-react';

const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(`Error: ${msg}`),
};

interface VideoRoom {
  id: string;
  room_name: string;
  room_url: string;
  privacy: string;
  max_participants: number;
  is_active: boolean;
  total_participants: number;
  total_duration_minutes: number;
  created_at: string;
  expires_at: string | null;
}

interface CallLog {
  id: string;
  room_name: string;
  call_type: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  participant_count: number;
  outcome: string;
  participants: Array<{ name: string; email: string }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function VideoRoomsPage() {
  const [rooms, setRooms] = useState<VideoRoom[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
    fetchCallLogs();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/daily-video/rooms`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast.error('Failed to load video rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchCallLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/daily-video/call-logs?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setCallLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch call logs:', error);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/daily-video/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          room_name: newRoomName.toLowerCase().replace(/\s+/g, '-'),
          privacy: 'private',
          max_participants: 10
        }),
      });

      if (response.ok) {
        toast.success('Room created successfully');
        setNewRoomName('');
        setCreateDialogOpen(false);
        fetchRooms();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to create room');
      }
    } catch (error) {
      toast.error('Failed to create room');
    }
  };

  const deleteRoom = async (roomName: string) => {
    try {
      const response = await fetch(`${API_URL}/api/daily-video/rooms/${roomName}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Room deleted successfully');
        setDeleteDialogOpen(false);
        setRoomToDelete(null);
        fetchRooms();
      } else {
        toast.error('Failed to delete room');
      }
    } catch (error) {
      toast.error('Failed to delete room');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredRooms = rooms.filter(room => 
    room.room_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = callLogs.filter(log =>
    log.room_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Rooms</h1>
          <p className="text-muted-foreground">Manage Daily.co video rooms and view call history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchRooms(); fetchCallLogs(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Video Room</DialogTitle>
                <DialogDescription>
                  Create a new Daily.co video room for meetings
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Room name (e.g., sales-demo-1)"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createRoom}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rooms.filter(r => r.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.reduce((sum, r) => sum + (r.total_participants || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">
            <Video className="h-4 w-4 mr-2" />
            Rooms ({filteredRooms.length})
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Calendar className="h-4 w-4 mr-2" />
            Call Logs ({filteredLogs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Loading...</div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No video rooms found. Create one to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Privacy</TableHead>
                      <TableHead>Max Participants</TableHead>
                      <TableHead>Total Calls</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell className="font-medium">{room.room_name}</TableCell>
                        <TableCell>
                          <Badge variant={room.is_active ? 'default' : 'secondary'}>
                            {room.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{room.privacy}</TableCell>
                        <TableCell>{room.max_participants}</TableCell>
                        <TableCell>{room.total_participants || 0}</TableCell>
                        <TableCell>{formatDate(room.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(room.room_url)}
                              title="Copy URL"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(room.room_url, '_blank')}
                              title="Open Room"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setRoomToDelete(room.room_name);
                                setDeleteDialogOpen(true);
                              }}
                              title="Delete Room"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardContent className="p-0">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No call logs found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Outcome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.room_name}</TableCell>
                        <TableCell className="capitalize">{log.call_type || 'Video'}</TableCell>
                        <TableCell>{formatDate(log.started_at)}</TableCell>
                        <TableCell>{formatDuration(log.duration_seconds)}</TableCell>
                        <TableCell>{log.participant_count}</TableCell>
                        <TableCell>
                          <Badge variant={log.outcome === 'completed' ? 'default' : 'secondary'}>
                            {log.outcome || 'Unknown'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the room &quot;{roomToDelete}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roomToDelete && deleteRoom(roomToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
