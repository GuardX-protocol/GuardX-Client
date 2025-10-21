import React from 'react';
import { Network, Info } from 'lucide-react';
import { useNetwork } from 'wagmi';

const NetworkBanner: React.FC = () => {
  const { chain } = useNetwork();

  if (!chain) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-primary-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Multi-Network Support Enabled</p>
            <p className="text-sm text-white/90">
              You can deposit assets from any supported network. Currently on: {chain.name}
            </p>
          </div>
          <Info className="h-5 w-5 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default NetworkBanner;
