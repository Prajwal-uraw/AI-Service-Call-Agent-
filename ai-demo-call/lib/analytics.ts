/**
 * Analytics Tracking for AI Demo
 * Tracks engagement, conversions, and user behavior
 */

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
}

interface DemoSession {
  sessionId: string;
  prospectId?: string;
  startTime: number;
  endTime?: number;
  completionRate: number;
  slidesViewed: number[];
  dropOffSlide?: number;
  totalDuration: number;
  events: AnalyticsEvent[];
}

class DemoAnalytics {
  private session: DemoSession | null = null;
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/analytics') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Start a new demo session
   */
  startSession(prospectId?: string): string {
    const sessionId = this.generateSessionId();
    
    this.session = {
      sessionId,
      prospectId,
      startTime: Date.now(),
      completionRate: 0,
      slidesViewed: [],
      totalDuration: 0,
      events: [],
    };

    this.track('demo_started', {
      session_id: sessionId,
      prospect_id: prospectId,
      source: this.getSource(),
      device: this.getDevice(),
      browser: this.getBrowser(),
    });

    return sessionId;
  }

  /**
   * Track slide view
   */
  trackSlideView(slideNumber: number, slideTitle: string) {
    if (!this.session) return;

    if (!this.session.slidesViewed.includes(slideNumber)) {
      this.session.slidesViewed.push(slideNumber);
    }

    this.track('slide_viewed', {
      session_id: this.session.sessionId,
      slide_number: slideNumber,
      slide_title: slideTitle,
      time_in_demo: Date.now() - this.session.startTime,
    });
  }

  /**
   * Track phase transition
   */
  trackPhaseChange(phase: 'warmup' | 'slides' | 'close') {
    if (!this.session) return;

    this.track('phase_changed', {
      session_id: this.session.sessionId,
      phase,
      time_in_demo: Date.now() - this.session.startTime,
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: 'play' | 'pause' | 'stop' | 'replay') {
    if (!this.session) return;

    this.track('user_interaction', {
      session_id: this.session.sessionId,
      action,
      time_in_demo: Date.now() - this.session.startTime,
    });
  }

  /**
   * Track demo completion
   */
  trackCompletion() {
    if (!this.session) return;

    this.session.endTime = Date.now();
    this.session.totalDuration = this.session.endTime - this.session.startTime;
    this.session.completionRate = 100;

    this.track('demo_completed', {
      session_id: this.session.sessionId,
      total_duration: this.session.totalDuration,
      slides_viewed: this.session.slidesViewed.length,
      completion_rate: 100,
    });

    this.endSession();
  }

  /**
   * Track demo abandonment
   */
  trackDropOff(currentSlide: number) {
    if (!this.session) return;

    this.session.endTime = Date.now();
    this.session.totalDuration = this.session.endTime - this.session.startTime;
    this.session.dropOffSlide = currentSlide;
    this.session.completionRate = (this.session.slidesViewed.length / 8) * 100;

    this.track('demo_abandoned', {
      session_id: this.session.sessionId,
      drop_off_slide: currentSlide,
      time_watched: this.session.totalDuration,
      slides_viewed: this.session.slidesViewed.length,
      completion_rate: this.session.completionRate,
    });

    this.endSession();
  }

  /**
   * Track conversion event
   */
  trackConversion(type: 'booked' | 'interested' | 'not_interested') {
    if (!this.session) return;

    this.track('conversion', {
      session_id: this.session.sessionId,
      conversion_type: type,
    });
  }

  /**
   * Generic event tracking
   */
  private track(event: string, properties: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    if (this.session) {
      this.session.events.push(analyticsEvent);
    }

    // Send to analytics endpoint
    this.sendToServer(analyticsEvent);

    // Also send to external analytics (Mixpanel, Amplitude, etc.)
    this.sendToExternalAnalytics(event, properties);
  }

  /**
   * End session and send final data
   */
  private endSession() {
    if (!this.session) return;

    // Send complete session data
    fetch(`${this.apiEndpoint}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.session),
    }).catch(err => console.error('Failed to send session data:', err));

    this.session = null;
  }

  /**
   * Send event to server
   */
  private sendToServer(event: AnalyticsEvent) {
    fetch(`${this.apiEndpoint}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(err => console.error('Failed to send analytics event:', err));
  }

  /**
   * Send to external analytics platforms
   */
  private sendToExternalAnalytics(event: string, properties: Record<string, any>) {
    // Mixpanel
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(event, properties);
    }

    // Amplitude
    if (typeof window !== 'undefined' && (window as any).amplitude) {
      (window as any).amplitude.getInstance().logEvent(event, properties);
    }

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get traffic source
   */
  private getSource(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const params = new URLSearchParams(window.location.search);
    return params.get('utm_source') || params.get('source') || 'direct';
  }

  /**
   * Get device type
   */
  private getDevice(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const ua = window.navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  /**
   * Get browser name
   */
  private getBrowser(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const ua = window.navigator.userAgent;
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Safari')) return 'safari';
    if (ua.includes('Edge')) return 'edge';
    return 'other';
  }
}

// Export singleton instance
export const analytics = new DemoAnalytics();

// Export types
export type { DemoSession, AnalyticsEvent };
