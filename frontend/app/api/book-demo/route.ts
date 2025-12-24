import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, date, time, timezone } = body;

    // Validate required fields
    if (!name || !email || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse booking time
    const bookingTime = new Date(`${date}T${time}`);
    const bookingId = Date.now().toString();

    // TODO: Implement demo booking logic
    // This endpoint is a placeholder for future demo booking functionality
    
    console.log('📅 Demo booking request:', {
      name,
      email,
      phone,
      date,
      time,
      timezone,
    });

    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Demo booking received. We will contact you shortly.',
    });

  } catch (error: any) {
    console.error('Error booking demo:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to book demo' },
      { status: 500 }
    );
  }
}
