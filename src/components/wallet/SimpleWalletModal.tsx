import React from 'react';
import { X, Wallet, Shield, Zap } from 'lucide-react';
import { useConnect, useAccount } from 'wagmi';
import { useWalletModal } from '@/hooks/useWalletModal';
import toast from 'react-hot-toast';

interface SimpleWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleWalletModal: React.FC<SimpleWalletModalProps> = ({ isOpen, onClose }) => {
  const { setLastConnectedWallet } = useWalletModal();
  const { connect, connectors, isLoading, pendingConnector } = useConnect({
    onSuccess: (data) => {
      toast.success(`🚀 Connected to ${data.connector?.name}`, {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
        },
      });
      setLastConnectedWallet(data.connector?.id || '');
      onClose();
    },
    onError: (error) => {
      toast.error(`❌ Connection failed: ${error.message}`, {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
        },
      });
    }
  });
  const { isConnected } = useAccount();

  React.useEffect(() => {
    if (isConnected) {
      onClose();
    }
  }, [isConnected, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] overflow-y-auto" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="flex min-h-full items-center justify-center p-4 relative">
        <div className="relative bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 scale-100 border border-gray-800">
          <div className="relative bg-black p-8 text-white border-b border-gray-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-xl transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Connect Wallet</h2>
                <p className="text-gray-400 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Secure wallet connection
                </p>
              </div>
            </div>
          </div>
          <div className="relative p-8 space-y-4">
            {connectors.map((connector) => {
              const getConnectorIcon = (name: string) => {
                if (name.toLowerCase().includes('metamask')) return '🦊';
                if (name.toLowerCase().includes('walletconnect')) return '🔗';
                if (name.toLowerCase().includes('coinbase')) return '🔵';
                return '👛';
              };

              const getConnectorDescription = (name: string) => {
                if (name.toLowerCase().includes('metamask')) return 'Browser extension wallet';
                if (name.toLowerCase().includes('walletconnect')) return 'Mobile & desktop wallets';
                if (name.toLowerCase().includes('coinbase')) return 'Coinbase Wallet';
                return 'Browser wallet';
              };

              return (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  disabled={!connector.ready || isLoading}
                  className="w-full group relative overflow-hidden rounded-2xl transition-all duration-300 bg-black hover:bg-gray-800 border border-gray-800 hover:border-gray-700 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center gap-6 p-6">
                    <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                      {getConnectorIcon(connector.name)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-white text-xl transition-colors duration-300">
                        {connector.name}
                      </p>
                      <p className="text-sm text-gray-400 mt-1 transition-colors">
                        {!connector.ready ? '❌ Not installed' : `✨ ${getConnectorDescription(connector.name)}`}
                      </p>
                    </div>
                    {isLoading && pendingConnector?.id === connector.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-white text-sm font-medium">Connecting...</span>
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full">
                          <Zap className="h-4 w-4" />
                          <span className="text-sm font-medium">Connect</span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="relative px-8 py-6 bg-black border-t border-gray-800">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-white" />
                <span>Secure Connection</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-white" />
                <span>Your Keys, Your Crypto</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleWalletModal;