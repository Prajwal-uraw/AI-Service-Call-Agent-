import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      numberOfTechnicians,
      currentCallVolume,
      primaryChallenge,
      source,
      leadType,
      reportTitle,
      timestamp
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !company || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create lead object
    const leadData = {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      numberOfTechnicians: numberOfTechnicians || 'Not specified',
      currentCallVolume: currentCallVolume || 'Not specified',
      primaryChallenge: primaryChallenge || 'Not specified',
      source: source || 'unknown',
      leadType: leadType || 'general',
      reportTitle: reportTitle || 'N/A',
      status: 'new',
      createdAt: timestamp || new Date().toISOString(),
      tags: ['sample_report', 'website_lead'],
      notes: `Lead captured from ${reportTitle || 'sample report download'}`,
    };

    // In production, this would save to your database
    // For now, we'll use the Supabase client or your existing backend
    
    // Option 1: Save to Supabase (if configured)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Failed to save lead to database');
      }

      // Also create a contact record
      await supabase.from('contacts').insert([{
        name: `${firstName} ${lastName}`,
        email,
        phone,
        company,
        title: jobTitle,
        source: 'sample_report',
        status: 'new',
        createdAt: timestamp || new Date().toISOString(),
      }]);

      return NextResponse.json({
        success: true,
        message: 'Lead captured successfully',
        leadId: data.id,
      });
    }

    // Option 2: Save to local storage or file system (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Lead captured (dev mode):', leadData);
      
      return NextResponse.json({
        success: true,
        message: 'Lead captured successfully (dev mode)',
        leadId: `dev-${Date.now()}`,
        data: leadData,
      });
    }

    // Option 3: Send to external CRM API
    // Uncomment and configure for your CRM
    /*
    const crmResponse = await fetch(process.env.CRM_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRM_API_KEY}`,
      },
      body: JSON.stringify(leadData),
    });

    if (!crmResponse.ok) {
      throw new Error('Failed to save to CRM');
    }

    const crmData = await crmResponse.json();
    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: crmData.id,
    });
    */

    // Fallback: Log and return success
    console.log('Lead captured:', leadData);
    
    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: `temp-${Date.now()}`,
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to capture lead',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
