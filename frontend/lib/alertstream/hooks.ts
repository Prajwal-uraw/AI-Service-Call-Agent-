import { useState, useEffect } from 'react';
import { AlertStreamAPI } from './api';
import type { Website, Trigger, SMSMessage, Analytics, Usage } from './types';

export function useAlertStreamAPI() {
  const [api, setApi] = useState<AlertStreamAPI | null>(null);

  useEffect(() => {
    // For now, create API instance without auth token
    // TODO: Integrate with Supabase auth when user authentication is implemented
    setApi(new AlertStreamAPI(''));
  }, []);

  return api;
}

export function useWebsites() {
  const api = useAlertStreamAPI();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (api) {
      api.getWebsites()
        .then(setWebsites)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [api]);

  const createWebsite = async (name: string, domain: string) => {
    if (!api) throw new Error('API not initialized');
    const website = await api.createWebsite({ name, domain });
    setWebsites([...websites, website]);
    return website;
  };

  const deleteWebsite = async (id: string) => {
    if (!api) throw new Error('API not initialized');
    await api.deleteWebsite(id);
    setWebsites(websites.filter(w => w.id !== id));
  };

  return { websites, loading, error, createWebsite, deleteWebsite };
}

export function useTriggers(websiteId?: string) {
  const api = useAlertStreamAPI();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (api) {
      api.getTriggers(websiteId)
        .then(setTriggers)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [api, websiteId]);

  const createTrigger = async (data: Partial<Trigger>) => {
    if (!api) throw new Error('API not initialized');
    const trigger = await api.createTrigger(data as any);
    setTriggers([...triggers, trigger]);
    return trigger;
  };

  const deleteTrigger = async (id: string) => {
    if (!api) throw new Error('API not initialized');
    await api.deleteTrigger(id);
    setTriggers(triggers.filter(t => t.id !== id));
  };

  return { triggers, loading, error, createTrigger, deleteTrigger };
}

export function useSMSHistory(filters?: { status?: string; websiteId?: string }) {
  const api = useAlertStreamAPI();
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (api) {
      api.getSMSHistory(filters)
        .then(data => setMessages(data.messages))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [api, filters?.status, filters?.websiteId]);

  return { messages, loading, error };
}

export function useAnalytics(dateRange: string = '30d') {
  const api = useAlertStreamAPI();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (api) {
      api.getAnalytics(dateRange)
        .then(setAnalytics)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [api, dateRange]);

  return { analytics, loading, error };
}

export function useUsage() {
  const api = useAlertStreamAPI();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (api) {
      api.getUsage()
        .then(setUsage)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [api]);

  return { usage, loading, error };
}
