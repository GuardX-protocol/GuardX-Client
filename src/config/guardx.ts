/**
 * GuardX API Configuration
 */

export const GUARDX_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_GUARDX_API_URL || 'https://asi-crash-guard-x.vercel.app',
  
  // Default settings
  DEFAULT_CRASH_THRESHOLD: 10, // 10% price drop
  DEFAULT_NOTIFICATION_CHANNELS: ['telegram'],
  
  // Risk level thresholds
  RISK_THRESHOLDS: {
    LOW: 0.3,
    MEDIUM: 0.5,
    HIGH: 0.7,
    CRITICAL: 0.85,
  },
  
  // Alert timeframes
  ALERT_TIMEFRAMES: {
    RECENT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    WEEK: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Supported symbols for monitoring
  SUPPORTED_SYMBOLS: [
    'BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'UNI', 'AAVE', 'COMP',
    'MKR', 'SNX', 'YFI', 'SUSHI', 'CRV', 'BAL', 'ALPHA', 'CREAM',
    'SOL', 'AVAX', 'MATIC', 'FTM', 'ATOM', 'LUNA', 'NEAR', 'ALGO',
  ],
  
  // Default monitor configuration
  DEFAULT_MONITOR: {
    symbols: ['BTC', 'ETH'],
    crash_threshold: 10,
    enabled: true,
    notification_channels: ['telegram'],
  },
} as const;

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export const getRiskLevel = (crashProbability: number): RiskLevel => {
  if (crashProbability >= GUARDX_CONFIG.RISK_THRESHOLDS.CRITICAL) return 'critical';
  if (crashProbability >= GUARDX_CONFIG.RISK_THRESHOLDS.HIGH) return 'high';
  if (crashProbability >= GUARDX_CONFIG.RISK_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
};

export const shouldRecommendWithdrawal = (
  crashProbability: number,
  confidenceLevel: string
): boolean => {
  const isHighConfidence = confidenceLevel === 'high' || confidenceLevel === 'very_high';
  return isHighConfidence && crashProbability >= GUARDX_CONFIG.RISK_THRESHOLDS.HIGH;
};