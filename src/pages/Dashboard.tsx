import React from 'react';
import { Shield, TrendingUp, AlertTriangle, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { usePortfolioData, usePolicyData } from '@/hooks';
import { formatUnits } from 'viem';
import { useNetwork, useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';
import PolicyStatus from '@/components/policy/PolicyStatus';
import PriceFeedBox from '@/components/dashboard/PriceFeedBox';

const Dashboard: React.FC = () => {
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  
  const { portfolio, isLoading: portfolioLoading } = usePortfolioData(address);
  const { policy, isLoading: policyLoading } = usePolicyData(address);

  const portfolioData = portfolio as any;
  const totalValue = portfolioData ? Number(formatUnits(BigInt(portfolioData.totalValue || portfolioData[1] || 0), 18)) : 0;
  const assets = portfolioData?.assets || portfolioData?.[0] || [];
  const assetsCount = Array.isArray(assets) ? assets.length : 0;

  const policyData = policy as any;
  const crashThreshold = policyData?.crashThreshold || policyData?.[0] || BigInt(0);
  const isProtectionActive = Number(crashThreshold) > 0;

  const riskScore = portfolioData?.riskScore || portfolioData?.[3] || BigInt(0);
  const riskLevel = Number(riskScore);

  if (!isConnected || !address) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full text-center shine-effect">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse-glow">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-3">Connect Wallet</h2>
          <p className="text-gray-400 mb-6 text-sm sm:text-base">Connect your wallet to access GuardX protection</p>
          <div className="text-xs sm:text-sm text-gray-500">Click "Connect Wallet" in the header</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">Portfolio Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">Real-time protection monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 sm:px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold text-emerald-300">{chain?.name || 'Network'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="stat-card glow-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
          </div>
          <div className="text-xs sm:text-sm text-gray-400 mb-1">Total Portfolio</div>
          {portfolioLoading ? (
            <div className="h-7 sm:h-8 w-28 sm:w-32 bg-white/5 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-white">${totalValue.toFixed(2)}</div>
          )}
        </div>

        <div className={`stat-card glow-border ${isProtectionActive ? 'border-blue-500/30' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 sm:p-3 rounded-xl ${isProtectionActive ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-600'}`}>
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-400 mb-1">Protection</div>
          {policyLoading ? (
            <div className="h-7 sm:h-8 w-20 sm:w-24 bg-white/5 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-white">{isProtectionActive ? 'Active' : 'Inactive'}</div>
          )}
        </div>

        <div className={`stat-card glow-border ${riskLevel > 1 ? 'border-red-500/30' : 'border-emerald-500/30'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 sm:p-3 rounded-xl ${riskLevel > 1 ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-emerald-500 to-green-600'}`}>
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-400 mb-1">Risk Level</div>
          {portfolioLoading ? (
            <div className="h-7 sm:h-8 w-16 sm:w-20 bg-white/5 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-white">{riskLevel === 0 ? 'Low' : riskLevel === 1 ? 'Medium' : 'High'}</div>
          )}
        </div>

        <div className="stat-card glow-border">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
          </div>
          <div className="text-xs sm:text-sm text-gray-400 mb-1">Active Assets</div>
          {portfolioLoading ? (
            <div className="h-7 sm:h-8 w-12 sm:w-16 bg-white/5 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-white">{assetsCount}</div>
          )}
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <PortfolioOverview />
        <PolicyStatus />
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Live Price Feeds</h2>
            <p className="text-gray-400 text-sm">Real-time data from Pyth Network</p>
          </div>
          <Link to="/prices" className="btn-secondary flex items-center justify-center gap-2 text-sm sm:text-base">
            <Activity className="h-4 w-4" />
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <PriceFeedBox symbol="BTC" name="Bitcoin" />
          <PriceFeedBox symbol="ETH" name="Ethereum" />
          <PriceFeedBox symbol="USDC" name="USD Coin" />
          <PriceFeedBox symbol="LINK" name="Chainlink" />
          <PriceFeedBox symbol="UNI" name="Uniswap" />
          <PriceFeedBox symbol="AAVE" name="Aave" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;