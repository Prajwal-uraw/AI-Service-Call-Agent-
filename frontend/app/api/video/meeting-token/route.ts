import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { meetingId } = body;
  if (!meetingId) return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 });

  // Get the room name from meetings list first
  const meetingsResp = await fetch('http://127.0.0.1:8000/api/video/rooms');
  if (!meetingsResp.ok) {
    return NextResponse.json({ error: 'Failed to get meetings' }, { status: 500 });
  }
  const meetingsData = await meetingsResp.json();
  const meetings = Array.isArray(meetingsData) ? meetingsData : meetingsData.data || [];
  const meeting = meetings.find((m: any) => m.id === meetingId);
  
  if (!meeting) {
    return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
  }

  // Proxy to FastAPI backend with query parameters
  const resp = await fetch(`http://127.0.0.1:8000/api/video/meeting-token?room_name=${meeting.room_name}&user_name=user`, {
    method: 'POST',
  });
  if (!resp.ok) {
    return NextResponse.json({ error: 'Failed to get meeting token' }, { status: 500 });
  }
  const data = await resp.json();
  return NextResponse.json(data);
}
