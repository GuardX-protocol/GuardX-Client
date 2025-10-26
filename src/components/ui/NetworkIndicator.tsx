import React from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { getChainMetadata, isSupportedChain } from '@/config/chains';
import { isChainDeployed } from '@/config/deployments';
import { SUPPORTED_CHAINS } from '@/config/chains';

const NetworkIndicator: React.FC = () => {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = React.useState(false);

  if (!chain) {
    return null;
  }

  const metadata = getChainMetadata(chain.id);
  const isSupported = isSupportedChain(chain.id);
  const isDeployed = isChainDeployed(chain.id);

  const handleSwitchNetwork = (chainId: number) => {
    if (switchChain) {
      switchChain({ chainId });
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all hover:shadow-md ${metadata.color}`}
      >
        {isSupported && isDeployed ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <span className="font-medium">{metadata.icon} {metadata.shortName}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {!isDeployed && isSupported && (
        <div className="absolute top-full mt-1 left-0 right-0 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200 z-[55]">
          Contracts not deployed
        </div>
      )}

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-[60]" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] z-[70]">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Switch Network
            </div>
            {SUPPORTED_CHAINS.map((supportedChain) => {
              const chainMeta = getChainMetadata(supportedChain.id);
              const deployed = isChainDeployed(supportedChain.id);
              const isCurrent = chain.id === supportedChain.id;

              return (
                <button
                  key={supportedChain.id}
                  onClick={() => handleSwitchNetwork(supportedChain.id)}
                  disabled={!deployed || isCurrent}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between gap-2 transition-colors ${
                    isCurrent ? 'bg-red-50 text-red-700' : ''
                  } ${!deployed ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <span>{chainMeta.icon}</span>
                    <span className="font-medium">{chainMeta.name}</span>
                  </span>
                  {isCurrent && <CheckCircle className="h-4 w-4 text-red-600" />}
                  {!deployed && <span className="text-xs text-gray-400">(Not deployed)</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default NetworkIndicator;
