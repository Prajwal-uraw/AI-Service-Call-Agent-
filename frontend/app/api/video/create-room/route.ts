import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title } = body;
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  // Convert title to valid room name (lowercase, replace spaces with hyphens, remove special chars)
  const roomName = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || `meeting-${Date.now()}`;

  // Proxy to FastAPI backend
  const resp = await fetch('http://127.0.0.1:8000/api/video/create-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: roomName }),
  });
  if (!resp.ok) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
  const data = await resp.json();
  return NextResponse.json(data);
}
