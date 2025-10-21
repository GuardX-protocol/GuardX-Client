import React, { useState } from 'react';
import { ArrowDownCircle, Info, TrendingUp } from 'lucide-react';
import EnhancedDepositForm from '@/components/deposit/EnhancedDepositForm';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';
import TokenListItem from '@/components/prices/TokenListItem';
import TokenPriceChart from '@/components/prices/TokenPriceChart';
import { useAccount } from 'wagmi';
import { useTokenList } from '@/hooks/useTokenList';
import { usePythPriceMultiple } from '@/hooks/usePythPriceMultiple';
import { TokenInfo } from '@uniswap/token-lists';

const Deposit: React.FC = () => {
  const { isConnected } = useAccount();
  const { tokens, isLoading } = useTokenList();
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);

  // Show popular tokens for quick access
  const popularTokens = tokens.filter(t => 
    ['WETH', 'USDC', 'DAI', 'WBTC', 'UNI', 'LINK'].includes(t.symbol)
  ).slice(0, 6);
  
  // Batch fetch prices for popular tokens
  const { priceMap, isLoading: isLoadingPrices } = usePythPriceMultiple(
    popularTokens.map(t => t.symbol)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <ArrowDownCircle className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deposit Assets</h1>
            <p className="text-sm text-gray-500">Add tokens to your protected portfolio</p>
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
                Connect your wallet to deposit assets and start protecting your portfolio
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnhancedDepositForm />
        <PortfolioOverview />
      </div>

      {/* Popular Tokens Section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Popular Tokens</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Click on any token to view detailed price charts and statistics
        </p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularTokens.map((token) => (
              <TokenListItem
                key={token.address}
                token={token}
                onClick={() => setSelectedToken(token)}
                priceData={priceMap.get(token.symbol.toUpperCase())}
                isLoading={isLoadingPrices}
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