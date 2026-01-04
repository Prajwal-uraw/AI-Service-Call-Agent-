/**
 * AlertStream API Client
 * Connects frontend to AlertStream backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_ALERTSTREAM_API_URL || 'http://localhost:4000';

export interface Website {
  id: string;
  domain: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
}

export interface Trigger {
  id: string;
  website_id: string;
  name: string;
  event_type: string;
  conditions: any[];
  sms_template: string;
  phone_number: string;
  is_active: boolean;
}

export interface SMSMessage {
  id: string;
  user_id: string;
  trigger_id: string;
  phone_number: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  cost: number;
  created_at: string;
}

export class AlertStreamAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Authentication
  async register(data: { email: string; password: string; phone_number: string }) {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Websites
  async getWebsites(): Promise<Website[]> {
    return this.request('/api/v1/websites');
  }

  async getWebsite(id: string): Promise<Website> {
    return this.request(`/api/v1/websites/${id}`);
  }

  async createWebsite(data: { domain: string }): Promise<Website> {
    return this.request('/api/v1/websites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteWebsite(id: string): Promise<void> {
    return this.request(`/api/v1/websites/${id}`, {
      method: 'DELETE',
    });
  }

  async regenerateApiKey(id: string): Promise<Website> {
    return this.request(`/api/v1/websites/${id}/regenerate-key`, {
      method: 'POST',
    });
  }

  // Triggers
  async getTriggers(websiteId?: string): Promise<Trigger[]> {
    const query = websiteId ? `?website_id=${websiteId}` : '';
    return this.request(`/api/v1/triggers${query}`);
  }

  async getTrigger(id: string): Promise<Trigger> {
    return this.request(`/api/v1/triggers/${id}`);
  }

  async createTrigger(data: {
    website_id: string;
    name: string;
    event_type: string;
    conditions: any[];
    sms_template: string;
    phone_number: string;
  }): Promise<Trigger> {
    return this.request('/api/v1/triggers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrigger(id: string, data: Partial<Trigger>): Promise<Trigger> {
    return this.request(`/api/v1/triggers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTrigger(id: string): Promise<void> {
    return this.request(`/api/v1/triggers/${id}`, {
      method: 'DELETE',
    });
  }

  // SMS History
  async getSMSHistory(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ messages: SMSMessage[]; total: number }> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/sms${query ? `?${query}` : ''}`);
  }

  async getSMSStats(): Promise<{
    total_sent: number;
    total_delivered: number;
    total_failed: number;
    total_cost: number;
  }> {
    return this.request('/api/v1/sms/stats');
  }

  // Analytics
  async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    website_id?: string;
  }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/v1/analytics${query ? `?${query}` : ''}`);
  }

  // Billing
  async getBillingInfo(): Promise<{
    plan: string;
    current_usage: number;
    monthly_limit: number;
    billing_cycle_start: string;
    billing_cycle_end: string;
  }> {
    return this.request('/api/v1/billing');
  }

  async upgradePlan(plan: string): Promise<any> {
    return this.request('/api/v1/billing/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  }

  // Health Check
  async healthCheck(): Promise<any> {
    return fetch(`${API_BASE_URL}/health`).then(r => r.json());
  }
}

// Singleton instance
let apiInstance: AlertStreamAPI | null = null;

export function getAlertStreamAPI(token?: string): AlertStreamAPI {
  if (!apiInstance && token) {
    apiInstance = new AlertStreamAPI(token);
  }
  if (!apiInstance) {
    throw new Error('AlertStream API not initialized. Please provide a token.');
  }
  return apiInstance;
}

export function initAlertStreamAPI(token: string): AlertStreamAPI {
  apiInstance = new AlertStreamAPI(token);
  return apiInstance;
}
