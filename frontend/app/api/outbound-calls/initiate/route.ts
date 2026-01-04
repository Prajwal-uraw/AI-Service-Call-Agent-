import { NextRequest, NextResponse } from 'next/server';

// Use server-side env var (not NEXT_PUBLIC_)
// Modal deployment URL or local backend
const BACKEND_URL = process.env.BACKEND_URL || 
                    process.env.NEXT_PUBLIC_API_URL || 
                    'https://subodhkc--kestrel-demand-engine-fastapi-app.modal.run';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[Outbound Call] Initiating call to:', body.to_number);
    console.log('[Outbound Call] Backend URL:', BACKEND_URL);
    
    const response = await fetch(`${BACKEND_URL}/api/outbound-calls/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    }).catch((err) => {
      console.error('[Outbound Call] Fetch error:', err);
      throw new Error(`Network error: ${err.message}. Check if backend is running at ${BACKEND_URL}`);
    });

    console.log('[Outbound Call] Backend response status:', response.status);

    if (!response.ok) {
      let errorDetail = 'Failed to initiate call';
      try {
        const error = await response.json();
        errorDetail = error.detail || error.message || errorDetail;
      } catch (e) {
        const errorText = await response.text();
        console.error('[Outbound Call] Error response:', errorText);
        errorDetail = errorText || errorDetail;
      }
      
      return NextResponse.json(
        { error: errorDetail },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Outbound Call] Success:', data.call_sid);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Outbound Call] Exception:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'Check that backend server is running and Twilio credentials are configured'
      },
      { status: 500 }
    );
  }
}
