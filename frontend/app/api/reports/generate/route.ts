import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[Report Generation] Starting report generation');
    console.log('[Report Generation] Backend URL:', BACKEND_URL);
    console.log('[Report Generation] Pilot ID:', body.pilot_id);
    
    const response = await fetch(`${BACKEND_URL}/api/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('[Report Generation] Backend response status:', response.status);

    if (!response.ok) {
      let errorDetail = 'Failed to generate report';
      try {
        const error = await response.json();
        errorDetail = error.detail || error.message || errorDetail;
      } catch (e) {
        const errorText = await response.text();
        console.error('[Report Generation] Error response:', errorText);
        errorDetail = errorText || errorDetail;
      }
      
      return NextResponse.json(
        { error: errorDetail },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Report Generation] Success');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Report Generation] Exception:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'Check that backend server is running at ' + BACKEND_URL
      },
      { status: 500 }
    );
  }
}
