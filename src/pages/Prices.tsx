import React, { useState, useMemo } from "react";
import { DollarSign, RefreshCw, Search, Network } from "lucide-react";
import {
  useEnhancedTokenList,
  useTokensByCategory,
  useTopTokensForPrices,
} from "@/hooks/useEnhancedTokenList";
import { usePythPrices, usePythTokensByCategory } from "@/hooks/usePythPrices";

import TokenListItem from "@/components/prices/TokenListItem";
import TokenPriceChart from "@/components/prices/TokenPriceChart";
import { TokenInfo } from "@uniswap/token-lists";

/**
 * Prices page - fetches live prices directly from Pyth contract
 * Dynamically uses the correct Pyth contract based on selected network
 */
const Prices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [category, setCategory] = useState<
    "all" | "trending" | "layer1" | "stablecoins" | "defi"
  >("trending");

  const { tokens, isLoading: isLoadingTokens } = useEnhancedTokenList();

  // Get category-specific tokens from Pyth
  const { tokens: pythStablecoins } = usePythTokensByCategory("stablecoins");
  const { tokens: pythDefiTokens } = usePythTokensByCategory("defi");
  const { tokens: pythLayer1Tokens } = usePythTokensByCategory("layer1");

  // Always call these hooks (Rules of Hooks)
  const localStablecoins = useTokensByCategory("stablecoins");
  const localDefiTokens = useTokensByCategory("defi");
  const localLayer1Tokens = useTokensByCategory("layer1");
  const topTokens = useTopTokensForPrices(20);

  // Create filtered token arrays using useMemo
  const stablecoins = useMemo(() => {
    if (pythStablecoins && pythStablecoins.length > 0 && tokens) {
      return tokens.filter((t) =>
        pythStablecoins.includes(t.symbol.toUpperCase())
      );
    }
    return localStablecoins || [];
  }, [pythStablecoins, tokens, localStablecoins]);

  const defiTokens = useMemo(() => {
    if (pythDefiTokens && pythDefiTokens.length > 0 && tokens) {
      return tokens.filter((t) =>
        pythDefiTokens.includes(t.symbol.toUpperCase())
      );
    }
    return localDefiTokens || [];
  }, [pythDefiTokens, tokens, localDefiTokens]);

  const layer1Tokens = useMemo(() => {
    if (pythLayer1Tokens && pythLayer1Tokens.length > 0 && tokens) {
      return tokens.filter((t) =>
        pythLayer1Tokens.includes(t.symbol.toUpperCase())
      );
    }
    return localLayer1Tokens || [];
  }, [pythLayer1Tokens, tokens, localLayer1Tokens]);

  const filteredTokens = useMemo(() => {
    let filtered = tokens || [];

    if (category === "stablecoins") {
      filtered = Array.isArray(stablecoins) ? stablecoins : [];
    } else if (category === "defi") {
      filtered = Array.isArray(defiTokens) ? defiTokens : [];
    } else if (category === "trending") {
      filtered = Array.isArray(topTokens) ? topTokens : [];
    } else if (category === "layer1") {
      filtered = Array.isArray(layer1Tokens) ? layer1Tokens : [];
    }

    if (searchQuery && Array.isArray(filtered)) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (token) =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query)
      );
    }

    return Array.isArray(filtered)
      ? filtered.sort((a, b) => a.symbol.localeCompare(b.symbol))
      : [];
  }, [
    tokens,
    searchQuery,
    category,
    stablecoins,
    defiTokens,
    topTokens,
    layer1Tokens,
  ]);

  // Get symbols from filtered tokens for Pyth price fetching
  const tokenSymbols = useMemo(
    () =>
      Array.isArray(filteredTokens)
        ? filteredTokens.map((token) => token.symbol)
        : [],
    [filteredTokens]
  );

  const {
    priceMap,
    isLoading: isLoadingPrices,
    refetch,
  } = usePythPrices(tokenSymbols);

  // Debug logging
  React.useEffect(() => {
    console.log("🔍 Prices page debug:", {
      filteredTokensCount: filteredTokens.length,
      priceMapSize: priceMap.size,
      isLoadingPrices,
      sampleTokens: filteredTokens.slice(0, 3).map((t) => t.symbol),
      samplePrices: Array.from(priceMap.entries()).slice(0, 3),
    });
  }, [filteredTokens, priceMap, isLoadingPrices]);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-red-500/30 rounded-full blur-sm"></div>
          <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-orange-500/30 rounded-full blur-sm"></div>
          <div className="absolute top-1/10 left-1/2 w-1 h-1 bg-red-400/20 rounded-full blur-sm"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        <div className="p-6 lg:p-8 bg-black/40 rounded-2xl border border-gray-800/50 backdrop-blur-md">
          <div className="space-y-6">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-400/60 transition-colors" />
              <input
                type="text"
                placeholder="Search tokens by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-3.5 bg-gradient-to-r from-gray-900/40 to-gray-900/20 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition-all duration-200"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              {(
                ["all", "trending", "layer1", "stablecoins", "defi"] as const
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 capitalize border ${
                    category === cat
                      ? "bg-gradient-to-r from-red-500/20 to-orange-500/15 border-red-500/40 text-white shadow-lg shadow-red-500/10"
                      : "bg-gray-900/40 text-gray-400 hover:text-gray-300 border-gray-700/50 hover:border-gray-600/50"
                  }`}
                >
                  {cat === "layer1" ? "Layer 1" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Token Grid */}
        {isLoadingTokens ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="p-5 bg-black/30 rounded-2xl border border-gray-800/40 backdrop-blur-sm animate-pulse"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 bg-gray-800/50 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-800/50 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-800/30 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredTokens.map((token) => {
                const price = priceMap.get(token.symbol.toUpperCase());
                return (
                  <TokenListItem
                    key={token.address}
                    token={token}
                    onClick={() => setSelectedToken(token)}
                    priceData={
                      price
                        ? {
                            price: price.price,
                            confidence: price.confidence,
                            expo: price.expo,
                            publishTime: price.publishTime,
                            formattedPrice: price.price.toFixed(2),
                          }
                        : undefined
                    }
                    isLoading={isLoadingPrices}
                  />
                );
              })}
            </div>

            {filteredTokens.length === 0 && (
              <div className="col-span-full p-12 bg-black/30 rounded-3xl border border-gray-800/40 backdrop-blur-sm text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl">
                    <DollarSign className="h-12 w-12 text-gray-600" />
                  </div>
                </div>
                <p className="text-gray-400 text-lg font-medium">
                  No tokens found
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search or filter
                </p>
              </div>
            )}

            <div className="text-center text-sm text-gray-400 mt-2 font-medium">
              Showing{" "}
              <span className="text-red-400/80">
                {filteredTokens?.length || 0}
              </span>{" "}
              of{" "}
              <span className="text-orange-400/80">{tokens?.length || 0}</span>{" "}
              tokens
              {isLoadingPrices && (
                <span className="ml-2 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  (Loading prices...)
                </span>
              )}
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
