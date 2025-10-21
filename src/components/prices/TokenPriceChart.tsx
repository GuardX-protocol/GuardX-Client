import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, X } from 'lucide-react';
import { usePythPrice } from '@/hooks/usePythPrice';
import { TokenInfo } from '@uniswap/token-lists';

interface TokenPriceChartProps {
  token: TokenInfo;
  onClose: () => void;
}

const TokenPriceChart: React.FC<TokenPriceChartProps> = ({ token, onClose }) => {
  const { priceData, isLoading } = usePythPrice(token.symbol);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D' | '30D'>('24H');

  // Generate mock historical data based on current price
  useEffect(() => {
    if (priceData) {
      const currentPrice = parseFloat(priceData.formattedPrice);
      const dataPoints = timeRange === '1H' ? 60 : timeRange === '24H' ? 24 : timeRange === '7D' ? 7 : 30;
      
      const data = Array.from({ length: dataPoints }, (_, i) => {
        const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
        const price = currentPrice * (1 + variance);
        const timestamp = Date.now() - (dataPoints - i) * (timeRange === '1H' ? 60000 : timeRange === '24H' ? 3600000 : 86400000);
        
        return {
          time: new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: timeRange === '1H' ? '2-digit' : undefined,
            day: timeRange !== '1H' && timeRange !== '24H' ? 'numeric' : undefined,
            month: timeRange !== '1H' && timeRange !== '24H' ? 'short' : undefined
          }),
          price: price,
          volume: Math.random() * 1000000,
        };
      });
      
      setHistoricalData(data);
    }
  }, [priceData, timeRange]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!priceData) return null;

  const currentPrice = parseFloat(priceData.formattedPrice);
  const priceChange = historicalData.length > 1 
    ? ((historicalData[historicalData.length - 1].price - historicalData[0].price) / historicalData[0].price) * 100
    : 0;
  const isPositive = priceChange >= 0;

  const stats = [
    {
      label: '24h High',
      value: `$${Math.max(...historicalData.map(d => d.price)).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-success-600',
    },
    {
      label: '24h Low',
      value: `$${Math.min(...historicalData.map(d => d.price)).toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-600',
    },
    {
      label: '24h Volume',
      value: `$${(historicalData.reduce((sum, d) => sum + d.volume, 0) / 1000000).toFixed(2)}M`,
      icon: BarChart3,
      color: 'text-blue-600',
    },
    {
      label: 'Market Cap',
      value: `$${(currentPrice * 1000000000).toFixed(0)}`,
      icon: DollarSign,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {token.logoURI && (
              <img src={token.logoURI} alt={token.symbol} className="w-12 h-12 rounded-full" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{token.name}</h2>
              <p className="text-sm text-gray-500">{token.symbol}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Price Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-baseline gap-4">
            <h3 className="text-4xl font-bold text-gray-900">
              ${priceData.formattedPrice}
            </h3>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              isPositive ? 'bg-success-100 text-success-700' : 'bg-red-100 text-red-700'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-semibold">
                {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(Number(priceData.publishTime) * 1000).toLocaleString()}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2">
            {(['1H', '24H', '7D', '30D'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                formatter={(value: any) => [`$${value.toFixed(4)}`, 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Statistics */}
        <div className="p-6 bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Confidence</p>
              <p className="text-lg font-semibold text-gray-900">
                {priceData.confidence}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Expo</p>
              <p className="text-lg font-semibold text-gray-900">
                {priceData.expo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPriceChart;
