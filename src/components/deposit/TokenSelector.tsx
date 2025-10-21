import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, Check, Loader2 } from 'lucide-react';
import { TokenConfig } from '@/config/tokens';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { usePythPrice } from '@/hooks/usePythPrice';
import { useTokenList } from '@/hooks/useTokenList';
import { TokenInfo } from '@uniswap/token-lists';

interface TokenSelectorProps {
  selectedToken: TokenConfig | null;
  onSelect: (token: TokenConfig) => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ selectedToken, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'popular' | 'stablecoins' | 'defi'>('all');
  
  const { tokens: tokenList, isLoading: isLoadingTokens } = useTokenList();

  const filteredTokens = useMemo(() => {
    // Convert TokenInfo to TokenConfig format
    let tokens = tokenList.map((token: TokenInfo): TokenConfig => ({
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoUri: token.logoURI,
      pythPriceId: '', // Will be populated if available
      isStablecoin: ['USDC', 'USDT', 'DAI', 'BUSD', 'FRAX'].includes(token.symbol),
    }));
    
    // Filter by category
    if (category === 'popular') {
      tokens = tokens.filter(t => ['WETH', 'USDC', 'DAI', 'WBTC', 'UNI', 'LINK'].includes(t.symbol));
    } else if (category === 'stablecoins') {
      tokens = tokens.filter(t => t.isStablecoin);
    } else if (category === 'defi') {
      tokens = tokens.filter(t => ['UNI', 'AAVE', 'COMP', 'MKR', 'CRV', 'SUSHI'].includes(t.symbol));
    }
    
    // Filter by search
    if (searchQuery) {
      tokens = tokens.filter(
        token =>
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return tokens;
  }, [searchQuery, category]);

  return (
    <div className="relative">
      <label className="label">Select Token</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        {selectedToken ? (
          <div className="flex items-center gap-3">
            {selectedToken.logoUri && (
              <img
                src={selectedToken.logoUri}
                alt={selectedToken.symbol}
                className="w-6 h-6 rounded-full"
              />
            )}
            <div className="text-left">
              <p className="font-medium text-gray-900">{selectedToken.symbol}</p>
              <p className="text-xs text-gray-500">{selectedToken.name}</p>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Select a token</span>
        )}
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[500px] overflow-hidden">
            <div className="p-3 border-b border-gray-200 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, symbol, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    category === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('popular')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    category === 'popular'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Popular
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('stablecoins')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    category === 'stablecoins'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Stablecoins
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('defi')}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    category === 'defi'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  DeFi
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-96">
              {isLoadingTokens ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
                  <span className="ml-2 text-gray-500">Loading tokens...</span>
                </div>
              ) : (
                <>
                  {filteredTokens.map((token) => (
                    <TokenOption
                      key={token.address}
                      token={token}
                      isSelected={selectedToken?.address === token.address}
                      onSelect={() => {
                        onSelect(token);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                  {filteredTokens.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 mb-2">No tokens found</p>
                      <p className="text-xs text-gray-400">Try adjusting your search or filter</p>
                    </div>
                  )}
                  {filteredTokens.length > 0 && (
                    <div className="p-2 text-xs text-gray-500 border-t border-gray-100">
                      {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} available
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface TokenOptionProps {
  token: TokenConfig;
  isSelected: boolean;
  onSelect: () => void;
}

const TokenOption: React.FC<TokenOptionProps> = ({ token, isSelected, onSelect }) => {
  const { formattedBalance } = useTokenBalance(token.address, token.decimals);
  const { priceData } = usePythPrice(token.pythPriceId);

  const balanceValue = priceData && formattedBalance
    ? (parseFloat(formattedBalance) * parseFloat(priceData.formattedPrice)).toFixed(2)
    : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-primary-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {token.logoUri ? (
          <img
            src={token.logoUri}
            alt={token.symbol}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{token.symbol[0]}</span>
          </div>
        )}
        <div className="text-left">
          <p className="font-medium text-gray-900">{token.symbol}</p>
          <p className="text-xs text-gray-500">{token.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{formattedBalance}</p>
          {balanceValue && (
            <p className="text-xs text-gray-500">${balanceValue}</p>
          )}
        </div>
        {isSelected && <Check className="h-5 w-5 text-primary-600" />}
      </div>
    </button>
  );
};

export default TokenSelector;
