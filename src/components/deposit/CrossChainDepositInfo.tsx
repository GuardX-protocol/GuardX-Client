import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { getChainName } from '@/utils/crossChain';

interface CrossChainDepositInfoProps {
  fromChain: number;
  toChain: number;
  isVincentAuthenticated: boolean;
  tokenSymbol: string;
  amount: string;
}

const CrossChainDepositInfo: React.FC<CrossChainDepositInfoProps> = ({
  fromChain,
  toChain,
  isVincentAuthenticated,
  tokenSymbol,
  amount,
}) => {
  return (
    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-blue-400 mb-2">
            Cross-Chain Deposit
          </h4>
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-2">
            <span>{getChainName(fromChain)}</span>
            <ArrowRight className="h-4 w-4" />
            <span>{getChainName(toChain)}</span>
          </div>
          <p className="text-xs text-blue-300/80">
            {isVincentAuthenticated ? (
              <>
                Vincent will bridge {amount || '0'} {tokenSymbol} from {getChainName(fromChain)} to {getChainName(toChain)} and deposit into the vault.
                This process typically takes 5-10 minutes.
              </>
            ) : (
              <>
                Connect Vincent to enable cross-chain deposits. Vincent handles bridging and depositing in one transaction.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrossChainDepositInfo;
