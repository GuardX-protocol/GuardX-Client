import React from 'react';
import { Shield, TrendingUp, AlertTriangle, Activity, DollarSign, BarChart3, Wallet, ArrowUpRight, User, CheckCircle, Clock } from 'lucide-react';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { useGuardXUser, useGuardXPrices } from '@/hooks/useGuardX';
import { Link } from 'react-router-dom';
import GuardXMonitoringCard from '@/components/guardx/GuardXMonitoringCard';
import ProfileManagement from '@/components/profile/ProfileManagement';

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useVincentAuth();
  const { user, createUser, isLoading: userLoading } = useGuardXUser();
  const { prices, fetchPrices } = useGuardXPrices();

  // Mock portfolio and policy data for now (replace with Vincent-based calls)
  const portfolioLoading = false;
  const policyLoading = false;

  // Mock data for now - replace with Vincent-based portfolio calls
  const totalValue = 0;
  const assets: any[] = [];
  const riskLevel = 0;

  const assetsCount = Array.isArray(assets) ? assets.length : 0;

  // Fetch prices for assets
  React.useEffect(() => {
    if (assets.length > 0) {
      const symbols = assets.map((asset: any) => {
        const tokenAddress = asset.tokenAddress || asset[0] || asset;
        const getTokenSymbol = (address: string) => {
          const addr = address?.toLowerCase();
          if (addr === '0x0000000000000000000000000000000000000000') return 'ETH';
          if (addr === '0x4200000000000000000000000000000000000006') return 'WETH';
          if (addr === '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'.toLowerCase()) return 'USDC';
          if (addr === '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'.toLowerCase()) return 'USDT';
          return 'TOKEN';
        };
        return getTokenSymbol(tokenAddress);
      }).filter(symbol => symbol !== 'TOKEN');

      if (symbols.length > 0) {
        fetchPrices(symbols);
      }
    }
  }, [assets, fetchPrices]);

  // Mock protection status for now - replace with Vincent-based policy calls
  const isProtectionActive = false;
  const crashThreshold = 0;

  const handleCreateUser = async () => {
    try {
      await createUser({
        notificationPreferences: {
          telegram_alerts: true,
          email_alerts: false,
          webhook_alerts: false,
        },
      });
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        // User already exists, show success message and refresh
        window.location.reload();
      } else {
        console.error('Error creating GuardX user:', error);
      }
    }
  };

  const getOnboardingSteps = () => {
    const steps = [
      {
        id: 'connect',
        title: 'Connect Wallet',
        description: 'Connect your wallet to get started',
        completed: isAuthenticated,
        action: null,
      },
      {
        id: 'profile',
        title: 'Create Profile',
        description: 'Set up your GuardX profile for monitoring',
        completed: !!user,
        action: user ? null : handleCreateUser,
      },
      {
        id: 'deposit',
        title: 'Deposit Assets',
        description: 'Deposit your first assets to protect',
        completed: assetsCount > 0,
        action: '/app/deposit',
      },
      {
        id: 'policies',
        title: 'Configure Protection',
        description: 'Set up crash protection policies',
        completed: isProtectionActive,
        action: '/app/policies',
      },
    ];
    return steps;
  };

  const onboardingSteps = getOnboardingSteps();
  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const isFullyOnboarded = completedSteps === onboardingSteps.length;

  if (!isAuthenticated) {
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
        {/* User Onboarding Section */}
        {!isFullyOnboarded && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent"></div>
            <div className="relative p-6 bg-gray-900/50 rounded-2xl border border-cyan-500/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
                    <User className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Welcome to GuardX</h2>
                    <p className="text-gray-400 text-sm">Complete setup to start protecting your assets</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">{completedSteps}/{onboardingSteps.length}</div>
                  <div className="text-xs text-gray-400">Steps Complete</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {onboardingSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition-all duration-200 ${step.completed
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-cyan-500/30'
                      }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700/50 text-gray-400'
                        }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-sm">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{step.description}</p>
                    {!step.completed && step.action && (
                      <div>
                        {typeof step.action === 'string' ? (
                          <Link
                            to={step.action}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs hover:bg-cyan-500/30 transition-colors"
                          >
                            Complete
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          <button
                            onClick={step.action}
                            disabled={userLoading}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                          >
                            {userLoading ? (
                              <>
                                <Clock className="h-3 w-3 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              'Complete'
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
                <span className="text-xs sm:text-sm font-semibold text-emerald-300">Vincent Network</span>
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

          <div className={`stat-card glow-border ${isProtectionActive ? 'border-red-500/30' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 sm:p-3 rounded-xl ${isProtectionActive ? 'bg-gradient-to-br from-red-500 to-orange-600' : 'bg-gray-600'}`}>
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
                    {assets.map((asset: any, index: number) => {
                      // Handle both array and object formats
                      const tokenAddress = asset.tokenAddress || asset[0] || asset;
                      // const amount = asset.amount || asset[1] || 0; // Unused in mock
                      // const valueUSD = asset.valueUSD || asset[2] || 0; // Unused in mock

                      // Determine token symbol and decimals from address
                      const getTokenInfo = (address: string) => {
                        const addr = address?.toLowerCase();
                        if (addr === '0x0000000000000000000000000000000000000000') return { symbol: 'ETH', decimals: 18 };
                        if (addr === '0x4200000000000000000000000000000000000006') return { symbol: 'WETH', decimals: 18 };
                        if (addr === '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'.toLowerCase()) return { symbol: 'USDC', decimals: 6 };
                        if (addr === '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'.toLowerCase()) return { symbol: 'USDT', decimals: 6 };
                        return { symbol: 'TOKEN', decimals: 18 };
                      };

                      const tokenInfo = getTokenInfo(tokenAddress);
                      const formattedAmount = '0.000000'; // Mock for now
                      const formattedValue = '0.00'; // Mock for now

                      // Get real-time price data
                      const priceData = prices[`${tokenInfo.symbol}USDT`] || prices[tokenInfo.symbol];
                      const currentPrice = priceData?.price || 0;
                      const priceChange = priceData?.change_24h || 0;

                      // Skip zero amounts
                      if (parseFloat(formattedAmount) === 0) return null;

                      return (
                        <div key={`${tokenAddress}-${index}`} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl border border-gray-800/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                              <span className="text-xs font-bold text-cyan-400">{tokenInfo.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                              <p className="font-medium text-white">{tokenInfo.symbol}</p>
                              <p className="text-xs text-gray-400">{parseFloat(formattedAmount).toFixed(6)}</p>
                              {currentPrice > 0 && (
                                <p className="text-xs text-gray-500">
                                  ${currentPrice.toFixed(2)} •
                                  <span className={`ml-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                              ${parseFloat(formattedValue).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {((parseFloat(formattedValue) / totalValue) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      );
                    }).filter(Boolean)}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No assets deposited yet</p>
                    <p className="text-sm text-gray-500 mb-4">Start by depositing your first asset</p>
                    <Link
                      to="/app/deposit"
                      className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-colors text-sm"
                    >
                      Deposit Now
                    </Link>
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
                      Crash threshold: {(crashThreshold / 100).toFixed(1)}%
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

              {/* Profile Management */}
              <ProfileManagement />

              {/* GuardX AI Monitoring */}
              <GuardXMonitoringCard />

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