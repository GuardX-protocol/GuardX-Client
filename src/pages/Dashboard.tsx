import React from 'react';
import { Shield, TrendingUp, AlertTriangle, Activity, DollarSign, Wallet } from 'lucide-react';
import { usePortfolio, useProtectionPolicy, usePythContractPrices } from '@/hooks';
import { useTokenList } from '@/hooks/useTokenList';
import { tokenInfoToConfig } from '@/config/tokens';
import { formatUnits } from 'viem';
import { formatCurrency } from '@/utils/format';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';
import PolicyStatus from '@/components/policy/PolicyStatus';
import PriceCard from '@/components/portfolio/PriceCard';
import { Link } from 'react-router-dom';
import { useNetwork, useAccount } from 'wagmi';
import { getChainMetadata } from '@/config/chains';
import { isChainDeployed } from '@/config/deployments';

const Dashboard: React.FC = () => {
  const { portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { policy, isLoading: policyLoading } = useProtectionPolicy();
  const { tokens } = useTokenList();
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();

  // Get current chain metadata
  const chainMetadata = chain ? getChainMetadata(chain.id) : null;
  const isDeployed = chain ? isChainDeployed(chain.id) : false;

  // Extract portfolio data with safe defaults
  const portfolioData = portfolio as any;
  const totalValue = portfolioData
    ? Number(formatUnits(BigInt(portfolioData.totalValue || portfolioData[1] || 0), 18))
    : 0;
  const assets = portfolioData?.assets || portfolioData?.[0] || [];
  const assetsCount = Array.isArray(assets) ? assets.length : 0;

  // Extract policy data with safe defaults
  const policyData = policy as any;
  const crashThreshold = policyData?.crashThreshold || policyData?.[0] || BigInt(0);
  const isProtectionActive = Number(crashThreshold) > 0;

  // Calculate risk level based on portfolio data
  const riskScore = portfolioData?.riskScore || portfolioData?.[3] || BigInt(0);
  const riskLevel = Number(riskScore);
  const getRiskLabel = () => {
    if (riskLevel === 0) return 'Low';
    if (riskLevel === 1) return 'Medium';
    if (riskLevel === 2) return 'High';
    return 'Critical';
  };
  const getRiskColor = () => {
    if (riskLevel === 0) return 'from-success-50 to-emerald-100 border-success-200';
    if (riskLevel === 1) return 'from-warning-50 to-amber-100 border-warning-200';
    if (riskLevel === 2) return 'from-orange-50 to-red-100 border-orange-200';
    return 'from-red-50 to-red-100 border-red-200';
  };

  // Get featured tokens with Pyth price feeds
  // Call hook once with all tokens, then filter based on results
  const { priceMap } = usePythContractPrices(tokens);
  
  const featuredTokens = tokens
    .filter(t => priceMap.has(t.symbol.toUpperCase()))
    .slice(0, 3)
    .map(tokenInfoToConfig);

  // Show wallet connection prompt if not connected
  if (!isConnected || !address) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor your protected portfolio in real-time</p>
        </div>
        <div className="card text-center py-16">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your portfolio and protection status
          </p>
          <p className="text-sm text-gray-500">
            Click "Connect Wallet" in the header to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor your protected portfolio in real-time</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success-50 to-emerald-50 border-2 border-success-200 rounded-full shadow-md">
          <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-success-700">
            {isDeployed ? 'Live' : 'Not Deployed'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Portfolio Card */}
        <div className="stat-card from-success-50 to-emerald-100 border-success-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-success-700 mb-1">Total Portfolio</p>
              {portfolioLoading ? (
                <div className="h-9 w-32 bg-success-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              )}
              <p className="text-xs text-success-600 mt-1">
                {chainMetadata ? `${chainMetadata.icon} ${chainMetadata.shortName}` : 'Multi-Chain'}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-success-500 to-emerald-600 rounded-2xl shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Protection Status Card */}
        <div className={`stat-card ${isProtectionActive ? 'from-primary-50 to-blue-100 border-primary-200' : 'from-gray-50 to-gray-100 border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${isProtectionActive ? 'text-primary-700' : 'text-gray-500'}`}>Protection</p>
              {policyLoading ? (
                <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">
                  {isProtectionActive ? 'Active' : 'Inactive'}
                </p>
              )}
              <p className={`text-xs mt-1 ${isProtectionActive ? 'text-primary-600' : 'text-gray-500'}`}>
                {isProtectionActive ? 'Monitoring' : isDeployed ? 'Not configured' : 'Not available'}
              </p>
            </div>
            <div className={`p-4 rounded-2xl shadow-lg ${isProtectionActive ? 'bg-gradient-to-br from-primary-500 to-blue-600' : 'bg-gray-300'}`}>
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Risk Level Card */}
        <div className={`stat-card ${getRiskColor()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium mb-1 ${
                riskLevel === 0 ? 'text-success-700' : 
                riskLevel === 1 ? 'text-warning-700' : 
                'text-red-700'
              }`}>Risk Level</p>
              {portfolioLoading ? (
                <div className="h-9 w-20 bg-gray-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{getRiskLabel()}</p>
              )}
              <p className={`text-xs mt-1 ${
                riskLevel === 0 ? 'text-success-600' : 
                riskLevel === 1 ? 'text-warning-600' : 
                'text-red-600'
              }`}>
                {riskLevel === 0 ? 'All systems normal' : 
                 riskLevel === 1 ? 'Monitor closely' : 
                 'Action may be needed'}
              </p>
            </div>
            <div className={`p-4 rounded-2xl shadow-lg ${
              riskLevel === 0 ? 'bg-gradient-to-br from-success-500 to-emerald-600' : 
              riskLevel === 1 ? 'bg-gradient-to-br from-warning-500 to-amber-600' : 
              'bg-gradient-to-br from-red-500 to-red-600'
            }`}>
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Assets Count Card */}
        <div className="stat-card from-purple-50 to-pink-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">Assets</p>
              {portfolioLoading ? (
                <div className="h-9 w-16 bg-purple-200 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{assetsCount}</p>
              )}
              <p className="text-xs text-purple-600 mt-1">
                {assetsCount === 1 ? 'Protected token' : 'Protected tokens'}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioOverview />
        <PolicyStatus />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Live Market Prices</h2>
          </div>
          <Link
            to="/prices"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTokens.map((token) => (
            <PriceCard key={token.address} token={token} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;