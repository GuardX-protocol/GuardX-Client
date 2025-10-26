/**
 * GuardX API Service
 * Integrates with the GuardX Crypto Monitor API
 * Base URL: https://asi-crash-guard-x.vercel.app
 */

const GUARDX_API_BASE = 'https://asi-crash-guard-x.vercel.app';

export interface User {
  walletAddress: string;
  email?: string;
  telegramId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isActive?: boolean;
  notificationPreferences?: {
    telegram_alerts?: boolean;
    email_alerts?: boolean;
    webhook_alerts?: boolean;
  };
  monitors?: Array<{
    id: string;
    name: string;
    enabled: boolean;
    created_at: string;
    symbols: string[];
  }>;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface Monitor {
  name: string;
  userId: string;
  symbols: string[];
  crash_threshold: number;
  enabled: boolean;
  notification_channels: string[];
  last_check?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonitorAlert {
  monitorId: string;
  userId: string;
  symbol: string;
  token_name: string;
  crash_probability: number;
  current_price: number;
  price_drop: number;
  price_before_crash?: number;
  analysis: string;
  crash_detected_at: string;
  notification_sent: boolean;
  notification_channels: string[];
  telegram_sent: boolean;
  email_sent: boolean;
  webhook_sent: boolean;
  technical_indicators: any;
  asi_analysis?: string;
  confidence_level: 'low' | 'medium' | 'high' | 'very_high';
  createdAt: string;
}

export interface TokenPrice {
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap?: number;
  timestamp: string;
}

class GuardXApiService {
  private baseUrl = GUARDX_API_BASE;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // System endpoints
  async getSystemStatus() {
    return this.request('/system/status');
  }

  async getHealth() {
    return this.request('/health');
  }

  // User management
  async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(walletAddress: string): Promise<User> {
    return this.request<User>(`/users/${walletAddress}`);
  }

  async updateUser(walletAddress: string, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${walletAddress}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile(walletAddress: string) {
    return this.request(`/users/${walletAddress}/profile`);
  }

  async updateUserPreferences(
    walletAddress: string,
    preferences: {
      telegram_alerts?: boolean;
      email_alerts?: boolean;
      webhook_alerts?: boolean;
    }
  ) {
    return this.request(`/users/${walletAddress}/preferences`, {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  // Monitor management
  async createMonitor(userId: string, monitorData: Partial<Monitor>): Promise<Monitor> {
    return this.request<Monitor>(`/monitors/?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(monitorData),
    });
  }

  async getMonitors(userId: string): Promise<Monitor[]> {
    return this.request<Monitor[]>(`/monitors/?user_id=${userId}`);
  }

  async getMonitor(monitorId: string, userId: string): Promise<Monitor> {
    return this.request<Monitor>(`/monitors/${monitorId}?user_id=${userId}`);
  }

  async updateMonitor(
    monitorId: string,
    userId: string,
    monitorData: Partial<Monitor>
  ): Promise<Monitor> {
    return this.request<Monitor>(`/monitors/${monitorId}?user_id=${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(monitorData),
    });
  }

  async deleteMonitor(monitorId: string, userId: string): Promise<void> {
    return this.request(`/monitors/${monitorId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  async toggleMonitor(monitorId: string, userId: string) {
    return this.request(`/monitors/${monitorId}/toggle?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async getMonitorAlerts(
    monitorId: string,
    userId: string,
    options: { limit?: number; skip?: number } = {}
  ) {
    const params = new URLSearchParams({
      user_id: userId,
      ...Object.fromEntries(
        Object.entries(options).map(([k, v]) => [k, v?.toString() || ''])
      ),
    });
    return this.request(`/monitors/${monitorId}/alerts?${params}`);
  }

  async getMonitorStats(userId: string) {
    return this.request(`/monitors/stats/summary?user_id=${userId}`);
  }

  // Cryptocurrency data
  async getPrices(symbols?: string[], limit?: number): Promise<Record<string, TokenPrice>> {
    const params = new URLSearchParams();
    if (symbols?.length) params.set('symbols', symbols.join(','));
    if (limit) params.set('limit', limit.toString());
    
    const query = params.toString() ? `?${params}` : '';
    return this.request<Record<string, TokenPrice>>(`/crypto/prices${query}`);
  }

  async getPrice(symbol: string): Promise<TokenPrice> {
    return this.request<TokenPrice>(`/crypto/prices/${symbol}`);
  }

  async getRealTimePrice(symbol: string) {
    return this.request(`/crypto/prices/realtime/${symbol}`);
  }

  async testPriceSources(symbol: string) {
    return this.request(`/crypto/prices/test-sources/${symbol}`);
  }

  // Alerts
  async getAlerts(options: {
    user_id?: string;
    symbol?: string;
    severity?: string;
    limit?: number;
  } = {}): Promise<MonitorAlert[]> {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(options).map(([k, v]) => [k, v?.toString() || ''])
      )
    );
    return this.request<MonitorAlert[]>(`/crypto/alerts?${params}`);
  }

  // Check for crash alerts for a specific user and symbols
  async checkCrashAlerts(
    walletAddress: string,
    symbols: string[]
  ): Promise<{
    hasAlerts: boolean;
    alerts: MonitorAlert[];
    shouldWithdraw: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    try {
      // Get user's monitors
      const monitors = await this.getMonitors(walletAddress);
      
      if (!monitors.length) {
        return {
          hasAlerts: false,
          alerts: [],
          shouldWithdraw: false,
          riskLevel: 'low',
        };
      }

      // Get recent alerts for the user
      const alerts = await this.getAlerts({
        user_id: walletAddress,
        limit: 50,
      });

      // Filter alerts for the specified symbols and recent timeframe (last 24 hours)
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const relevantAlerts = alerts.filter(alert => {
        const alertTime = new Date(alert.crash_detected_at);
        const symbolMatch = symbols.some(symbol => 
          alert.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
          symbol.toLowerCase().includes(alert.symbol.toLowerCase().replace('USDT', ''))
        );
        return symbolMatch && alertTime > twentyFourHoursAgo;
      });

      // Determine risk level and withdrawal recommendation
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let shouldWithdraw = false;

      if (relevantAlerts.length > 0) {
        const highRiskAlerts = relevantAlerts.filter(
          alert => alert.confidence_level === 'high' || alert.confidence_level === 'very_high'
        );
        const avgCrashProbability = relevantAlerts.reduce(
          (sum, alert) => sum + alert.crash_probability, 0
        ) / relevantAlerts.length;

        if (highRiskAlerts.length > 0 && avgCrashProbability > 0.7) {
          riskLevel = 'critical';
          shouldWithdraw = true;
        } else if (avgCrashProbability > 0.5) {
          riskLevel = 'high';
          shouldWithdraw = true;
        } else if (avgCrashProbability > 0.3) {
          riskLevel = 'medium';
          shouldWithdraw = false; // Let user decide
        }
      }

      return {
        hasAlerts: relevantAlerts.length > 0,
        alerts: relevantAlerts,
        shouldWithdraw,
        riskLevel,
      };
    } catch (error) {
      console.error('Error checking crash alerts:', error);
      return {
        hasAlerts: false,
        alerts: [],
        shouldWithdraw: false,
        riskLevel: 'low',
      };
    }
  }

  // Telegram integration
  async sendTelegramMessage(telegramId: string, message: string) {
    return this.request('/telegram/send', {
      method: 'POST',
      body: JSON.stringify({
        telegram_id: telegramId,
        message,
        parse_mode: 'Markdown',
      }),
    });
  }

  async getTelegramStatus() {
    return this.request('/telegram/status');
  }

  async sendCrashAlert(alertData: {
    user_id: string;
    symbol: string;
    alert_type: string;
    crash_probability: number;
    price_change: number;
    current_price: number;
    severity: string;
    additional_info?: string;
  }) {
    return this.request('/telegram/send-alert', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }
}

export const guardxApi = new GuardXApiService();
export default guardxApi;