import React, { useState, useMemo } from 'react';
import { DollarSign, RefreshCw, Search, TrendingUp } from 'lucide-react';
import { useTokenList } from '@/hooks/useTokenList';
import { useLivePrices } from '@/hooks/useLivePrices';
import { isStablecoin } from '@/config/tokens';
import TokenListItem from '@/components/prices/TokenListItem';
import TokenPriceChart from '@/components/prices/TokenPriceChart';
import { TokenInfo } from '@uniswap/token-lists';

/**
 * Prices page - fetches live prices from PythPriceMonitor contract
 * No hardcoded values
 */
const Prices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [category, setCategory] = useState<'all' | 'trending' | 'stablecoins' | 'defi'>('all');
  
  const { tokens, isLoading: isLoadingTokens } = useTokenList();

  const filteredTokens = useMemo(() => {
    let filtered = tokens;

    if (category === 'stablecoins') {
      filtered = filtered.filter(t => isStablecoin(t.symbol));
    } else if (category === 'defi') {
      filtered = filtered.filter(t => 
        ['UNI', 'AAVE', 'COMP', 'MKR', 'CRV', 'SUSHI', 'SNX', 'LDO', 'BAL', 'YFI'].includes(t.symbol)
      );
    } else if (category === 'trending') {
      filtered = filtered.filter(t => 
        ['ETH', 'WETH', 'BTC', 'WBTC', 'UNI', 'LINK', 'AAVE', 'MATIC', 'ARB', 'OP'].includes(t.symbol)
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(token =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [tokens, searchQuery, category]);

  const { priceMap, isLoading: isLoadingPrices, refetch } = useLivePrices(filteredTokens);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Prices</h1>
            <p className="text-sm text-gray-500">Real-time prices from PythPriceMonitor contract</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingPrices ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Live Blockchain Prices</h3>
            <p className="text-sm text-gray-600">
              All prices fetched directly from PythPriceMonitor smart contract. Click any token to view detailed charts.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tokens by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'trending', 'stablecoins', 'defi'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  category === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoadingTokens ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTokens.map((token) => {
              const price = priceMap.get(token.symbol.toUpperCase());
              return (
                <TokenListItem
                  key={token.address}
                  token={token}
                  onClick={() => setSelectedToken(token)}
                  priceData={price ? {
                    price: BigInt(Math.floor(price.price * 1e8)),
                    confidence: BigInt(price.confidence),
                    expo: -8,
                    publishTime: BigInt(price.timestamp),
                    formattedPrice: price.formattedPrice,
                  } : undefined}
                  isLoading={isLoadingPrices}
                />
              );
            })}
          </div>

          {filteredTokens.length === 0 && (
            <div className="card text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No tokens found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter</p>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            Showing {filteredTokens.length} of {tokens.length} tokens
            {isLoadingPrices && <span className="ml-2">(Loading prices...)</span>}
          </div>
        </>
      )}

      {selectedToken && (
        <TokenPriceChart
          token={selectedToken}
          onClose={() => setSelectedToken(null)}
        />
      )}
    </div>
  );
};

export default Prices;
