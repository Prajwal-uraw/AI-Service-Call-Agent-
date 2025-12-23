import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { email, name, phone, metadata } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      phone: phone || undefined,
      metadata: metadata || {},
    });

    return NextResponse.json({ customerId: customer.id, customer });
  } catch (error: any) {
    console.error('Stripe customer creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: 500 }
    );
  }
}
