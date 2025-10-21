import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import TokenSelector from './TokenSelector';
import { TokenConfig } from '@/config/tokens';
import { useDeposit } from '@/hooks';
import { useTokenBalance, useTokenAllowance } from '@/hooks/useTokenBalance';
import { useTokenApproval } from '@/hooks/useTokenApproval';
import { useWaitForTransaction, useAccount } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { usePythPrice } from '@/hooks/usePythPrice';
import toast from 'react-hot-toast';
import { parseUnits } from 'viem';

const EnhancedDepositForm: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<TokenConfig | null>(null);
  const [amount, setAmount] = useState('');
  const [needsApproval, setNeedsApproval] = useState(false);
  const { address: userAddress } = useAccount();

  const { formattedBalance } = useTokenBalance(
    selectedToken?.address || '',
    selectedToken?.decimals || 18
  );

  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    selectedToken?.address || '',
    CONTRACTS.CrashGuardCore
  );

  const { approve, transaction: approvalTx, isLoading: isApproving, isSuccess: approvalSuccess } = useTokenApproval(
    selectedToken?.address || '',
    CONTRACTS.CrashGuardCore,
    amount,
    selectedToken?.decimals || 18
  );

  const { isLoading: isApprovingConfirm } = useWaitForTransaction({
    hash: approvalTx?.hash,
    onSuccess: () => {
      toast.dismiss('approval');
      toast.success('Token approved! You can now deposit.');
      refetchAllowance();
    },
    onError: (error) => {
      toast.dismiss('approval');
      toast.error('Approval failed: ' + error.message);
    },
  });

  const { deposit, transaction, isLoading: isDepositing } = useDeposit(
    selectedToken?.address || '',
    amount,
    selectedToken?.decimals || 18
  );

  const { isLoading: isConfirming } = useWaitForTransaction({
    hash: transaction?.hash,
    onSuccess: () => {
      toast.dismiss('deposit');
      toast.success('Asset deposited successfully! 🎉');
      setAmount('');
      setSelectedToken(null);
      refetchAllowance();
    },
    onError: (error) => {
      toast.dismiss('deposit');
      toast.error('Deposit failed: ' + error.message);
    },
  });

  const { priceData } = usePythPrice(selectedToken?.pythPriceId);

  // Check if approval is needed
  useEffect(() => {
    if (!selectedToken || !amount || !allowance) {
      setNeedsApproval(false);
      return;
    }

    try {
      const amountBigInt = parseUnits(amount, selectedToken.decimals);
      setNeedsApproval(allowance < amountBigInt);
    } catch {
      setNeedsApproval(false);
    }
  }, [amount, allowance, selectedToken]);

  // Refetch allowance after approval
  useEffect(() => {
    if (approvalSuccess) {
      refetchAllowance();
    }
  }, [approvalSuccess, refetchAllowance]);

  const handleMaxClick = () => {
    setAmount(formattedBalance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedToken || !amount || !userAddress) {
      toast.error('Please select a token and enter an amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(formattedBalance)) {
      toast.error('Insufficient balance');
      return;
    }

    if (needsApproval) {
      if (approve) {
        toast.loading('Approving token...', { id: 'approval' });
        approve();
      }
    } else {
      if (deposit) {
        toast.loading('Depositing asset...', { id: 'deposit' });
        deposit();
      }
    }
  };

  const estimatedValue = priceData && amount
    ? (parseFloat(amount) * parseFloat(priceData.formattedPrice)).toFixed(2)
    : '0.00';

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <ArrowDownCircle className="h-6 w-6 text-primary-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Deposit Assets</h2>
          <p className="text-sm text-gray-500">Add tokens to your protected portfolio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <TokenSelector
          selectedToken={selectedToken}
          onSelect={setSelectedToken}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label">Amount</label>
            {selectedToken && (
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                Balance: {formattedBalance} {selectedToken.symbol}
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              className="input pr-20"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="any"
              min="0"
              required
            />
            {selectedToken && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {selectedToken.logoUri && (
                  <img
                    src={selectedToken.logoUri}
                    alt={selectedToken.symbol}
                    className="w-5 h-5 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {selectedToken.symbol}
                </span>
              </div>
            )}
          </div>
        </div>

        {priceData && amount && parseFloat(amount) > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Estimated Value</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  ${estimatedValue}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Current price: ${priceData.formattedPrice} per {selectedToken?.symbol}
                </p>
              </div>
            </div>
          </div>
        )}

        {needsApproval && (
          <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning-900">Approval Required</p>
                <p className="text-xs text-warning-700 mt-1">
                  You need to approve the contract to spend your {selectedToken?.symbol}
                </p>
              </div>
            </div>
          </div>
        )}

        {approvalSuccess && !needsApproval && (
          <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success-600" />
              <p className="text-sm font-medium text-success-900">
                Approval successful! You can now deposit.
              </p>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-6 py-3 text-base bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            isApproving || isApprovingConfirm || isDepositing || isConfirming ? 'cursor-wait' : ''
          }`}
          disabled={!selectedToken || !amount || parseFloat(amount) <= 0 || isApproving || isApprovingConfirm || isDepositing || isConfirming}
        >
          {(isApproving || isApprovingConfirm || isDepositing || isConfirming) && (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          )}
          {needsApproval ? (
            <>
              {!(isApproving || isApprovingConfirm) && <CheckCircle className="h-5 w-5 mr-2" />}
              {isApproving || isApprovingConfirm ? 'Approving...' : `Approve ${selectedToken?.symbol}`}
            </>
          ) : (
            <>
              {!(isDepositing || isConfirming) && <ArrowDownCircle className="h-5 w-5 mr-2" />}
              {isConfirming || isDepositing ? 'Depositing...' : `Deposit ${selectedToken?.symbol || 'Asset'}`}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EnhancedDepositForm;
