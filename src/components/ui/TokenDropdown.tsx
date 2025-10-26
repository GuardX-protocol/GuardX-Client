import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, TrendingUp } from 'lucide-react';
import { TokenInfo } from '@uniswap/token-lists';

interface TokenWithBalance extends TokenInfo {
  balance?: string;
  formattedBalance?: string;
  hasBalance?: boolean;
}

interface TokenDropdownProps {
  tokens: TokenInfo[] | TokenWithBalance[];
  selectedToken: TokenInfo | null;
  onSelect: (token: TokenInfo) => void;
  priceMap?: Map<string, any>;
  isLoading?: boolean;
  placeholder?: string;
  showBalances?: boolean;
}

const TokenDropdown: React.FC<TokenDropdownProps> = ({
  tokens,
  selectedToken,
  onSelect,
  priceMap,
  isLoading = false,
  placeholder = "Select a token",
  showBalances = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    return tokens.filter(token =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tokens, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTokenSelect = (token: TokenInfo) => {
    onSelect(token);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-left hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          {selectedToken ? (
            <>
              {selectedToken.logoURI && (
                <img
                  src={selectedToken.logoURI}
                  alt={selectedToken.symbol}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div>
                <div className="font-semibold text-gray-100">{selectedToken.symbol}</div>
                <div className="text-sm text-gray-400">{selectedToken.name}</div>
              </div>
            </>
          ) : (
            <div className="text-gray-400">{placeholder}</div>
          )}
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="p-3 border-b border-gray-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto scrollbar-hide">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">Loading tokens...</div>
            ) : filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No tokens found</div>
            ) : (
              filteredTokens.map((token) => {
                const price = priceMap?.get(token.symbol.toUpperCase());
                const tokenWithBalance = token as TokenWithBalance;
                return (
                  <div
                    key={token.address}
                    onClick={() => handleTokenSelect(token)}
                    className="dropdown-item"
                  >
                    {token.logoURI ? (
                      <img
                        src={token.logoURI}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <span className="text-white font-bold text-xs">
                          {token.symbol.slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-100">{token.symbol}</div>
                          <div className="text-sm text-gray-400 truncate">{token.name}</div>
                          {showBalances && tokenWithBalance.hasBalance && (
                            <div className="text-xs text-orange-400">
                              Balance: {tokenWithBalance.formattedBalance}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          {price && (
                            <>
                              <div className="text-sm font-medium text-gray-100">
                                ${price.price.toFixed(2)}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-emerald-400">
                                <TrendingUp className="h-3 w-3" />
                                +2.4%
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenDropdown;