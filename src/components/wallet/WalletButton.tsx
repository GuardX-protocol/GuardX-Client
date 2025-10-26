import React, { useState } from 'react';
import { Wallet, ChevronDown, Copy, Power, Shield } from 'lucide-react';
import { useAccount, useDisconnect, useBalance, useChainId, useConnect } from 'wagmi';
import { formatAddress } from '@/utils/format';
import { getChainMetadata } from '@/config/chains';
import { isChainDeployed } from '@/config/deployments';
import toast from 'react-hot-toast';

const WalletButton: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: balance } = useBalance({ address });
  const { connect, connectors, isPending } = useConnect();

  const chainMetadata = chainId ? getChainMetadata(chainId) : null;
  const isDeployed = chainId ? isChainDeployed(chainId) : false;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
    toast.success('Wallet disconnected');
  };

  const handleConnect = (connectorToUse: any) => {
    connect({ connector: connectorToUse });
    setShowConnectModal(false);
  };

  const getConnectorIcon = (connectorName: string) => {
    if (connectorName.toLowerCase().includes('metamask')) return '🦊';
    if (connectorName.toLowerCase().includes('walletconnect')) return '🔗';
    if (connectorName.toLowerCase().includes('coinbase')) return '🔵';
    if (connectorName.toLowerCase().includes('rainbow')) return '🌈';
    return '👛';
  };

  if (!isConnected) {
    return (
      <>
        <button
          onClick={() => setShowConnectModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all font-medium shadow-lg hover:shadow-xl"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </button>

        {/* Clean Connect Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30">
                    <Wallet className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Connect Wallet</h3>
                    <p className="text-gray-400 text-sm">Choose your preferred wallet</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {connectors.filter(c => c.ready).map((connectorOption) => (
                  <button
                    key={connectorOption.id}
                    onClick={() => handleConnect(connectorOption)}
                    disabled={isPending}
                    className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all disabled:opacity-50"
                  >
                    <span className="text-2xl">{getConnectorIcon(connectorOption.name)}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{connectorOption.name}</div>
                      <div className="text-sm text-gray-400">
                        {isPending ? 'Connecting...' : 'Available'}
                      </div>
                    </div>
                    {isPending && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-cyan-400 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-white mb-1">Secure & Private</div>
                    <div className="text-xs text-gray-400">
                      Your keys remain in your wallet. We never store or access your private information.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl hover:border-cyan-500/50 transition-all backdrop-blur-sm"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
          <Wallet className="h-4 w-4 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs text-gray-400">{connector?.name}</p>
          <p className="text-sm font-medium text-white">
            {formatAddress(address || '', 4)}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Clean Dropdown */}
      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl z-[70] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{connector?.name}</p>
                    <p className="text-xs text-gray-400 font-mono">
                      {formatAddress(address || '', 6)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                  title="Disconnect"
                >
                  <Power className="h-4 w-4" />
                </button>
              </div>

              {/* Network Status */}
              {chainMetadata && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  isDeployed 
                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                    : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isDeployed ? 'bg-green-400 animate-pulse' : 'bg-orange-400'
                  }`} />
                  <span className="text-sm">{chainMetadata.icon}</span>
                  <span className="text-xs font-medium flex-1">{chainMetadata.name}</span>
                  {!isDeployed && <span className="text-xs">Not supported</span>}
                </div>
              )}
            </div>

            {/* Balance */}
            {balance && (
              <div className="p-4 border-b border-gray-700/50">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Wallet Balance</p>
                  <p className="text-lg font-bold text-white">
                    {Number(balance.value) / Math.pow(10, balance.decimals)} {balance.symbol}
                  </p>
                  {chainMetadata && (
                    <p className="text-xs text-gray-400 mt-1">
                      on {chainMetadata.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="p-4 space-y-2">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                <Copy className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-white">
                  {copied ? 'Copied!' : 'Copy Address'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletButton;
