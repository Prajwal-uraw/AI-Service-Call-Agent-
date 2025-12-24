import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { signalId } = await request.json();
    
    // Daily.co API key from environment
    const dailyApiKey = process.env.DAILY_API_KEY;
    
    if (!dailyApiKey) {
      return NextResponse.json(
        { error: 'Daily.co API key not configured' },
        { status: 500 }
      );
    }

    // Create a Daily.co room
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`
      },
      body: JSON.stringify({
        name: `signal-${signalId}-${Date.now()}`,
        privacy: 'public',
        properties: {
          max_participants: 2,
          enable_screenshare: true,
          enable_chat: true,
          enable_knocking: false,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Daily.co API error:', error);
      return NextResponse.json(
        { error: 'Failed to create video room' },
        { status: response.status }
      );
    }

    const room = await response.json();
    
    return NextResponse.json({
      roomUrl: room.url,
      roomName: room.name
    });

  } catch (error) {
    console.error('Error creating video room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
