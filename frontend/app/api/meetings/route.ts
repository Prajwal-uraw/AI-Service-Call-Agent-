import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const resp = await fetch('http://127.0.0.1:8000/api/video/rooms');
  if (!resp.ok) {
    return NextResponse.json({ error: 'Failed to fetch meetings from backend' }, { status: 500 });
  }
  const data = await resp.json();
  // Normalize to array of meetings - handle different response structures
  const meetings = Array.isArray(data) ? data : data.data || data.rooms || [];
  return NextResponse.json(meetings);
}
