/**
 * Mock API Layer for Multi-Tenant System
 * Use this until backend is ready
 */

export interface TenantStats {
  total_calls: number;
  calls_this_month: number;
  max_monthly_calls: number;
  upcoming_appointments: number;
  total_appointments: number;
  health_score: number;
  plan_tier: string;
  company_name: string;
}

export interface CallLog {
  id: string;
  from: string;
  customer_name: string;
  duration: number;
  outcome: string;
  created_at: string;
  service_type: string;
}

export interface HealthMetrics {
  overall_score: number;
  usage_score: number;
  engagement_score: number;
  payment_score: number;
  support_score: number;
}

export interface Tenant {
  id: string;
  slug: string;
  company_name: string;
  owner_email: string;
  plan_tier: string;
  subscription_status: string;
  is_active: boolean;
  created_at: string;
}

class MockTenantAPI {
  /**
   * Get tenant dashboard statistics
   * NOTE: Returns empty/zero data - connect to real backend API
   */
  async getStats(): Promise<TenantStats> {
    await this.delay(300);
    return {
      total_calls: 0,
      calls_this_month: 0,
      max_monthly_calls: 1500,
      upcoming_appointments: 0,
      total_appointments: 0,
      health_score: 0,
      plan_tier: "trial",
      company_name: "Your Company"
    };
  }

  /**
   * Get recent call history
   * NOTE: Returns empty array - connect to real backend API
   */
  async getCallHistory(limit: number = 10): Promise<CallLog[]> {
    await this.delay(400);
    return [];
  }

  /**
   * Get health score breakdown
   * NOTE: Returns zero metrics - connect to real backend API
   */
  async getHealthMetrics(): Promise<HealthMetrics> {
    await this.delay(200);
    return {
      overall_score: 0,
      usage_score: 0,
      engagement_score: 0,
      payment_score: 0,
      support_score: 0
    };
  }

  /**
   * Create new tenant (onboarding)
   */
  async createTenant(data: any): Promise<Tenant> {
    await this.delay(1000);
    
    // Simulate validation
    if (!data.company_name || !data.owner_email) {
      throw new Error("Company name and owner email are required");
    }

    return {
      id: this.generateId(),
      slug: data.slug,
      company_name: data.company_name,
      owner_email: data.owner_email,
      plan_tier: data.plan_tier,
      subscription_status: "trial",
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Update tenant settings
   */
  async updateSettings(settings: any): Promise<{ success: boolean }> {
    await this.delay(800);
    console.log("Settings updated:", settings);
    return { success: true };
  }

  /**
   * Toggle feature flag (SECRET TIP #2)
   */
  async toggleFeature(feature: string, enabled: boolean): Promise<{ success: boolean }> {
    await this.delay(300);
    console.log(`Feature ${feature} ${enabled ? 'enabled' : 'disabled'}`);
    return { success: true };
  }

  /**
   * Toggle sandbox mode (SECRET TIP #7)
   */
  async toggleSandboxMode(enabled: boolean): Promise<{ success: boolean }> {
    await this.delay(300);
    console.log(`Sandbox mode ${enabled ? 'enabled' : 'disabled'}`);
    return { success: true };
  }

  // Helper methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `tenant_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const mockAPI = new MockTenantAPI();

// Export for easy import
export default mockAPI;
