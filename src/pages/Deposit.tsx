import React from 'react';
import { ArrowDownCircle, Wallet, Shield, Activity, DollarSign } from 'lucide-react';
import DepositForm from '@/components/deposit/DepositForm';
import { useAccount } from 'wagmi';
import { useWalletModal } from '@/hooks/useWalletModal';
import { usePortfolioData } from '@/hooks';
import { formatUnits } from 'viem';

const Deposit: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { openWalletModal } = useWalletModal();
  
  // Get portfolio data from contract
  const { portfolio, isLoading: portfolioLoading } = usePortfolioData(address);
  
  const portfolioData = portfolio as any;
  const totalValue = portfolioData ? Number(formatUnits(BigInt(portfolioData.totalValue || portfolioData[1] || 0), 18)) : 0;
  const assets = portfolioData?.assets || portfolioData?.[0] || [];
  const assetsCount = Array.isArray(assets) ? assets.length : 0;



  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800 mb-6">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
            <p className="text-gray-400 mb-6">Connect your wallet to start depositing assets</p>
            <button
              onClick={openWalletModal}
              className="w-full px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800">
            <ArrowDownCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Deposit Assets</h1>
            <p className="text-gray-400">Secure your crypto with GuardX protection</p>
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
            <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
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
                  <p className="text-2xl font-bold text-white mb-1">
                    ${totalValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {assetsCount} {assetsCount === 1 ? 'asset' : 'assets'} deposited
                  </p>
                </div>
              )}
            </div>

            {/* Deposited Assets */}
            <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Deposited Assets</h3>
              </div>
              
              {portfolioLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-black rounded-xl">
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
                      <div key={index} className="flex items-center justify-between p-3 bg-black rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{symbol.slice(0, 2)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{symbol}</p>
                            <p className="text-xs text-gray-400">{parseFloat(formattedAmount).toFixed(4)}</p>
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
            <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Protection Features</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">AI-Powered Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Automated Emergency Response</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Cross-Chain Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Real-Time Price Feeds</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Platform Stats</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Value Locked</span>
                  <span className="text-sm font-medium text-white">$2.4M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Active Users</span>
                  <span className="text-sm font-medium text-white">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Protected Assets</span>
                  <span className="text-sm font-medium text-white">847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Uptime</span>
                  <span className="text-sm font-medium text-white">99.9%</span>
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