import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SupportedToken } from '@/config/vault';

interface TokenSelectorWithBalancesProps {
  tokens: readonly SupportedToken[];
  selectedToken: SupportedToken;
  onTokenSelect: (token: SupportedToken) => void;
  mode: 'deposit' | 'withdraw';
  currentChain: number;
}

const TokenSelectorWithBalances: React.FC<TokenSelectorWithBalancesProps> = ({
  tokens,
  selectedToken,
  onTokenSelect,
  mode,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-3">
        Select Token
      </label>
      
      {/* Selected Token Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white hover:border-red-500 focus:border-red-500 focus:outline-none transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          {selectedToken.logoURI && (
            <img 
              src={selectedToken.logoURI} 
              alt={selectedToken.symbol}
              className="w-6 h-6 rounded-full"
            />
          )}
          <div className="text-left">
            <div className="font-medium">{selectedToken.symbol}</div>
            <div className="text-xs text-gray-400">{selectedToken.name}</div>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            {tokens.map((token) => (
              <button
                key={token.address}
                onClick={() => {
                  onTokenSelect(token);
                  setIsOpen(false);
                }}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800 transition-colors ${
                  selectedToken.address === token.address ? 'bg-gray-800' : ''
                }`}
              >
                {token.logoURI && (
                  <img 
                    src={token.logoURI} 
                    alt={token.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <div className="flex-1 text-left">
                  <div className="font-medium text-white">{token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                </div>
                {selectedToken.address === token.address && (
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TokenSelectorWithBalances;
