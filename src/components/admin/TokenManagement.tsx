import React, { useState } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract } from 'wagmi';
import { Plus, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContracts } from '@/config/contracts';
import { CrashGuardCoreABI } from '@/config/abis';
import { getCommonTokensForChain } from '@/utils/contractAdmin';

const TokenManagement: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = getContracts(chainId);
  const [customTokenAddress, setCustomTokenAddress] = useState('');

  // Check if current user is contract owner
  const { data: contractOwner } = useReadContract({
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
    functionName: 'owner',
    query: {
      enabled: !!contracts.CrashGuardCore,
    },
  });

  const isOwner = contractOwner && address &&
    typeof contractOwner === 'string' &&
    contractOwner.toLowerCase() === address.toLowerCase();

  // Add token function
  const { writeContract: addToken, isPending: isAdding } = useWriteContract({
    mutation: {
      onSuccess: (data) => {
        toast.success('Token added successfully!');
        console.log('✅ Token added:', data);
      },
      onError: (error) => {
        toast.error(`Failed to add token: ${error.message}`);
        console.error('❌ Add token failed:', error);
      }
    }
  });

  const handleAddToken = (tokenAddress: string) => {
    if (!tokenAddress || !isOwner) return;
    addToken({
      address: contracts.CrashGuardCore as `0x${string}`,
      abi: CrashGuardCoreABI,
      functionName: 'addSupportedToken',
      args: [tokenAddress as `0x${string}`]
    });
  };

  const commonTokens = getCommonTokensForChain(chainId);

  if (!isConnected) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Token Management</h3>
        <p className="text-gray-600">Connect wallet to manage supported tokens</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Management</h3>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Owner Access Required</p>
              <p className="text-xs text-amber-700 mt-1">
                Only the contract owner can add supported tokens.
              </p>
              <p className="text-xs text-amber-700 mt-2">
                <span className="font-medium">Contract Owner:</span> {contractOwner && typeof contractOwner === 'string' ?
                  `${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}` :
                  'Loading...'
                }
              </p>
              <p className="text-xs text-amber-700">
                <span className="font-medium">Your Address:</span> {address ?
                  `${address.slice(0, 6)}...${address.slice(-4)}` :
                  'Not connected'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Token Management</h3>
        <p className="text-sm text-gray-600 mt-1">Add tokens to the supported list</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Owner Status */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">
              You are the contract owner and can add supported tokens
            </p>
          </div>
        </div>

        {/* Common Tokens */}
        {Object.keys(commonTokens).length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Common Tokens</h4>
            <div className="space-y-2">
              {Object.entries(commonTokens).map(([symbol, address]) => (
                <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{symbol}</p>
                    <p className="text-xs text-gray-600 font-mono">
                      {(address as string).slice(0, 6)}...{(address as string).slice(-4)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(address as string)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAddToken(address as string)}
                      disabled={isAdding}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Token */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add Custom Token</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={customTokenAddress}
              onChange={(e) => setCustomTokenAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                handleAddToken(customTokenAddress);
                setCustomTokenAddress('');
              }}
              disabled={!customTokenAddress || isAdding}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Token</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-medium">Note:</span> After adding tokens, users will be able to deposit them.
            Make sure the token contract is legitimate and has proper decimals/symbol information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TokenManagement;