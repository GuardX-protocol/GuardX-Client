import React from 'react';
import { Shield, Info, Settings, Activity } from 'lucide-react';
import PolicyStatus from '@/components/policy/PolicyStatus';
import PolicyConfiguration from '@/components/policy/PolicyConfiguration';
import { useAccount } from 'wagmi';

const Policies: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-30 animate-pulse">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-1/10 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80"></div>
          <div className="relative z-10 flex items-center justify-between p-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-cyan-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <Shield className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] mb-2">Protection Policies</h1>
                <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-cyan-400" />
                  Configure automated crash protection
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isConnected && (
          <div className="p-6 bg-black/50 rounded-2xl border border-cyan-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-cyan-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">Connect Your Wallet</p>
                <p className="text-sm text-gray-300 mt-1">
                  Connect your wallet to manage protection policies
                </p>
              </div>
            </div>
          </div>
        )}

        <PolicyStatus />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PolicyConfiguration />

          <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              How It Works
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
                <p className="font-medium text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-cyan-400 text-black rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Real-Time Monitoring
                </p>
                <p className="text-sm text-gray-300">
                  Pyth Network oracles continuously monitor your asset prices with sub-second updates.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30 backdrop-blur-sm">
                <p className="font-medium text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-400 text-black rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Crash Detection
                </p>
                <p className="text-sm text-gray-300">
                  When price drops exceed your threshold, the system automatically triggers emergency protocols.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30 backdrop-blur-sm">
                <p className="font-medium text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-400 text-black rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Emergency Conversion
                </p>
                <p className="text-sm text-gray-300">
                  Assets are swapped to your chosen stablecoin through optimized DEX routing with slippage protection.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 backdrop-blur-sm">
                <p className="font-medium text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  Cross-Chain Coordination
                </p>
                <p className="text-sm text-gray-300">
                  Lit Protocol ensures synchronized protection across multiple blockchain networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Policies;