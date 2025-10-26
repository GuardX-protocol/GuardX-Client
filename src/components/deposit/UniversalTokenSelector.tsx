import React, { useState } from 'react';
import { ChevronDown, Search, Plus, Loader2, AlertTriangle, Wallet, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFlexibleWalletTokens } from '@/hooks/useFlexibleWalletTokens';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useVincentAuth } from '@/components/auth/VincentAuth';

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

interface TokenOption {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  balance?: string;
  formattedBalance?: string;
  isNative?: boolean;
}

interface UniversalTokenSelectorProps {
  selectedToken: TokenOption | null;
  onTokenSelect: (token: TokenOption) => void;
  sourceChain: number;
  placeholder?: string;
}

const UniversalTokenSelector: React.FC<UniversalTokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  sourceChain,
  placeholder = "Select token to deposit"
}) => {
  const { isAuthenticated } = useVincentAuth();
  const { walletAddress, isConnected } = useWeb3Auth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  
  // Use the flexible wallet tokens hook with the correct wallet address
  const { 
    tokens: walletTokens, 
    loading: tokensLoading, 
    error: tokensError, 
    refetch: refetchTokens,
    addCustomToken: addCustomTokenToWallet,
    hasTokens
  } = useFlexibleWalletTokens(sourceChain, walletAddress || undefined);

  // Format balance display
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.0001) return '< 0.0001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    return num.toFixed(2);
  };

  // Token item component
  const TokenItem: React.FC<{ token: any }> = ({ token }) => {
    const hasBalance = parseFloat(token.formattedBalance) > 0;

    return (
      <button
        onClick={() => {
          const tokenOption: TokenOption = {
            address: token.address,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            logoURI: token.logoURI,
            chainId: token.chainId,
            balance: token.balance,
            formattedBalance: token.formattedBalance,
            isNative: token.isNative,
          };
          onTokenSelect(tokenOption);
          setIsOpen(false);
        }}
        className={`w-full p-3 rounded-lg border transition-all text-left ${
          selectedToken?.address === token.address
            ? 'border-orange-500 bg-orange-500/10'
            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-700/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={token.logoURI || `https://via.placeholder.com/32/6366f1/ffffff?text=${token.symbol.charAt(0)}`}
            alt={token.symbol}
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/32/6366f1/ffffff?text=${token.symbol.charAt(0)}`;
            }}
          />
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">{token.symbol}</div>
                <div className="text-xs text-gray-400">{token.name}</div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${hasBalance ? 'text-green-400' : 'text-gray-500'}`}>
                  {formatBalance(token.formattedBalance)} {token.symbol}
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  };

  const addCustomToken = async () => {
    if (!customTokenAddress || !isAuthenticated) return;

    try {
      const result = await addCustomTokenToWallet(customTokenAddress);
      if (result) {
        setCustomTokenAddress('');
        toast.success(`Added ${result.symbol} token successfully!`);
      } else {
        toast.error('Token not found or has zero balance');
      }
    } catch (error) {
      console.error('Failed to add custom token:', error);
      toast.error('Failed to add custom token. Please check the address.');
    }
  };

  // Filter tokens based on search query
  const filteredTokens = walletTokens.filter(token =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tokens are already sorted by balance in the hook

  if (!isConnected || !walletAddress) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wallet className="h-5 w-5 text-gray-400" />
          <p className="text-gray-400">Connect your Web3 wallet to select tokens</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tokens will be fetched from your connected wallet address
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div>
          <label className="text-sm font-medium text-gray-300">
            Select Token from Your Wallet
            {tokensLoading && (
              <span className="ml-2 text-xs text-blue-400">
                <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                Loading tokens...
              </span>
            )}
          </label>
          <div className="text-xs text-gray-500 mt-0.5">
            From {getChainDisplayName(sourceChain)}
          </div>
        </div>
        {!tokensLoading && (
          <button
            onClick={refetchTokens}
            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        )}
      </div>
      
      {/* Selected Token Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-left hover:border-gray-600 transition-colors"
      >
        <div className="flex items-center justify-between">
          {selectedToken ? (
            <div className="flex items-center gap-3">
              <img
                src={selectedToken.logoURI || `https://via.placeholder.com/32/6366f1/ffffff?text=${selectedToken.symbol.charAt(0)}`}
                alt={selectedToken.symbol}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="text-sm font-medium text-white">{selectedToken.symbol}</div>
                <div className="text-xs text-gray-400">
                  Balance: {formatBalance(selectedToken.formattedBalance || '0')} {selectedToken.symbol}
                </div>
                <div className="text-xs text-gray-500">
                  on {getChainDisplayName(sourceChain)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">{placeholder}</span>
            </div>
          )}
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Add Custom Token */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter token contract address..."
                value={customTokenAddress}
                onChange={(e) => setCustomTokenAddress(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
              />
              <button
                onClick={addCustomToken}
                disabled={!customTokenAddress}
                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-64 overflow-y-auto">
            {tokensLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-blue-400">Loading your tokens...</p>
              </div>
            ) : tokensError ? (
              <div className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-400 mb-2">{tokensError}</p>
                <button
                  onClick={refetchTokens}
                  className="text-xs text-orange-400 hover:text-orange-300"
                >
                  Retry
                </button>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {!hasTokens ? (
                  <div>
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm">No tokens with balance found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tokensError ? 'Error loading tokens. Try refreshing.' : 'Add a custom token above or get some testnet tokens'}
                    </p>
                    {tokensError && (
                      <button
                        onClick={refetchTokens}
                        className="mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">No tokens match your search</p>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredTokens.map((token) => (
                  <TokenItem
                    key={`${token.address}-${token.chainId}`}
                    token={token}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalTokenSelector;