import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpCircle,
  AlertTriangle,
  Shield,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useGuardXAlerts } from '@/hooks/useGuardX';
import { type MonitorAlert } from '@/services/guardxApi';

interface AlertAwareWithdrawFormProps {
  selectedToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  amount: string;
  onWithdraw: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const AlertAwareWithdrawForm: React.FC<AlertAwareWithdrawFormProps> = ({
  selectedToken,
  amount,
  onWithdraw,
  isLoading,
  disabled,
}) => {
  const { address } = useAccount();
  const { checkCrashAlerts } = useGuardXAlerts();
  
  const [alertCheck, setAlertCheck] = useState<{
    hasAlerts: boolean;
    alerts: MonitorAlert[];
    shouldWithdraw: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  } | null>(null);
  const [isCheckingAlerts, setIsCheckingAlerts] = useState(false);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [userConfirmedWithdraw, setUserConfirmedWithdraw] = useState(false);

  // Check for crash alerts when token or amount changes
  const performAlertCheck = useCallback(async () => {
    if (!address || !selectedToken || !amount) return;

    setIsCheckingAlerts(true);
    try {
      const result = await checkCrashAlerts([selectedToken.symbol]);
      setAlertCheck(result);
      
      // Reset user confirmation when new alerts are found
      if (result?.hasAlerts && !userConfirmedWithdraw) {
        setUserConfirmedWithdraw(false);
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    } finally {
      setIsCheckingAlerts(false);
    }
  }, [address, selectedToken, amount, checkCrashAlerts, userConfirmedWithdraw]);

  useEffect(() => {
    performAlertCheck();
  }, [performAlertCheck]);

  const handleWithdraw = () => {
    if (alertCheck?.shouldWithdraw && !userConfirmedWithdraw) {
      // Show confirmation dialog for high-risk withdrawals
      setShowAlertDetails(true);
      return;
    }
    
    onWithdraw();
  };

  const handleConfirmedWithdraw = () => {
    setUserConfirmedWithdraw(true);
    setShowAlertDetails(false);
    onWithdraw();
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'high': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-green-400 border-green-500/30 bg-green-500/10';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return <XCircle className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'medium': return <Clock className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getRiskMessage = (riskLevel: string, shouldWithdraw: boolean) => {
    if (shouldWithdraw) {
      return riskLevel === 'critical' 
        ? 'CRITICAL: Immediate withdrawal recommended due to high crash probability!'
        : 'HIGH RISK: Consider withdrawing due to detected market instability.';
    }
    
    switch (riskLevel) {
      case 'medium': return 'MODERATE RISK: Some market volatility detected. Monitor closely.';
      case 'low': return 'LOW RISK: No significant crash alerts detected.';
      default: return 'Market conditions appear stable.';
    }
  };

  if (isCheckingAlerts) {
    return (
      <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-red-400" />
          <span className="text-white">Checking crash alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Status Display */}
      {alertCheck && (
        <div className={`p-4 rounded-xl border ${getRiskColor(alertCheck.riskLevel)}`}>
          <div className="flex items-start gap-3">
            {getRiskIcon(alertCheck.riskLevel)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">
                  Risk Assessment: {alertCheck.riskLevel.toUpperCase()}
                </h4>
                {alertCheck.hasAlerts && (
                  <button
                    onClick={() => setShowAlertDetails(!showAlertDetails)}
                    className="text-xs underline opacity-75 hover:opacity-100"
                  >
                    {showAlertDetails ? 'Hide' : 'Show'} Details
                  </button>
                )}
              </div>
              <p className="text-sm opacity-90">
                {getRiskMessage(alertCheck.riskLevel, alertCheck.shouldWithdraw)}
              </p>
              
              {alertCheck.hasAlerts && (
                <div className="mt-2 text-xs opacity-75">
                  {alertCheck.alerts.length} active alert{alertCheck.alerts.length !== 1 ? 's' : ''} found
                </div>
              )}
            </div>
          </div>

          {/* Alert Details */}
          {showAlertDetails && alertCheck.hasAlerts && (
            <div className="mt-4 pt-4 border-t border-current/20">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Recent Crash Alerts
              </h5>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {alertCheck.alerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="p-3 bg-black/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{alert.symbol}</span>
                      <span className="text-xs">
                        {new Date(alert.crash_detected_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Crash Probability: {(alert.crash_probability * 100).toFixed(1)}%</div>
                      <div>Price Drop: {alert.price_drop.toFixed(2)}%</div>
                      <div>Confidence: {alert.confidence_level}</div>
                    </div>
                    {alert.analysis && (
                      <div className="mt-2 text-xs opacity-75 line-clamp-2">
                        {alert.analysis}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Withdrawal Recommendation */}
          {alertCheck.shouldWithdraw && (
            <div className="mt-4 p-3 bg-black/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium mb-1">GuardX Recommendation</div>
                  <div className="opacity-90">
                    Based on AI analysis and crash detection algorithms, we recommend 
                    withdrawing your {selectedToken.symbol} position to protect against 
                    potential losses.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Withdrawal Button */}
      <button
        onClick={handleWithdraw}
        disabled={disabled || isLoading}
        className={`w-full p-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          alertCheck?.shouldWithdraw
            ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
        } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ArrowUpCircle className="h-4 w-4" />
            {alertCheck?.shouldWithdraw ? 'Emergency Withdraw' : 'Withdraw'} {selectedToken.symbol}
          </>
        )}
      </button>

      {/* Confirmation Modal */}
      {showAlertDetails && alertCheck?.shouldWithdraw && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-red-500/30 p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">Confirm Emergency Withdrawal</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">
                  <strong>High Risk Detected:</strong> Our AI systems have detected a high 
                  probability of market crash for {selectedToken.symbol}. Immediate withdrawal 
                  is recommended to protect your assets.
                </p>
              </div>
              
              <div className="text-sm text-gray-300">
                <div className="mb-2"><strong>Withdrawal Amount:</strong> {amount} {selectedToken.symbol}</div>
                <div className="mb-2"><strong>Risk Level:</strong> {alertCheck.riskLevel.toUpperCase()}</div>
                <div><strong>Active Alerts:</strong> {alertCheck.alerts.length}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAlertDetails(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedWithdraw}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertAwareWithdrawForm;