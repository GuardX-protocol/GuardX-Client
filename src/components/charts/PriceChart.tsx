import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PriceChartProps {
  symbol: string;
  timeRange?: '1H' | '24H' | '7D' | '30D';
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, timeRange = '24H' }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateData = () => {
      const points = 50;
      const now = Date.now();
      const ranges = {
        '1H': 3600 * 1000,
        '24H': 24 * 3600 * 1000,
        '7D': 7 * 24 * 3600 * 1000,
        '30D': 30 * 24 * 3600 * 1000,
      };
      
      const interval = ranges[timeRange] / points;
      const basePrice = 100;
      const chartData = [];

      for (let i = 0; i < points; i++) {
        const timestamp = now - (ranges[timeRange] - interval * i);
        const variation = Math.sin(i / 5) * 10 + Math.random() * 5;
        chartData.push({
          time: new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: basePrice + variation,
        });
      }
      
      setData(chartData);
      setIsLoading(false);
    };

    generateData();
  }, [symbol, timeRange]);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
        <XAxis 
          dataKey="time" 
          stroke="#64748b" 
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis 
          stroke="#64748b" 
          tick={{ fontSize: 12 }}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f1419',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '12px',
            padding: '12px',
          }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#6366f1' }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#colorPrice)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PriceChart;