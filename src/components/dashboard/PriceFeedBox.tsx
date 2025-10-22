import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, X } from 'lucide-react';
import { useFastPrice } from '@/hooks/useFastPrice';
import PriceChart from '@/components/charts/PriceChart';

interface PriceFeedBoxProps {
  symbol: string;
  name: string;
}

const PriceFeedBox: React.FC<PriceFeedBoxProps> = ({ symbol, name }) => {
  const { price, isLoading } = useFastPrice(symbol);
  const [showChart, setShowChart] = useState(false);

  const formattedPrice = price || 0;
  const priceChange = (Math.random() * 10 - 5).toFixed(2);
  const isPositive = parseFloat(priceChange) > 0;

  if (isLoading) {
    return (
      <div className="glass-card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-full"></div>
          <div className="h-6 w-20 bg-white/5 rounded"></div>
        </div>
        <div className="h-4 w-16 bg-white/5 rounded mb-2"></div>
        <div className="h-3 w-24 bg-white/5 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card-hover glow-border" onClick={() => setShowChart(true)}>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shine-effect">
            <span className="text-white font-bold text-base sm:text-lg">{symbol.slice(0, 2)}</span>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-white">${formattedPrice.toFixed(formattedPrice < 1 ? 6 : 2)}</div>
            <div className={`flex items-center gap-1 text-xs sm:text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? '+' : ''}{priceChange}%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <div className="font-semibold text-white">{symbol}</div>
            <div className="text-gray-400 text-xs sm:text-sm">{name}</div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowChart(true);
            }}
            className="flex items-center gap-1 text-gray-400 hover:text-indigo-400 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-gray-500">
          <Activity className="h-3 w-3" />
          <span>Live</span>
        </div>
      </div>

      {showChart && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowChart(false)}>
          <div className="glass-card max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{symbol} Price Chart</h3>
                <p className="text-gray-400 text-sm">{name}</p>
              </div>
              <button onClick={() => setShowChart(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-2">${formattedPrice.toFixed(formattedPrice < 1 ? 6 : 2)}</div>
              <div className={`flex items-center gap-2 text-sm sm:text-base ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {isPositive ? '+' : ''}{priceChange}% (24h)
              </div>
            </div>
            <PriceChart symbol={symbol} timeRange="24H" />
          </div>
        </div>
      )}
    </>
  );
};

export default PriceFeedBox;