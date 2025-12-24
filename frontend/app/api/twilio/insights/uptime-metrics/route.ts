import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone_number');
    const days = searchParams.get('days') || '7';

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    let url = `${apiUrl}/api/twilio/insights/uptime-metrics?days=${days}`;
    if (phoneNumber) {
      url += `&phone_number=${encodeURIComponent(phoneNumber)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Failed to fetch uptime metrics' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching uptime metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
