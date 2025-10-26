import React, { useState, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, X, RefreshCw } from 'lucide-react';
import { usePythContractPrice } from '@/hooks/usePythContractPrices';
import { usePythPriceMonitorHistory, generateMockPriceHistory } from '@/hooks/usePythPriceMonitorHistory';
import { TokenInfo } from '@uniswap/token-lists';

interface TokenPriceChartProps {
    token: TokenInfo;
    onClose: () => void;
}

const TokenPriceChart: React.FC<TokenPriceChartProps> = ({ token, onClose }) => {
    const { priceData, isLoading: isPriceLoading } = usePythContractPrice(token.symbol);
    const [timeRange, setTimeRange] = useState<'1H' | '24H' | '7D' | '30D'>('24H');

    // Calculate time range in seconds
    const timeRangeSeconds = useMemo(() => {
        switch (timeRange) {
            case '1H': return 3600;
            case '24H': return 86400;
            case '7D': return 604800;
            case '30D': return 2592000;
            default: return 86400;
        }
    }, [timeRange]);

    // Fetch price history from PythPriceMonitor contract
    const { priceHistory: contractHistory, isLoading: isHistoryLoading, refetch, isEmpty } = usePythPriceMonitorHistory(
        token.symbol,
        timeRangeSeconds
    );

    // Generate fallback data if no contract history available
    const priceHistory = useMemo(() => {
        if (contractHistory && contractHistory.length > 0) {
            return contractHistory;
        }

        // Fallback to mock data if no contract data and we have current price
        if (priceData && priceData.price > 0) {
            return generateMockPriceHistory(priceData.price, timeRangeSeconds, token.symbol);
        }

        return [];
    }, [contractHistory, priceData, timeRangeSeconds, token.symbol]);

    // Format historical data for chart
    const historicalData = useMemo(() => {
        if (!priceHistory || priceHistory.length === 0) return [];

        return priceHistory.map(item => ({
            time: item.date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: timeRange === '1H' ? '2-digit' : undefined,
                day: timeRange !== '1H' && timeRange !== '24H' ? 'numeric' : undefined,
                month: timeRange !== '1H' && timeRange !== '24H' ? 'short' : undefined
            }),
            price: item.price,
            timestamp: item.timestamp,
            fullDate: item.date.toLocaleString(),
        }));
    }, [priceHistory, timeRange]);

    const isLoading = isPriceLoading || isHistoryLoading;
    const hasValidData = priceData && priceData.price > 0;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!hasValidData) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Price Data Available</h3>
                    <p className="text-gray-600 mb-4">
                        Price data for {token.symbol} is not available from Pyth oracle.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const currentPrice = parseFloat(priceData.formattedPrice);
    const priceChange = historicalData.length > 1
        ? ((historicalData[historicalData.length - 1].price - historicalData[0].price) / historicalData[0].price) * 100
        : 0;
    const isPositive = priceChange >= 0;

    const stats = [
        {
            label: `${timeRange} High`,
            value: historicalData.length > 0
                ? `$${Math.max(...historicalData.map(d => d.price)).toFixed(2)}`
                : 'N/A',
            icon: TrendingUp,
            color: 'text-success-600',
        },
        {
            label: `${timeRange} Low`,
            value: historicalData.length > 0
                ? `$${Math.min(...historicalData.map(d => d.price)).toFixed(2)}`
                : 'N/A',
            icon: TrendingDown,
            color: 'text-red-600',
        },
        {
            label: 'Data Points',
            value: `${historicalData.length}`,
            icon: BarChart3,
            color: 'text-orange-600',
        },
        {
            label: 'Current Price',
            value: `$${currentPrice.toFixed(2)}`,
            icon: DollarSign,
            color: 'text-purple-600',
        },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        {token.logoURI && (
                            <img src={token.logoURI} alt={token.symbol} className="w-12 h-12 rounded-full" />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{token.name}</h2>
                            <p className="text-sm text-gray-500">{token.symbol}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className="h-5 w-5 text-gray-500" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Price Info */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-baseline gap-4">
                        <h3 className="text-4xl font-bold text-gray-900">
                            ${priceData.formattedPrice}
                        </h3>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${isPositive ? 'bg-success-100 text-success-700' : 'bg-red-100 text-red-700'
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
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
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
                    {isEmpty || historicalData.length === 0 ? (
                        <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No historical data available for this time range</p>
                                <p className="text-sm text-gray-400 mt-1">Try selecting a different time range</p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={historicalData}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
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
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload[0]) {
                                            return payload[0].payload.fullDate;
                                        }
                                        return label;
                                    }}
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
                    )}
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