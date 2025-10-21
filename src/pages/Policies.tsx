import React from 'react';
import { Shield, Info } from 'lucide-react';
import PolicyStatus from '@/components/policy/PolicyStatus';
import PolicyConfiguration from '@/components/policy/PolicyConfiguration';
import { useAccount } from 'wagmi';

const Policies: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Protection Policies</h1>
            <p className="text-sm text-gray-500">Configure automated crash protection</p>
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="card bg-gradient-to-r from-blue-50 to-primary-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Connect Your Wallet</p>
              <p className="text-sm text-blue-700 mt-1">
                Connect your wallet to manage protection policies
              </p>
            </div>
          </div>
        </div>
      )}

      <PolicyStatus />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PolicyConfiguration />

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-primary-50 rounded-lg border border-blue-200">
              <p className="font-medium text-gray-900 mb-2">1. Real-Time Monitoring</p>
              <p className="text-sm text-gray-600">
                Pyth Network oracles continuously monitor your asset prices with sub-second updates.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="font-medium text-gray-900 mb-2">2. Crash Detection</p>
              <p className="text-sm text-gray-600">
                When price drops exceed your threshold, the system automatically triggers emergency protocols.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-success-50 to-green-50 rounded-lg border border-success-200">
              <p className="font-medium text-gray-900 mb-2">3. Emergency Conversion</p>
              <p className="text-sm text-gray-600">
                Assets are swapped to your chosen stablecoin through optimized DEX routing with slippage protection.
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-warning-50 to-yellow-50 rounded-lg border border-warning-200">
              <p className="font-medium text-gray-900 mb-2">4. Cross-Chain Coordination</p>
              <p className="text-sm text-gray-600">
                Lit Protocol ensures synchronized protection across multiple blockchain networks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;