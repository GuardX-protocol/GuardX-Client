import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useDeposit } from '@/hooks';
import { useWaitForTransaction } from 'wagmi';
import toast from 'react-hot-toast';

const DepositForm: React.FC = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [decimals] = useState(18);

  const { deposit, transaction, isLoading, isSuccess, isError, error } = useDeposit(
    tokenAddress,
    amount,
    decimals
  );

  const { isLoading: isConfirming } = useWaitForTransaction({
    hash: transaction?.hash,
    onSuccess: () => {
      toast.success('Asset deposited successfully!');
      setTokenAddress('');
      setAmount('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposit) {
      toast.error('Please fill in all fields');
      return;
    }
    deposit();
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Deposit Asset</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Token Address</label>
          <input
            type="text"
            className="input"
            placeholder="0x..."
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Amount</label>
          <input
            type="number"
            className="input"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="any"
            min="0"
            required
          />
        </div>

        {isError && error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">
              {(error as any)?.shortMessage || 'Transaction failed'}
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={isLoading || isConfirming}
          disabled={!tokenAddress || !amount || parseFloat(amount) <= 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isConfirming ? 'Confirming...' : 'Deposit Asset'}
        </Button>
      </form>
    </div>
  );
};

export default DepositForm;
