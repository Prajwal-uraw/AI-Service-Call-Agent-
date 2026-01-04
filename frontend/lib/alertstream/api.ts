import type {
  Website,
  CreateWebsiteInput,
  UpdateWebsiteInput,
  Trigger,
  CreateTriggerInput,
  UpdateTriggerInput,
  SMSMessage,
  SMSFilters,
  Analytics,
  Usage,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_ALERTSTREAM_API || 'http://localhost:3001/api/v1';

export class AlertStreamAPI {
  private baseURL: string;
  private token: string;

  constructor(token: string) {
    this.baseURL = process.env.NEXT_PUBLIC_ALERTSTREAM_API || 'http://localhost:4000/api/v1';
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Websites
  async getWebsites(): Promise<Website[]> {
    return this.request<Website[]>('/websites');
  }

  async getWebsite(id: string): Promise<Website> {
    return this.request<Website>(`/websites/${id}`);
  }

  async createWebsite(data: CreateWebsiteInput): Promise<Website> {
    return this.request<Website>('/websites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWebsite(id: string, data: UpdateWebsiteInput): Promise<Website> {
    return this.request<Website>(`/websites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWebsite(id: string): Promise<void> {
    return this.request<void>(`/websites/${id}`, {
      method: 'DELETE',
    });
  }

  async rotateKeys(id: string): Promise<Website> {
    return this.request<Website>(`/websites/${id}/rotate-keys`, {
      method: 'POST',
    });
  }

  async getSnippet(id: string): Promise<{ snippet: string }> {
    return this.request<{ snippet: string }>(`/websites/${id}/snippet`);
  }

  // Triggers
  async getTriggers(websiteId?: string): Promise<Trigger[]> {
    const query = websiteId ? `?website_id=${websiteId}` : '';
    return this.request<Trigger[]>(`/triggers${query}`);
  }

  async getTrigger(id: string): Promise<Trigger> {
    return this.request<Trigger>(`/triggers/${id}`);
  }

  async createTrigger(data: CreateTriggerInput): Promise<Trigger> {
    return this.request<Trigger>('/triggers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrigger(id: string, data: UpdateTriggerInput): Promise<Trigger> {
    return this.request<Trigger>(`/triggers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTrigger(id: string): Promise<void> {
    return this.request<void>(`/triggers/${id}`, {
      method: 'DELETE',
    });
  }

  async testTrigger(id: string, testData: any): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/triggers/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(testData),
    });
  }

  // SMS History
  async getSMSHistory(filters?: SMSFilters): Promise<{ messages: SMSMessage[]; total: number; page: number }> {
    const query = new URLSearchParams(filters as any).toString();
    return this.request<{ messages: SMSMessage[]; total: number; page: number }>(`/sms/history?${query}`);
  }

  async getSMSMessage(id: string): Promise<SMSMessage> {
    return this.request<SMSMessage>(`/sms/${id}`);
  }

  // Analytics
  async getAnalytics(range: string = '30d'): Promise<Analytics> {
    return this.request<Analytics>(`/analytics?range=${range}`);
  }

  // Billing
  async getUsage(): Promise<Usage> {
    return this.request<Usage>('/billing/usage');
  }

  async createSubscription(planId: string, paymentMethodId: string): Promise<{ subscription: any }> {
    return this.request<{ subscription: any }>('/billing/subscription', {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethodId }),
    });
  }

  async cancelSubscription(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/billing/subscription', {
      method: 'DELETE',
    });
  }
}
