import React, { useState } from 'react';
import { ArrowUp, Wallet } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWithdraw, usePortfolioData } from '@/hooks';
import { formatUnits } from 'viem';
import { TokenInfo } from '@uniswap/token-lists';

interface WithdrawFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount();
  const { portfolio } = usePortfolioData(address);
  const { withdrawToken, isLoading } = useWithdraw();
  
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const portfolioData = portfolio as any;
  const assets = portfolioData?.assets || portfolioData?.[0] || [];

  const handleWithdraw = () => {
    if (!selectedAsset || !amount) return;
    withdrawToken(selectedAsset.token, amount, selectedAsset.decimals || 18);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-100">Withdraw Assets</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Asset
            </label>
            <select
              value={selectedAsset?.token || ''}
              onChange={(e) => {
                const asset = assets.find((a: any) => a.token === e.target.value);
                setSelectedAsset(asset);
              }}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
            >
              <option value="">Choose asset to withdraw</option>
              {assets.map((asset: any, index: number) => (
                <option key={index} value={asset.token}>
                  {asset.symbol || `Asset ${index + 1}`} - {formatUnits(asset.balance || 0n, asset.decimals || 18)}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          {selectedAsset && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-gray-100"
                max={formatUnits(selectedAsset.balance || 0n, selectedAsset.decimals || 18)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Available: {formatUnits(selectedAsset.balance || 0n, selectedAsset.decimals || 18)}
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleWithdraw}
            disabled={!selectedAsset || !amount || isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
            {isLoading ? 'Processing...' : 'Withdraw'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawForm;