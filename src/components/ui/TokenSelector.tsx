import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { useGuardXPrices } from '@/hooks/useGuardX';

interface TokenSelectorProps {
  selectedTokens: string[];
  onTokensChange: (tokens: string[]) => void;
  placeholder?: string;
}

// Comprehensive token list with popular cryptocurrencies
const POPULAR_TOKENS = [
  // Major cryptocurrencies
  { symbol: 'BTC', name: 'Bitcoin', category: 'major' },
  { symbol: 'ETH', name: 'Ethereum', category: 'major' },
  { symbol: 'BNB', name: 'BNB', category: 'major' },
  { symbol: 'XRP', name: 'XRP', category: 'major' },
  { symbol: 'ADA', name: 'Cardano', category: 'major' },
  { symbol: 'DOGE', name: 'Dogecoin', category: 'major' },
  { symbol: 'SOL', name: 'Solana', category: 'major' },
  { symbol: 'TRX', name: 'TRON', category: 'major' },
  { symbol: 'MATIC', name: 'Polygon', category: 'major' },
  { symbol: 'DOT', name: 'Polkadot', category: 'major' },
  
  // DeFi tokens
  { symbol: 'UNI', name: 'Uniswap', category: 'defi' },
  { symbol: 'LINK', name: 'Chainlink', category: 'defi' },
  { symbol: 'AAVE', name: 'Aave', category: 'defi' },
  { symbol: 'SUSHI', name: 'SushiSwap', category: 'defi' },
  { symbol: 'COMP', name: 'Compound', category: 'defi' },
  { symbol: 'MKR', name: 'Maker', category: 'defi' },
  { symbol: 'SNX', name: 'Synthetix', category: 'defi' },
  { symbol: 'CRV', name: 'Curve DAO', category: 'defi' },
  { symbol: 'YFI', name: 'yearn.finance', category: 'defi' },
  { symbol: '1INCH', name: '1inch', category: 'defi' },
  
  // Layer 1 & 2
  { symbol: 'AVAX', name: 'Avalanche', category: 'layer1' },
  { symbol: 'ATOM', name: 'Cosmos', category: 'layer1' },
  { symbol: 'NEAR', name: 'NEAR Protocol', category: 'layer1' },
  { symbol: 'FTM', name: 'Fantom', category: 'layer1' },
  { symbol: 'ALGO', name: 'Algorand', category: 'layer1' },
  { symbol: 'ONE', name: 'Harmony', category: 'layer1' },
  { symbol: 'HBAR', name: 'Hedera', category: 'layer1' },
  { symbol: 'ICP', name: 'Internet Computer', category: 'layer1' },
  { symbol: 'FLOW', name: 'Flow', category: 'layer1' },
  { symbol: 'EGLD', name: 'MultiversX', category: 'layer1' },
  
  // Meme coins
  { symbol: 'SHIB', name: 'Shiba Inu', category: 'meme' },
  { symbol: 'PEPE', name: 'Pepe', category: 'meme' },
  { symbol: 'FLOKI', name: 'Floki', category: 'meme' },
  { symbol: 'BONK', name: 'Bonk', category: 'meme' },
  
  // Stablecoins
  { symbol: 'USDT', name: 'Tether', category: 'stable' },
  { symbol: 'USDC', name: 'USD Coin', category: 'stable' },
  { symbol: 'BUSD', name: 'Binance USD', category: 'stable' },
  { symbol: 'DAI', name: 'Dai', category: 'stable' },
  
  // Gaming & NFT
  { symbol: 'AXS', name: 'Axie Infinity', category: 'gaming' },
  { symbol: 'SAND', name: 'The Sandbox', category: 'gaming' },
  { symbol: 'MANA', name: 'Decentraland', category: 'gaming' },
  { symbol: 'ENJ', name: 'Enjin Coin', category: 'gaming' },
  { symbol: 'GALA', name: 'Gala', category: 'gaming' },
  
  // AI & Data
  { symbol: 'FET', name: 'Fetch.ai', category: 'ai' },
  { symbol: 'OCEAN', name: 'Ocean Protocol', category: 'ai' },
  { symbol: 'GRT', name: 'The Graph', category: 'ai' },
  { symbol: 'RNDR', name: 'Render Token', category: 'ai' },
];

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedTokens,
  onTokensChange,
  placeholder = "Select tokens to monitor"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { prices, fetchPrices } = useGuardXPrices();

  const categories = [
    { id: 'all', name: 'All', count: POPULAR_TOKENS.length },
    { id: 'major', name: 'Major', count: POPULAR_TOKENS.filter(t => t.category === 'major').length },
    { id: 'defi', name: 'DeFi', count: POPULAR_TOKENS.filter(t => t.category === 'defi').length },
    { id: 'layer1', name: 'Layer 1', count: POPULAR_TOKENS.filter(t => t.category === 'layer1').length },
    { id: 'meme', name: 'Meme', count: POPULAR_TOKENS.filter(t => t.category === 'meme').length },
    { id: 'gaming', name: 'Gaming', count: POPULAR_TOKENS.filter(t => t.category === 'gaming').length },
  ];

  useEffect(() => {
    // Fetch prices for all tokens
    const symbols = POPULAR_TOKENS.map(t => t.symbol);
    fetchPrices(symbols);
  }, [fetchPrices]);

  const filteredTokens = POPULAR_TOKENS.filter(token => {
    const matchesSearch = token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         token.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || token.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTokenToggle = (symbol: string) => {
    if (selectedTokens.includes(symbol)) {
      onTokensChange(selectedTokens.filter(t => t !== symbol));
    } else {
      onTokensChange([...selectedTokens, symbol]);
    }
  };

  const getTokenPrice = (symbol: string) => {
    const priceData = prices[`${symbol}USDT`] || prices[symbol];
    return priceData ? {
      price: priceData.price,
      change: priceData.change_24h
    } : null;
  };



  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white text-sm hover:border-cyan-500/50 transition-all duration-200 backdrop-blur-sm"
      >
        <span className="truncate">
          {selectedTokens.length === 0 
            ? placeholder
            : selectedTokens.length === 1 
              ? selectedTokens[0]
              : `${selectedTokens.length} tokens selected`
          }
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Token List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredTokens.map((token) => {
                const isSelected = selectedTokens.includes(token.symbol);
                const priceInfo = getTokenPrice(token.symbol);
                
                return (
                  <button
                    key={token.symbol}
                    type="button"
                    onClick={() => handleTokenToggle(token.symbol)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-all duration-200 ${
                      isSelected ? 'bg-cyan-500/10 border-l-2 border-cyan-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full transition-colors ${
                        isSelected ? 'bg-cyan-400' : 'bg-gray-600'
                      }`} />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{token.symbol}</span>
                          {token.category === 'major' && <Star className="h-3 w-3 text-yellow-400" />}
                        </div>
                        <div className="text-xs text-gray-400">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {priceInfo ? (
                        <>
                          <div className="text-sm text-white">${priceInfo.price.toFixed(2)}</div>
                          <div className={`text-xs flex items-center gap-1 justify-end ${
                            priceInfo.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {priceInfo.change >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {priceInfo.change.toFixed(1)}%
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-500">Loading...</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Tokens Summary */}
            {selectedTokens.length > 0 && (
              <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
                <div className="text-xs text-gray-400 mb-2">Selected ({selectedTokens.length}):</div>
                <div className="flex flex-wrap gap-2">
                  {selectedTokens.map((token) => (
                    <span
                      key={token}
                      className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-medium border border-cyan-500/30"
                    >
                      {token}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TokenSelector;