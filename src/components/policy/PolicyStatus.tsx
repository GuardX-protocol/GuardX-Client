import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProtectionPolicy } from '@/hooks';

const PolicyStatus: React.FC = () => {
  const { policy, isLoading } = useProtectionPolicy();

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Check if policy is set (crashThreshold > 0)
  const policyData = policy as any;
  const hasPolicy = policyData && policyData.crashThreshold && Number(policyData.crashThreshold) > 0;

  if (!hasPolicy) {
    return (
      <div className="card">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-warning-600" />
          <div>
            <p className="font-semibold text-gray-900">No Protection Active</p>
            <p className="text-sm text-gray-500">Configure your policy to enable protection</p>
          </div>
        </div>
      </div>
    );
  }

  const threshold = policyData.crashThreshold;
  const slippage = policyData.maxSlippage;
  const isActive = Number(threshold) > 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isActive ? (
            <CheckCircle className="h-8 w-8 text-success-600" />
          ) : (
            <Shield className="h-8 w-8 text-gray-400" />
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {isActive ? 'Protection Active' : 'Protection Inactive'}
            </p>
            <p className="text-sm text-gray-500">Your portfolio is being monitored</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Crash Threshold</p>
          <p className="text-lg font-semibold text-gray-900">
            {(Number(threshold) / 1e18).toFixed(1)}%
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Max Slippage</p>
          <p className="text-lg font-semibold text-gray-900">
            {(Number(slippage) / 1e18).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default PolicyStatus;
