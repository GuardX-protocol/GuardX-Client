import React from 'react';
import { Wallet, Shield, ArrowRight, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useVincentAuth } from './VincentAuth';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface AuthenticationFlowProps {
  title?: string;
  subtitle?: string;
  showCapabilities?: boolean;
}

const AuthenticationFlow: React.FC<AuthenticationFlowProps> = ({
  title = "Connect to Get Started",
  subtitle = "Connect your wallet and authenticate Vincent for full functionality",
  showCapabilities = true
}) => {
  const { 
    connectWallet, 
    isConnecting: isWalletConnecting,
    error: walletError,
    chainName,
    isChainSupported,
    switchChain
  } = useWeb3Auth();
  
  const { 
    initiateAuth: initiateVincentAuth,
    isLoading: isVincentLoading,
    requiresWalletFirst,
    canAuthenticateVincent
  } = useVincentAuth();
  
  const unifiedAuth = useUnifiedAuth();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleVincentAuth = () => {
    if (!canAuthenticateVincent) {
      connectWallet();
      return;
    }
    initiateVincentAuth();
  };

  return (
    <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
          {title}
        </h2>
        <p className="text-gray-400">
          {subtitle}
        </p>
      </div>

      {/* Authentication Steps */}
      <div className="space-y-6">
        
        {/* Step 1: Web3 Wallet */}
        <div className={`p-6 rounded-xl border transition-all ${
          unifiedAuth.walletAddress 
            ? 'border-green-500/30 bg-green-500/10' 
            : 'border-gray-700 bg-gray-800/50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                unifiedAuth.walletAddress ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                {unifiedAuth.walletAddress ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <Wallet className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Step 1: Connect Wallet</h3>
                <p className="text-sm text-gray-400">Connect your Web3 wallet for basic functionality</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-600">1</div>
          </div>

          {unifiedAuth.walletAddress ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Wallet Connected</span>
              </div>
              <div className="text-sm text-gray-300 font-mono">
                {formatAddress(unifiedAuth.walletAddress)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {chainName} {!isChainSupported && '(Unsupported)'}
                </span>
                {!isChainSupported && (
                  <button
                    onClick={() => switchChain(84532)}
                    className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    Switch to Base Sepolia
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={connectWallet}
                disabled={isWalletConnecting}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                {isWalletConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
              {walletError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{walletError}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <ArrowRight className={`h-6 w-6 ${unifiedAuth.walletAddress ? 'text-orange-400' : 'text-gray-600'}`} />
        </div>

        {/* Step 2: Vincent Authentication */}
        <div className={`p-6 rounded-xl border transition-all ${
          unifiedAuth.authMethod === 'both'
            ? 'border-green-500/30 bg-green-500/10'
            : unifiedAuth.walletAddress
            ? 'border-orange-500/30 bg-orange-500/10'
            : 'border-gray-700 bg-gray-800/50 opacity-50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                unifiedAuth.authMethod === 'both' ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                {unifiedAuth.authMethod === 'both' ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : (
                  <Shield className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Step 2: Authenticate Vincent</h3>
                <p className="text-sm text-gray-400">Enable cross-chain deposits and advanced features</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-600">2</div>
          </div>

          {unifiedAuth.authMethod === 'both' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Vincent Authenticated</span>
              </div>
              <div className="text-sm text-gray-300 font-mono">
                {formatAddress(unifiedAuth.vincentAddress || '')}
              </div>
              <div className="text-sm text-green-400">
                Cross-chain abilities enabled
              </div>
            </div>
          ) : requiresWalletFirst ? (
            <div className="space-y-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Wallet Required First</span>
                </div>
                <p className="text-sm text-yellow-300/80">
                  Complete Step 1 to unlock Vincent authentication
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleVincentAuth}
                disabled={isVincentLoading || !canAuthenticateVincent}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {isVincentLoading ? 'Authenticating...' : 'Authenticate Vincent'}
              </button>
              <div className="text-sm text-gray-400 text-center">
                Enables cross-chain deposits, swaps, and advanced features
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Capabilities Overview */}
      {showCapabilities && (
        <div className="mt-8 p-6 bg-gray-800/30 rounded-xl">
          <h4 className="text-lg font-semibold text-white mb-4">What You Can Do</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border transition-all ${
              unifiedAuth.canDoSameChain 
                ? 'border-green-500/30 bg-green-500/10' 
                : 'border-gray-700 bg-gray-800/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {unifiedAuth.canDoSameChain ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                )}
                <span className={`text-sm font-medium ${
                  unifiedAuth.canDoSameChain ? 'text-green-400' : 'text-gray-500'
                }`}>
                  Same-Chain Deposits
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Deposit tokens on the same blockchain
              </p>
            </div>

            <div className={`p-4 rounded-lg border transition-all ${
              unifiedAuth.canDoCrossChain 
                ? 'border-green-500/30 bg-green-500/10' 
                : 'border-gray-700 bg-gray-800/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {unifiedAuth.canDoCrossChain ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                )}
                <span className={`text-sm font-medium ${
                  unifiedAuth.canDoCrossChain ? 'text-green-400' : 'text-gray-500'
                }`}>
                  Cross-Chain Bridge
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Bridge tokens between different blockchains
              </p>
            </div>

            <div className={`p-4 rounded-lg border transition-all ${
              unifiedAuth.canDoVaultOperations 
                ? 'border-green-500/30 bg-green-500/10' 
                : 'border-gray-700 bg-gray-800/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {unifiedAuth.canDoVaultOperations ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                )}
                <span className={`text-sm font-medium ${
                  unifiedAuth.canDoVaultOperations ? 'text-green-400' : 'text-gray-500'
                }`}>
                  Vault Operations
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Deposit and manage assets in GuardX vault
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthenticationFlow;