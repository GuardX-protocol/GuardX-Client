import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { TokenConfig } from '@/config/tokens';
import { usePythPrice } from '@/hooks/usePythPrices';

interface PriceCardProps {
  token: TokenConfig;
}

const PriceCard: React.FC<PriceCardProps> = ({ token }) => {
  const { price: priceData, isLoading, error } = usePythPrice(token.symbol);

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !priceData) {
    return (
      <div className="card">
        <div className="flex items-center gap-3">
          {token.logoUri && (
            <img src={token.logoUri} alt={token.symbol} className="w-10 h-10 rounded-full" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">{token.symbol}</p>
            <p className="text-lg font-semibold text-gray-400">
              {error ? 'Error loading price' : 'Price unavailable'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = Math.random() > 0.5; // Placeholder for price change
  const priceChange = (Math.random() * 10 - 5).toFixed(2); // Placeholder

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {token.logoUri && (
            <img src={token.logoUri} alt={token.symbol} className="w-12 h-12 rounded-full" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">{token.symbol}</p>
            <p className="text-2xl font-bold text-gray-900">
              ${priceData.price.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="h-4 w-4 text-primary-600 animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className={`flex items-center gap-1 ${isPositive ? 'text-success-600' : 'text-red-600'}`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isPositive ? '+' : ''}{priceChange}%
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Updated {new Date(priceData.publishTime * 1000).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default PriceCard;
