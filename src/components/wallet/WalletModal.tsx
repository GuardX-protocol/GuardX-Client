import React from 'react';
import { X, Wallet, AlertCircle, Network, Shield, Zap, CheckCircle } from 'lucide-react';
import { useConnect, useAccount, useNetwork } from 'wagmi';
import { getChainMetadata } from '@/config/chains';
import { isChainDeployed } from '@/config/deployments';
import toast from 'react-hot-toast';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connect, connectors, isLoading, pendingConnector } = useConnect({
    onSuccess: (data) => {
      console.log('✅ Wallet connected:', {
        address: data.account,
        connector: data.connector?.name,
        chainId: data.chain?.id,
        timestamp: new Date().toISOString()
      });
      toast.success(`Connected to ${data.connector?.name}`);
      onClose();
    },
    onError: (error) => {
      console.error('❌ Wallet connection failed:', error);
      toast.error(`Connection failed: ${error.message}`);
    }
  });
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
    <div className="fixed inset-0 z-[99999] overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 relative">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Connect Wallet</h2>
                <p className="text-blue-100 mt-1">
                  Secure • Fast • Decentralized
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="p-2 bg-green-100 rounded-xl w-fit mx-auto mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">Secure</p>
              </div>
              <div className="text-center">
                <div className="p-2 bg-blue-100 rounded-xl w-fit mx-auto mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">Fast</p>
              </div>
              <div className="text-center">
                <div className="p-2 bg-purple-100 rounded-xl w-fit mx-auto mb-2">
                  <Network className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-xs font-medium text-gray-700">Multi-Chain</p>
              </div>
            </div>
          </div>

          {/* Network Status */}
          {chainMetadata && (
            <div className={`px-6 py-4 border-b ${
              isDeployed 
                ? 'bg-green-50 border-green-100' 
                : 'bg-amber-50 border-amber-100'
            }`}>
              <div className="flex items-center gap-3">
                {isDeployed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <div>
                  <p className={`text-sm font-medium ${isDeployed ? 'text-green-900' : 'text-amber-900'}`}>
                    {chainMetadata.icon} {chainMetadata.name}
                  </p>
                  <p className={`text-xs ${isDeployed ? 'text-green-700' : 'text-amber-700'}`}>
                    {isDeployed ? 'Contracts deployed' : 'Limited functionality'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Options */}
          <div className="p-6 space-y-3">
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
                  className={`w-full group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                    isReady
                      ? 'border-gray-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  } ${isConnecting ? 'border-blue-500 bg-blue-50 shadow-lg' : ''}`}
                >
                  <div className="flex items-center gap-4 p-5">
                    <div className="relative">
                      {icon ? (
                        <img
                          src={icon}
                          alt={connector.name}
                          className="w-14 h-14 rounded-2xl shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-sm ${icon ? 'hidden' : ''}`}>
                        <Wallet className="h-7 w-7 text-white" />
                      </div>
                      {isConnecting && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                        {connector.name}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {!isReady ? 'Not installed' : description}
                      </p>
                    </div>
                    {isReady && !isConnecting && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t">
            <p className="text-xs text-gray-600 text-center">
              Secure connection • Your keys, your crypto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
