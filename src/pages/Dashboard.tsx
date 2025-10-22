import React from 'react';
import { Shield, TrendingUp, AlertTriangle, Activity, DollarSign, BarChart3, Wallet, ArrowUpRight } from 'lucide-react';
import { usePortfolioData, usePolicyData } from '@/hooks';
import { formatUnits } from 'viem';
import { useNetwork, useAccount } from 'wagmi';
import { Link } from 'react-router-dom';

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
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
        {/* Animated Background Particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 opacity-30 animate-pulse">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute top-1/10 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
        </div>
        
        <div className="relative z-10 min-h-[80vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center p-8 bg-black/50 rounded-2xl border border-cyan-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <Shield className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">Connect Wallet</h2>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">Connect your wallet to access GuardX protection</p>
            <div className="text-xs sm:text-sm text-gray-500">Click "Connect Wallet" in the header</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-30 animate-pulse">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-1/10 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 space-y-6 sm:space-y-8 p-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-cyan-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <BarChart3 className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] mb-2">Portfolio Dashboard</h1>
                <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Real-time protection monitoring
                </p>
              </div>
            </div>
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

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Value */}
            <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">Portfolio Value</h3>
                </div>
                <Link 
                  to="/app/deposit"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                >
                  <span className="text-sm">Deposit</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              
              {portfolioLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-800 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-24"></div>
                </div>
              ) : (
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    ${totalValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {assetsCount} {assetsCount === 1 ? 'asset' : 'assets'} • Risk Level: {riskLevel > 0 ? riskLevel : 'Low'}
                  </p>
                </div>
              )}
            </div>

            {/* Assets List */}
            <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-cyan-400" />
                Your Assets
              </h3>
              
              {portfolioLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-800 rounded w-16 mb-1"></div>
                          <div className="h-3 bg-gray-800 rounded w-12"></div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-800 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : assetsCount > 0 ? (
                <div className="space-y-3">
                  {Array.isArray(assets) && assets.map((asset: any, index: number) => {
                    const tokenAddress = asset.tokenAddress || asset[0];
                    const amount = asset.amount || asset[1];
                    const valueUSD = asset.valueUSD || asset[2];
                    
                    // Determine token symbol from address
                    const getTokenSymbol = (address: string) => {
                      if (address === '0x0000000000000000000000000000000000000000') return 'ETH';
                      if (address === '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d') return 'USDC';
                      if (address === '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0') return 'USDT';
                      if (address === '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73') return 'WETH';
                      return 'TOKEN';
                    };

                    const symbol = getTokenSymbol(tokenAddress);
                    const formattedAmount = formatUnits(BigInt(amount || 0), symbol === 'USDC' || symbol === 'USDT' ? 6 : 18);
                    const formattedValue = formatUnits(BigInt(valueUSD || 0), 18);

                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                            <span className="text-xs font-bold text-white">{symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{symbol}</p>
                            <p className="text-xs text-gray-400">{parseFloat(formattedAmount).toFixed(4)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">${parseFloat(formattedValue).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">No assets deposited yet</p>
                  <p className="text-sm text-gray-500">Start by depositing your first asset</p>
                </div>
              )}
            </div>
          </div>

          {/* Protection Status */}
          <div className="space-y-6">
            {/* Protection Policy */}
            <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Protection Status</h3>
              </div>
              
              {policyLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-32"></div>
                </div>
              ) : isProtectionActive ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm font-medium text-green-400">Active</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Crash threshold: {(Number(crashThreshold) / 100).toFixed(1)}%
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Not Configured</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Set up protection policies to secure your assets
                  </p>
                  <Link 
                    to="/app/policies"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-colors text-sm"
                  >
                    Configure Protection
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/app/deposit"
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50 hover:border-cyan-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-cyan-400" />
                    <span className="text-white group-hover:text-cyan-400 transition-colors">Deposit Assets</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </Link>
                
                <Link 
                  to="/app/policies"
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50 hover:border-cyan-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-cyan-400" />
                    <span className="text-white group-hover:text-cyan-400 transition-colors">Protection Policies</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </Link>
                
                <Link 
                  to="/app/audit"
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50 hover:border-cyan-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-cyan-400" />
                    <span className="text-white group-hover:text-cyan-400 transition-colors">View History</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;