import React, { useState } from 'react';
import { Wallet, Shield, ChevronDown, LogOut, CheckCircle, AlertTriangle, Zap, Network, RefreshCw } from 'lucide-react';
import { formatUnits } from 'viem';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useVincentAuth } from './VincentAuth';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useFlexibleTokenBalance } from '@/hooks/useFlexibleTokenBalance';

// Helper function to get chain display name
const getChainDisplayName = (chainId: number): string => {
  switch (chainId) {
    case 421614: return 'Arbitrum Sepolia';
    case 84532: return 'Base Sepolia';
    case 11155111: return 'Ethereum Sepolia';
    case 1: return 'Ethereum';
    case 137: return 'Polygon';
    case 42161: return 'Arbitrum';
    case 8453: return 'Base';
    default: return `Chain ${chainId}`;
  }
};

// Available chains for switching
const AVAILABLE_CHAINS = [
  { id: 421614, name: 'Arbitrum Sepolia', color: 'blue' },
  { id: 84532, name: 'Base Sepolia', color: 'blue' },
  { id: 11155111, name: 'Ethereum Sepolia', color: 'blue' },
];

const UnifiedAuthButton: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { 
    connectWallet, 
    disconnectWallet, 
    isConnecting: isWalletConnecting,
    error: walletError,
    chainName,
    chainId,
    isChainSupported,
    switchChain
  } = useWeb3Auth();
  
  const { 
    isAuthenticated: isVincentAuthenticated, 
    user: vincentUser, 
    logout: vincentLogout,
    initiateAuth: initiateVincentAuth,
    isLoading: isVincentLoading,
    requiresWalletFirst,
    canAuthenticateVincent
  } = useVincentAuth();
  
  const unifiedAuth = useUnifiedAuth();

  // Get wallet balance for the connected chain
  const { 
    balance: walletBalance, 
    loading: balanceLoading, 
    refetch: refetchBalance 
  } = useFlexibleTokenBalance(
    chainId || 84532, 
    undefined, // Native ETH
    unifiedAuth.walletAddress || undefined
  );

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.0001) return '< 0.0001';
    if (num < 1) return num.toFixed(4);
    return num.toFixed(3);
  };

  const handleVincentAuth = () => {
    if (!canAuthenticateVincent) {
      // First connect wallet
      connectWallet();
      return;
    }
    initiateVincentAuth();
  };

  const handleFullLogout = () => {
    disconnectWallet();
    vincentLogout();
    setIsDropdownOpen(false);
  };

  // If nothing is connected, show connect button
  if (!unifiedAuth.isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isWalletConnecting}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-medium transition-colors"
      >
        <Wallet className="h-4 w-4" />
        {isWalletConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  // Connected state - show unified button with dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl hover:border-orange-500 transition-all"
      >
        {/* Status Icons */}
        <div className="flex items-center gap-1">
          {unifiedAuth.walletAddress && (
            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
              <Wallet className="h-3 w-3 text-white" />
            </div>
          )}
          {isVincentAuthenticated && (
            <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Balance & Address Display */}
        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-2">
            <p className="text-xs text-slate-400">
              {getChainDisplayName(chainId || 84532)}
            </p>
            {!isChainSupported && (
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white">
              {balanceLoading ? (
                'Loading...'
              ) : walletBalance ? (
                `${formatBalance(walletBalance.formattedNative)} ETH`
              ) : (
                formatAddress(unifiedAuth.address || '')
              )}
            </p>
            {walletBalance && !balanceLoading && (
              <p className="text-xs text-slate-400">
                {formatAddress(unifiedAuth.address || '')}
              </p>
            )}
          </div>
        </div>

        {/* Mobile Display */}
        <div className="text-left sm:hidden">
          <div className="flex items-center gap-1">
            <p className="text-xs text-slate-400">
              {getChainDisplayName(chainId || 84532).split(' ')[0]}
            </p>
            {!isChainSupported && (
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
            )}
          </div>
          <p className="text-sm font-medium text-white">
            {balanceLoading ? '...' : walletBalance ? `${formatBalance(walletBalance.formattedNative)}` : formatAddress(unifiedAuth.address || '').split('...')[0]}
          </p>
        </div>

        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl z-[70] overflow-hidden animate-fade-in">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Authentication Status</h3>
                <button
                  onClick={handleFullLogout}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  title="Logout All"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {/* Capabilities Overview */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className={`p-2 rounded-lg text-center ${unifiedAuth.canDoSameChain ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
                  <div className="font-medium">Same Chain</div>
                  <div className="text-xs opacity-75">Deposits</div>
                </div>
                <div className={`p-2 rounded-lg text-center ${unifiedAuth.canDoCrossChain ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
                  <div className="font-medium">Cross Chain</div>
                  <div className="text-xs opacity-75">Bridge</div>
                </div>
                <div className={`p-2 rounded-lg text-center ${unifiedAuth.canDoVaultOperations ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-500'}`}>
                  <div className="font-medium">Vault Ops</div>
                  <div className="text-xs opacity-75">Deposit</div>
                </div>
              </div>
            </div>

            {/* Wallet Section */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">Web3 Wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  {walletBalance && !balanceLoading && (
                    <button
                      onClick={refetchBalance}
                      className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                      title="Refresh Balance"
                    >
                      <RefreshCw className="h-3 w-3 text-blue-400" />
                    </button>
                  )}
                  {unifiedAuth.walletAddress ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>

              {unifiedAuth.walletAddress ? (
                <div className="space-y-3">
                  {/* Address & Balance */}
                  <div className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Address</span>
                      <span className="text-xs text-gray-400 font-mono">
                        {formatAddress(unifiedAuth.walletAddress)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Balance</span>
                      <span className="text-sm font-medium text-white">
                        {balanceLoading ? (
                          'Loading...'
                        ) : walletBalance ? (
                          `${formatBalance(walletBalance.formattedNative)} ETH`
                        ) : (
                          '0.00 ETH'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Chain Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Network className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">Network</span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {AVAILABLE_CHAINS.map((chain) => (
                        <button
                          key={chain.id}
                          onClick={() => switchChain(chain.id)}
                          className={`p-2 rounded-lg text-xs transition-all text-left ${
                            chainId === chain.id
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{chain.name}</span>
                            {chainId === chain.id && (
                              <CheckCircle className="h-3 w-3 text-blue-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Disconnect Button */}
                  <button
                    onClick={disconnectWallet}
                    className="w-full text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isWalletConnecting}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
                >
                  {isWalletConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>

            {/* Vincent Section */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-white">Vincent Auth</span>
                </div>
                {isVincentAuthenticated ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                )}
              </div>

              {isVincentAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400 font-mono">
                    {formatAddress(vincentUser?.pkpAddress || '')}
                  </div>
                  <div className="text-xs text-green-400">
                    Cross-chain abilities enabled
                  </div>
                  <div className="text-xs text-gray-400">
                    {vincentUser?.permissions.length || 0} permissions granted
                  </div>
                  <button
                    onClick={vincentLogout}
                    className="w-full text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors"
                  >
                    Logout Vincent
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {requiresWalletFirst ? (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="font-medium">Wallet Required</span>
                      </div>
                      <p className="text-xs text-yellow-300/80">
                        Connect your Web3 wallet first to enable Vincent authentication
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleVincentAuth}
                      disabled={isVincentLoading || !canAuthenticateVincent}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap className="h-3 w-3" />
                      {isVincentLoading ? 'Authenticating...' : 'Authenticate Vincent'}
                    </button>
                  )}
                  <div className="text-xs text-gray-400">
                    Required for cross-chain deposits and swaps
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {walletError && (
              <div className="p-4 border-t border-slate-700">
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{walletError}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UnifiedAuthButton;