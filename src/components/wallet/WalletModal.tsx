import React from 'react';
import { X, Wallet, AlertCircle, Network } from 'lucide-react';
import { useConnect, useAccount, useNetwork } from 'wagmi';
import { getChainMetadata } from '@/config/chains';
import { isChainDeployed } from '@/config/deployments';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connect, connectors, isLoading, pendingConnector } = useConnect();
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  React.useEffect(() => {
    if (isConnected) {
      onClose();
    }
  }, [isConnected, onClose]);

  if (!isOpen) return null;

  const chainMetadata = chain ? getChainMetadata(chain.id) : null;
  const isDeployed = chain ? isChainDeployed(chain.id) : false;

  const getConnectorIcon = (connectorName: string) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg';
    }
    if (name.includes('walletconnect')) {
      return 'https://registry.walletconnect.com/v2/logo/md/1ae92b26-df02-f0abca-e0a93524a692';
    }
    if (name.includes('coinbase')) {
      return 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4';
    }
    return null;
  };

  const getConnectorDescription = (connectorName: string) => {
    const name = connectorName.toLowerCase();
    if (name.includes('metamask')) {
      return 'Popular browser extension wallet';
    }
    if (name.includes('walletconnect')) {
      return 'Connect with mobile wallets';
    }
    if (name.includes('coinbase')) {
      return 'Coinbase Wallet app';
    }
    if (name.includes('injected')) {
      return 'Browser wallet';
    }
    return 'Connect wallet';
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-backdrop-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container - Centered with min-height trick */}
      <div className="flex min-h-full items-center justify-center p-4 relative">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-in">
          {/* Header */}
          <div className="relative p-6 border-b border-gray-200">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Wallet className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Choose your preferred wallet
                </p>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className={`px-6 py-4 border-b ${
            isDeployed 
              ? 'bg-gradient-to-r from-blue-50 to-primary-50 border-blue-100' 
              : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-100'
          }`}>
            <div className="flex items-start gap-3">
              {isDeployed ? (
                <Network className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${isDeployed ? 'text-blue-900' : 'text-orange-900'}`}>
                  Multi-Chain Support
                </p>
                <p className={`text-xs mt-1 ${isDeployed ? 'text-blue-700' : 'text-orange-700'}`}>
                  {chainMetadata ? (
                    <>
                      Currently on {chainMetadata.icon} {chainMetadata.name}
                      {!isDeployed && ' (contracts not deployed)'}
                    </>
                  ) : (
                    'Connect to any supported network. You can switch networks after connecting.'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Wallet Options */}
          <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {connectors.map((connector) => {
              const isReady = connector.ready;
              const isConnecting = isLoading && pendingConnector?.id === connector.id;
              const icon = getConnectorIcon(connector.name);
              const description = getConnectorDescription(connector.name);

              return (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  disabled={!isReady || isConnecting}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                    isReady
                      ? 'border-gray-200 hover:border-primary-500 hover:shadow-lg hover:scale-[1.02] cursor-pointer active:scale-[0.98]'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  } ${isConnecting ? 'border-primary-500 bg-primary-50 shadow-md' : ''}`}
                >
                  <div className="relative">
                    {icon ? (
                      <img
                        src={icon}
                        alt={connector.name}
                        className="w-12 h-12 rounded-xl"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center ${icon ? 'hidden' : ''}`}>
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    {isConnecting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-xl">
                        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900 text-base">
                      {connector.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {!isReady ? 'Not installed' : description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
                Make sure you trust this site before connecting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
