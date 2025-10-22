import React, { useState } from 'react';
import { ArrowDownCircle, TrendingUp, BarChart3 } from 'lucide-react';
import DepositForm from '@/components/deposit/DepositForm';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';
import TokenListItem from '@/components/prices/TokenListItem';
import TokenPriceChart from '@/components/prices/TokenPriceChart';
import { useNetworkTokens } from '@/hooks/useNetworkTokens';
import { usePythContractPrices } from '@/hooks/usePythContractPrices';
import { TokenInfo } from '@uniswap/token-lists';

const Deposit: React.FC = () => {
  const { tokens, isLoading, chainName } = useNetworkTokens();
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);

  // Show popular tokens for quick access (limit to available tokens)
  const popularTokens = tokens.slice(0, 6);

  // Batch fetch prices for popular tokens
  const { priceMap, isLoading: isLoadingPrices } = usePythContractPrices(popularTokens);

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl glow">
          <ArrowDownCircle className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Deposit</h1>
          <p className="text-gray-400">
            Add assets to your protected portfolio on {chainName || 'current network'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DepositForm />
        <div className="space-y-6">
          <PortfolioOverview />
          
          {/* Market Overview */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-100">Market Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
                <p className="text-sm text-emerald-300 font-medium">Total Value Locked</p>
                <p className="text-2xl font-bold text-emerald-100">$2.4M</p>
              </div>
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                <p className="text-sm text-blue-300 font-medium">Active Users</p>
                <p className="text-2xl font-bold text-blue-100">1,247</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Assets */}
      <div className="card">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-100">Popular Assets</h2>
          </div>
          <p className="text-gray-400 mt-1">Click any asset to view detailed analytics</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-800/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTokens.map((token) => (
              <TokenListItem
                key={token.address}
                token={token}
                onClick={() => setSelectedToken(token)}
                priceData={priceMap.get(token.symbol.toUpperCase())}
                isLoading={isLoadingPrices}
                showBalance={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Price Chart Modal */}
      {selectedToken && (
        <TokenPriceChart
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </div>
  );
};

export default Deposit;