import React from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { AlertTriangle } from 'lucide-react';
import { isSupportedChain, getChainMetadata, DEFAULT_CHAIN } from '@/config/chains';
import { isChainDeployed } from '@/config/deployments';

const UnsupportedNetworkBanner: React.FC = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  if (!chain) return null;

  const isSupported = isSupportedChain(chain.id);
  const isDeployed = isChainDeployed(chain.id);
  const metadata = getChainMetadata(chain.id);

  // Show banner if chain is not supported or contracts not deployed
  if (isSupported && isDeployed) return null;

  const handleSwitch = () => {
    if (switchNetwork) {
      switchNetwork(DEFAULT_CHAIN.id);
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-orange-900 mb-1">
            {!isSupported ? 'Unsupported Network' : 'Contracts Not Deployed'}
          </h3>
          <p className="text-sm text-orange-800 mb-3">
            {!isSupported ? (
              <>
                You're connected to <strong>{metadata.name}</strong> which is not supported by GuardX.
                Please switch to a supported network to use the platform.
              </>
            ) : (
              <>
                GuardX contracts are not yet deployed on <strong>{metadata.name}</strong>.
                Please switch to {getChainMetadata(DEFAULT_CHAIN.id).name} to use the platform.
              </>
            )}
          </p>
          {switchNetwork && (
            <button
              onClick={handleSwitch}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Switch to {getChainMetadata(DEFAULT_CHAIN.id).name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnsupportedNetworkBanner;
