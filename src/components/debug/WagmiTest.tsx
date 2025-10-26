import React from 'react';
import { useNetwork } from 'wagmi';

const WagmiTest: React.FC = () => {
  try {
    const { chain } = useNetwork();
    
    return (
      <div className="fixed bottom-4 left-4 bg-green-500 text-white p-2 rounded text-xs">
        Wagmi OK: {chain?.name || 'No chain'}
      </div>
    );
  } catch (error) {
    return (
      <div className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded text-xs">
        Wagmi Error: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
};

export default WagmiTest;