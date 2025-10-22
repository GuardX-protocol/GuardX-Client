import React, { useState, useMemo } from 'react';
import { DollarSign, RefreshCw, Search, Network } from 'lucide-react';
import { useEnhancedTokenList, useTokensByCategory, useTopTokensForPrices } from '@/hooks/useEnhancedTokenList';
import { usePythPrices, usePythTokensByCategory } from '@/hooks/usePythPrices';

import TokenListItem from '@/components/prices/TokenListItem';
import TokenPriceChart from '@/components/prices/TokenPriceChart';
import { TokenInfo } from '@uniswap/token-lists';

/**
 * Prices page - fetches live prices directly from Pyth contract
 * Dynamically uses the correct Pyth contract based on selected network
 */
const Prices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [category, setCategory] = useState<'all' | 'trending' | 'layer1' | 'stablecoins' | 'defi'>('trending');


  const { tokens, isLoading: isLoadingTokens } = useEnhancedTokenList();

  // Get category-specific tokens from Pyth
  const { tokens: pythStablecoins } = usePythTokensByCategory('stablecoins');
  const { tokens: pythDefiTokens } = usePythTokensByCategory('defi');
  const { tokens: pythLayer1Tokens } = usePythTokensByCategory('layer1');

  // Always call these hooks (Rules of Hooks)
  const localStablecoins = useTokensByCategory('stablecoins');
  const localDefiTokens = useTokensByCategory('defi');
  const localLayer1Tokens = useTokensByCategory('layer1');
  const topTokens = useTopTokensForPrices(20);

  // Create filtered token arrays using useMemo
  const stablecoins = useMemo(() => {
    if (pythStablecoins && pythStablecoins.length > 0 && tokens) {
      return tokens.filter(t => pythStablecoins.includes(t.symbol.toUpperCase()));
    }
    return localStablecoins || [];
  }, [pythStablecoins, tokens, localStablecoins]);

  const defiTokens = useMemo(() => {
    if (pythDefiTokens && pythDefiTokens.length > 0 && tokens) {
      return tokens.filter(t => pythDefiTokens.includes(t.symbol.toUpperCase()));
    }
    return localDefiTokens || [];
  }, [pythDefiTokens, tokens, localDefiTokens]);

  const layer1Tokens = useMemo(() => {
    if (pythLayer1Tokens && pythLayer1Tokens.length > 0 && tokens) {
      return tokens.filter(t => pythLayer1Tokens.includes(t.symbol.toUpperCase()));
    }
    return localLayer1Tokens || [];
  }, [pythLayer1Tokens, tokens, localLayer1Tokens]);

  const filteredTokens = useMemo(() => {
    let filtered = tokens || [];

    if (category === 'stablecoins') {
      filtered = Array.isArray(stablecoins) ? stablecoins : [];
    } else if (category === 'defi') {
      filtered = Array.isArray(defiTokens) ? defiTokens : [];
    } else if (category === 'trending') {
      filtered = Array.isArray(topTokens) ? topTokens : [];
    } else if (category === 'layer1') {
      filtered = Array.isArray(layer1Tokens) ? layer1Tokens : [];
    }

    if (searchQuery && Array.isArray(filtered)) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(token =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
      );
    }

    return Array.isArray(filtered) ? filtered.sort((a, b) => a.symbol.localeCompare(b.symbol)) : [];
  }, [tokens, searchQuery, category, stablecoins, defiTokens, topTokens, layer1Tokens]);

  // Get symbols from filtered tokens for Pyth price fetching
  const tokenSymbols = useMemo(() =>
    Array.isArray(filteredTokens) ? filteredTokens.map(token => token.symbol) : [],
    [filteredTokens]
  );

  const { priceMap, isLoading: isLoadingPrices, refetch } = usePythPrices(tokenSymbols);

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 Prices page debug:', {
      filteredTokensCount: filteredTokens.length,
      priceMapSize: priceMap.size,
      isLoadingPrices,
      sampleTokens: filteredTokens.slice(0, 3).map(t => t.symbol),
      samplePrices: Array.from(priceMap.entries()).slice(0, 3)
    });
  }, [filteredTokens, priceMap, isLoadingPrices]);

  const handleRefresh = () => {
    refetch();
  };

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

      <div className="relative z-10 w-full space-y-6 p-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-cyan-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <DollarSign className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] mb-2">Market Prices</h1>
                <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
                  <Network className="h-4 w-4 text-cyan-400" />
                  Real-time oracle data from Pyth Network
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-xl font-medium hover:from-cyan-400/30 hover:to-purple-500/30 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingPrices ? 'animate-spin' : ''} text-cyan-400`} />
              <span className="text-sm font-medium text-white">Refresh Data</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-black/50 rounded-2xl border border-cyan-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.2)]">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
              <Network className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Real-Time Oracle Data</h3>
              <p className="text-sm text-gray-300">
                Prices fetched directly from Pyth Network's Hermes API.
                Decentralized oracle data with sub-second updates across all supported chains.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm"
              />
            </div>

          <div className="flex gap-2 flex-wrap">
            {(['all', 'trending', 'layer1', 'stablecoins', 'defi'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {cat === 'layer1' ? 'Layer 1' : cat}
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
                    price: price.price,
                    confidence: price.confidence,
                    expo: price.expo,
                    publishTime: price.publishTime,
                    formattedPrice: price.price.toFixed(2),
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
            Showing {filteredTokens?.length || 0} of {tokens?.length || 0} tokens
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
    </div>
  );
};

export default Prices;
