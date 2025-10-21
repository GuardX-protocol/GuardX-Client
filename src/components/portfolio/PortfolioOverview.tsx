import React from 'react';
import { TrendingUp, Wallet, RefreshCw } from 'lucide-react';
import { usePortfolio } from '@/hooks';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { formatCurrency } from '@/utils/format';

const PortfolioOverview: React.FC = () => {
  const { portfolio, isLoading, refetch } = usePortfolio();
  const { isConnected } = useAccount();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12">
        <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Connect wallet to view portfolio</p>
      </div>
    );
  }

  // Portfolio is a struct with: assets[], totalValue, lastUpdated, riskScore
  const portfolioData = portfolio as any;
  const assets = portfolioData?.assets || portfolioData?.[0] || [];
  const totalValue = BigInt(portfolioData?.totalValue || portfolioData?.[1] || 0);
  const totalValueUSD = Number(formatUnits(totalValue, 18));
  const assetsCount = Array.isArray(assets) ? assets.length : 0;

  // If no portfolio data, show empty state
  if (!portfolio || totalValueUSD === 0) {
    return (
      <div className="card text-center py-12">
        <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">No assets deposited yet</p>
        <p className="text-sm text-gray-400 mt-2">Start by depositing your first asset</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Portfolio Value</h2>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Refresh portfolio"
            >
              <RefreshCw className={`h-4 w-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <TrendingUp className="h-5 w-5 text-success-600" />
        </div>
        <p className="text-4xl font-bold text-gray-900">{formatCurrency(totalValueUSD)}</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Assets</h3>
          <span className="text-xs text-gray-500">{assetsCount} {assetsCount === 1 ? 'asset' : 'assets'}</span>
        </div>
        {!assets || assets.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No assets deposited</p>
        ) : (
          <div className="space-y-3">
            {assets.map((asset: any, index: number) => {
              const tokenAddress = asset.tokenAddress || asset[0];
              const amount = BigInt(asset.amount || asset[1] || 0);
              const valueUSD = BigInt(asset.valueUSD || asset[2] || 0);
              const riskLevel = asset.riskLevel || asset[3] || 0;
              
              const formattedAmount = Number(formatUnits(amount, 18));
              const formattedValue = Number(formatUnits(valueUSD, 18));
              
              const riskColors = ['text-success-600', 'text-warning-600', 'text-red-600', 'text-red-700'];
              const riskLabels = ['Low', 'Medium', 'High', 'Critical'];
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 font-mono text-sm">
                      {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">{formattedAmount.toFixed(4)} tokens</p>
                      <span className={`text-xs font-medium ${riskColors[riskLevel] || 'text-gray-500'}`}>
                        {riskLabels[riskLevel] || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(formattedValue)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioOverview;
