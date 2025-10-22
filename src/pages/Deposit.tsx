import React from 'react';
import { ArrowDownCircle, Wallet, Shield, Activity, DollarSign } from 'lucide-react';
import DepositForm from '@/components/deposit/DepositForm';
import { useAccount } from 'wagmi';

import { usePortfolioData } from '@/hooks';
import { formatUnits } from 'viem';

const Deposit: React.FC = () => {
  const { isConnected, address } = useAccount();

  
  // Get portfolio data from contract
  const { portfolio, isLoading: portfolioLoading } = usePortfolioData(address);
  
  const portfolioData = portfolio as any;
  const totalValue = portfolioData ? Number(formatUnits(BigInt(portfolioData.totalValue || portfolioData[1] || 0), 18)) : 0;
  const assets = portfolioData?.assets || portfolioData?.[0] || [];
  const assetsCount = Array.isArray(assets) ? assets.length : 0;



  if (!isConnected) {
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
              <ArrowDownCircle className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">Connect Wallet</h2>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">Connect your wallet to start depositing assets</p>
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

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 p-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-cyan-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <ArrowDownCircle className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] mb-2">Deposit Assets</h1>
                  <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-cyan-400" />
                    Secure your crypto with GuardX protection
                  </p>
                </div>
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deposit Form */}
          <div className="lg:col-span-2">
            <DepositForm />
          </div>

          {/* Portfolio Sidebar */}
          <div className="space-y-6">
            {/* Current Portfolio */}
            <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Your Portfolio</h3>
              </div>
              
              {portfolioLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-800 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-24"></div>
                </div>
              ) : (
                <div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    ${totalValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {assetsCount} {assetsCount === 1 ? 'asset' : 'assets'} deposited
                  </p>
                </div>
              )}
            </div>

            {/* Deposited Assets */}
            <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Deposited Assets</h3>
              </div>
              
              {portfolioLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
                        <div className="h-4 bg-gray-800 rounded w-12"></div>
                      </div>
                      <div className="h-4 bg-gray-800 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : assetsCount > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {assets.map((asset: any, index: number) => {
                    // Handle both array and object formats
                    const tokenAddress = asset.tokenAddress || asset[0] || asset;
                    const amount = asset.amount || asset[1] || 0;
                    const valueUSD = asset.valueUSD || asset[2] || 0;
                    
                    // Determine token symbol and decimals from address
                    const getTokenInfo = (address: string) => {
                      const addr = address?.toLowerCase();
                      if (addr === '0x0000000000000000000000000000000000000000') return { symbol: 'ETH', decimals: 18 };
                      if (addr === '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'.toLowerCase()) return { symbol: 'USDC', decimals: 6 };
                      if (addr === '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'.toLowerCase()) return { symbol: 'USDT', decimals: 6 };
                      if (addr === '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73'.toLowerCase()) return { symbol: 'WETH', decimals: 18 };
                      return { symbol: 'TOKEN', decimals: 18 };
                    };

                    const tokenInfo = getTokenInfo(tokenAddress);
                    const formattedAmount = formatUnits(BigInt(amount || 0), tokenInfo.decimals);
                    const formattedValue = formatUnits(BigInt(valueUSD || 0), 18);

                    return (
                      <div key={`${tokenAddress}-${index}`} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                            <span className="text-xs font-bold text-white">{tokenInfo.symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{tokenInfo.symbol}</p>
                            <p className="text-xs text-gray-400">{parseFloat(formattedAmount).toFixed(6)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">${parseFloat(formattedValue).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Wallet className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No assets deposited yet</p>
                </div>
              )}
            </div>

            {/* Protection Info */}
            <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Protection Features</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">AI-Powered Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Automated Emergency Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Cross-Chain Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Real-Time Price Feeds</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Platform Stats</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Value Locked</span>
                  <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">$2.4M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Active Users</span>
                  <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Protected Assets</span>
                  <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Uptime</span>
                  <span className="text-sm font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">99.9%</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;