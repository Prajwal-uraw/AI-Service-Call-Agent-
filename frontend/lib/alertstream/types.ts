// AlertStream TypeScript Types

export interface Website {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  api_key: string;
  hmac_secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWebsiteInput {
  name: string;
  domain: string;
}

export interface UpdateWebsiteInput {
  name?: string;
  domain?: string;
  is_active?: boolean;
}

export interface Trigger {
  id: string;
  website_id: string;
  name: string;
  event_type: string;
  conditions: TriggerCondition[];
  sms_template: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value: string;
}

export interface CreateTriggerInput {
  website_id: string;
  name: string;
  event_type: string;
  conditions?: TriggerCondition[];
  sms_template: string;
  phone_number: string;
}

export interface UpdateTriggerInput {
  name?: string;
  event_type?: string;
  conditions?: TriggerCondition[];
  sms_template?: string;
  phone_number?: string;
  is_active?: boolean;
}

export interface SMSMessage {
  id: string;
  trigger_id: string;
  website_id: string;
  phone_number: string;
  message: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  twilio_sid?: string;
  error_code?: string;
  error_message?: string;
  cost?: number;
  created_at: string;
  updated_at: string;
}

export interface SMSFilters {
  website_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface Analytics {
  total_sms: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  total_cost: number;
  sms_by_day: Array<{ date: string; count: number }>;
  sms_by_website: Array<{ website_name: string; count: number }>;
  sms_by_status: Array<{ status: string; count: number }>;
}

export interface Usage {
  plan: 'free' | 'starter' | 'pro' | 'business';
  sms_limit: number;
  sms_used: number;
  sms_remaining: number;
  billing_cycle_start: string;
  billing_cycle_end: string;
  overage_count: number;
  overage_cost: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  sms_limit: number;
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    sms_limit: 50,
    features: [
      '50 SMS per month',
      '1 website',
      'Basic support',
      'Email notifications',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 5,
    sms_limit: 500,
    features: [
      '500 SMS per month',
      '3 websites',
      'Email support',
      'SMS history',
      'Basic analytics',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    sms_limit: 5000,
    popular: true,
    features: [
      '5,000 SMS per month',
      '10 websites',
      'Priority support',
      'Advanced analytics',
      'Custom triggers',
      'API access',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    sms_limit: 50000,
    features: [
      '50,000 SMS per month',
      'Unlimited websites',
      'Dedicated support',
      'White-label option',
      'Custom integrations',
      'SLA guarantee',
      'Team management',
    ],
  },
];
