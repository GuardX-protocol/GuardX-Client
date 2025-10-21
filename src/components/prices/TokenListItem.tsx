import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { TokenInfo } from '@uniswap/token-lists';

interface TokenListItemProps {
  token: TokenInfo;
  onClick: () => void;
  priceData?: {
    price: bigint | number;
    confidence: bigint | number;
    expo: number;
    publishTime: bigint | number;
    formattedPrice: string;
  };
  isLoading?: boolean;
}

const TokenListItem: React.FC<TokenListItemProps> = ({ token, onClick, priceData, isLoading }) => {
  // Generate consistent mock 24h change based on token symbol
  // In production, this would come from historical price data
  const priceChange = useMemo(() => {
    const hash = token.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ((hash % 2000) - 1000) / 100; // Range: -10% to +10%
  }, [token.symbol]);
  
  const isPositive = priceChange >= 0;

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200 text-left group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {token.logoURI ? (
            <img
              src={token.logoURI}
              alt={token.symbol}
              className="w-10 h-10 rounded-full flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">{token.symbol[0]}</span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 truncate">{token.symbol}</p>
              <Activity className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-500 truncate">{token.name}</p>
          </div>
        </div>

        <div className="text-right flex-shrink-0 ml-4">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-20 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ) : priceData ? (
            <>
              <p className="font-semibold text-gray-900">
                ${priceData.formattedPrice}
              </p>
              <div className={`flex items-center justify-end gap-1 text-sm ${
                isPositive ? 'text-success-600' : 'text-red-600'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="font-medium">
                  {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">No price</p>
          )}
        </div>
      </div>
    </button>
  );
};

export default TokenListItem;
