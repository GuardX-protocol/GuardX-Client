import React from 'react';
import { VincentAuthProvider } from './VincentAuth';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useVincentAuth } from './VincentAuth';
import { Wallet, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Web3AuthWrapperProps {
  children: React.ReactNode;
}

// Wallet Connection UI Component
const WalletConnectUI: React.FC = () => {
  const { 
    walletAddress, 
    isConnected, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet,
    chainName,
    isChainSupported,
    switchChain
  } = useWeb3Auth();

  const { isAuthenticated: isVincentAuthenticated, user: vincentUser } = useVincentAuth();

  return (
    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Wallet className="h-5 w-5 text-blue-400" />
        Wallet & Vincent Status
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Traditional Wallet */}
        <div className="p-3 bg-gray-900/50 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-blue-400" />
            Web3 Wallet
          </h4>
          
          {!isConnected ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm">Connected</span>
              </div>
              <p className="text-white text-sm font-mono">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </p>
              <p className="text-gray-400 text-xs">
                {chainName} {!isChainSupported && '(Unsupported)'}
              </p>
              
              {!isChainSupported && (
                <button
                  onClick={() => switchChain(84532)} // Switch to Base Sepolia
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1 px-2 rounded text-xs"
                >
                  Switch to Base Sepolia
                </button>
              )}
              
              <button
                onClick={disconnectWallet}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded text-xs"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Vincent Authentication */}
        <div className="p-3 bg-gray-900/50 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-400" />
            Vincent Auth
          </h4>
          
          {isVincentAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400 text-sm">Authenticated</span>
              </div>
              <p className="text-white text-sm font-mono">
                {vincentUser?.pkpAddress?.slice(0, 6)}...{vincentUser?.pkpAddress?.slice(-4)}
              </p>
              <p className="text-gray-400 text-xs">
                Cross-chain enabled
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">Not authenticated</span>
              </div>
              <p className="text-gray-400 text-xs">
                Connect Vincent for cross-chain deposits
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Combined Status */}
      <div className="p-3 bg-gray-900/50 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Available Features</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle className="h-3 w-3 text-green-400" />
            ) : (
              <XCircle className="h-3 w-3 text-red-400" />
            )}
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              Same-chain deposits
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isVincentAuthenticated ? (
              <CheckCircle className="h-3 w-3 text-green-400" />
            ) : (
              <XCircle className="h-3 w-3 text-red-400" />
            )}
            <span className={isVincentAuthenticated ? 'text-green-400' : 'text-red-400'}>
              Cross-chain deposits
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(isConnected || isVincentAuthenticated) ? (
              <CheckCircle className="h-3 w-3 text-green-400" />
            ) : (
              <XCircle className="h-3 w-3 text-red-400" />
            )}
            <span className={(isConnected || isVincentAuthenticated) ? 'text-green-400' : 'text-red-400'}>
              Vault operations
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main wrapper component
export const Web3AuthWrapper: React.FC<Web3AuthWrapperProps> = ({ children }) => {
  return (
    <VincentAuthProvider>
      <div className="min-h-screen bg-gray-900">
        {children}
      </div>
    </VincentAuthProvider>
  );
};

// Export the UI component separately for use in pages
export { WalletConnectUI };