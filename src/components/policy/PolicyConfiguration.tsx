import React, { useState, useEffect } from 'react';
import { Shield, Save, Info } from 'lucide-react';
import { useProtectionPolicy, useSetProtectionPolicy } from '@/hooks';
import { useTokenList } from '@/hooks/useTokenList';
import { getStablecoins } from '@/config/tokens';
import { useWaitForTransaction } from 'wagmi';
import toast from 'react-hot-toast';

const EnhancedPolicyConfiguration: React.FC = () => {
  const { policy, isLoading: isPolicyLoading } = useProtectionPolicy();
  const { tokens } = useTokenList();
  
  // Get stablecoins from token list
  const stablecoins = getStablecoins(tokens);

  const [crashThreshold, setCrashThreshold] = useState('10');
  const [maxSlippage, setMaxSlippage] = useState('5');
  const [selectedStablecoin, setSelectedStablecoin] = useState(stablecoins[0]?.address || '');

  useEffect(() => {
    if (policy) {
      const policyData = policy as any;
      setCrashThreshold((Number(policyData.crashThreshold) / 1e18).toString());
      setMaxSlippage((Number(policyData.maxSlippage) / 1e18).toString());
      setSelectedStablecoin(policyData.stablecoinPreference);
    }
  }, [policy]);

  const { write, data, isLoading } = useSetProtectionPolicy(
    parseFloat(crashThreshold) || 0,
    parseFloat(maxSlippage) || 0,
    selectedStablecoin
  );

  const { isLoading: isConfirming } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      toast.success('Protection policy updated successfully!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (write) {
      write();
    }
  };

  if (isPolicyLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const selectedToken = stablecoins.find(t => t.address === selectedStablecoin);

  return (
    <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
          <Shield className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Protection Policy</h2>
          <p className="text-sm text-gray-400">Configure your crash protection settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Crash Threshold (%)</label>
          <input
            type="number"
            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="10"
            value={crashThreshold}
            onChange={(e) => setCrashThreshold(e.target.value)}
            step="0.1"
            min="0"
            max="100"
            required
          />
          <div className="mt-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-cyan-300">
                Emergency action triggers when asset price drops by this percentage
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Max Slippage (%)</label>
          <input
            type="number"
            className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="5"
            value={maxSlippage}
            onChange={(e) => setMaxSlippage(e.target.value)}
            step="0.1"
            min="0"
            max="50"
            required
          />
          <div className="mt-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-cyan-300">
                Maximum acceptable price impact during emergency conversion
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Stablecoin</label>
          <div className="space-y-2">
            {stablecoins.map((stablecoin) => (
              <button
                key={stablecoin.address}
                type="button"
                onClick={() => setSelectedStablecoin(stablecoin.address)}
                className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                  selectedStablecoin === stablecoin.address
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  {stablecoin.logoURI && (
                    <img
                      src={stablecoin.logoURI}
                      alt={stablecoin.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-white">{stablecoin.symbol}</p>
                    <p className="text-xs text-gray-400">{stablecoin.name}</p>
                  </div>
                </div>
                {selectedStablecoin === stablecoin.address && (
                  <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-2 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-cyan-300">
                Assets will be converted to {selectedToken?.symbol || 'this stablecoin'} during emergency
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={`w-full inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-3 text-sm bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,197,94,0.3)] ${
            isLoading || isConfirming ? 'cursor-wait' : ''
          }`}
          disabled={!selectedStablecoin || isLoading || isConfirming}
        >
          {(isLoading || isConfirming) && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          <Save className="h-4 w-4 mr-2" />
          {isConfirming ? 'Confirming...' : 'Save Policy'}
        </button>
      </form>
    </div>
  );
};

export default EnhancedPolicyConfiguration;
