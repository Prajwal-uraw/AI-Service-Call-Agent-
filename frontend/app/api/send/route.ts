import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('RESEND_API_KEY is not set in environment variables');
  throw new Error('Email service is not properly configured');
}

const resend = new Resend(apiKey);

export async function POST(request: Request) {
  try {
    const { to, subject, html, from = 'onboarding@resend.dev' } = await request.json();

    console.log('Received email request:', { 
      to, 
      subject, 
      from,
      hasHtml: !!html,
      envApiKey: apiKey ? '***' + apiKey.slice(-4) : 'Not set' 
    });

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: to' },
        { status: 400 }
      );
    }
    if (!subject) {
      return NextResponse.json(
        { error: 'Missing required field: subject' },
        { status: 400 }
      );
    }
    if (!html) {
      return NextResponse.json(
        { error: 'Missing required field: html' },
        { status: 400 }
      );
    }

    // Send email
    const { data, error } = await resend.emails.send({
      from: `HVAC Service <${from}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          message: error.message || 'Unknown error',
          code: error.name || 'RESEND_ERROR',
          details: error
        }, 
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', { messageId: data?.id });
    return NextResponse.json({ 
      success: true,
      messageId: data?.id,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Unexpected error in send email API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
