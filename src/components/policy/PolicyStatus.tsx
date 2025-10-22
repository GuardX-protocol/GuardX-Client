import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProtectionPolicy } from '@/hooks';

const PolicyStatus: React.FC = () => {
  const { policy, isLoading } = useProtectionPolicy();

  if (isLoading) {
    return (
      <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-800 rounded w-1/3"></div>
          <div className="h-6 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Check if policy is set (crashThreshold > 0)
  const policyData = policy as any;
  const hasPolicy = policyData && policyData.crashThreshold && Number(policyData.crashThreshold) > 0;

  if (!hasPolicy) {
    return (
      <div className="p-6 bg-black/50 rounded-2xl border border-yellow-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(234,179,8,0.2)]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-yellow-400" />
          <div>
            <p className="font-semibold text-white">No Protection Active</p>
            <p className="text-sm text-gray-400">Configure your policy to enable protection</p>
          </div>
        </div>
      </div>
    );
  }

  const threshold = policyData.crashThreshold;
  const slippage = policyData.maxSlippage;
  const isActive = Number(threshold) > 0;

  return (
    <div className={`p-6 bg-black/50 rounded-2xl border backdrop-blur-sm ${
      isActive 
        ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
        : 'border-gray-800/50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isActive ? (
            <CheckCircle className="h-8 w-8 text-green-400" />
          ) : (
            <Shield className="h-8 w-8 text-gray-400" />
          )}
          <div>
            <p className="font-semibold text-white">
              {isActive ? 'Protection Active' : 'Protection Inactive'}
            </p>
            <p className="text-sm text-gray-400">Your portfolio is being monitored</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800/50">
          <p className="text-xs text-gray-400">Crash Threshold</p>
          <p className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {(Number(threshold) / 1e18).toFixed(1)}%
          </p>
        </div>
        <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800/50">
          <p className="text-xs text-gray-400">Max Slippage</p>
          <p className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {(Number(slippage) / 1e18).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyStatus;
