import { useState, useEffect, useCallback } from 'react';
import { useAccount, useNetwork, usePublicClient } from 'wagmi';
import { getContracts } from '@/config/contracts';
import { formatUnits } from 'viem';

export interface Transaction {
  id: `0x${string}`;
  type: 'deposit' | 'withdraw' | 'emergency';
  token: string;
  tokenAddress: string;
  amount: string;
  value: string;
  hash: `0x${string}`;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  gasUsed: string;
  gasPrice: string;
  blockNumber: number;
}

const useContractTransactions = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const contracts = getContracts(chain?.id) || {};
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Early return if not connected or no address
  const isConnected = !!address && !!chain && !!publicClient;

  const getTokenSymbol = (tokenAddress: string) => {
    const addr = tokenAddress?.toLowerCase();
    if (addr === '0x0000000000000000000000000000000000000000') return 'ETH';
    if (addr === '0x4200000000000000000000000000000000000006') return 'WETH';
    if (addr === '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'.toLowerCase()) return 'USDC';
    if (addr === '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'.toLowerCase()) return 'USDT';
    return 'TOKEN';
  };

  const getTokenDecimals = (tokenAddress: string) => {
    const symbol = getTokenSymbol(tokenAddress);
    return symbol === 'USDC' || symbol === 'USDT' ? 6 : 18;
  };

  const fetchTransactions = useCallback(async () => {
    if (!address || !publicClient) {
      return;
    }

    if (!contracts || !contracts.CrashGuardCore) {
      console.log('CrashGuardCore contract not available on this network');
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - BigInt(10000); // Last ~10k blocks

      // Fetch deposit events
      const depositLogs = await publicClient.getLogs({
        address: contracts.CrashGuardCore as `0x${string}`,
        event: {
          type: 'event',
          name: 'AssetDeposited',
          inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'token', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'timestamp', type: 'uint256', indexed: false },
          ],
        },
        args: {
          user: address,
        },
        fromBlock,
        toBlock: 'latest',
      });

      // Fetch withdrawal events
      const withdrawLogs = await publicClient.getLogs({
        address: contracts.CrashGuardCore as `0x${string}`,
        event: {
          type: 'event',
          name: 'AssetWithdrawn',
          inputs: [
            { name: 'user', type: 'address', indexed: true },
            { name: 'token', type: 'address', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'timestamp', type: 'uint256', indexed: false },
          ],
        },
        args: {
          user: address,
        },
        fromBlock,
        toBlock: 'latest',
      });

      // Process and combine logs
      const allLogs = [
        ...depositLogs.map(log => ({ ...log, type: 'deposit' as const })),
        ...withdrawLogs.map(log => ({ ...log, type: 'withdraw' as const })),
      ];

      // Get transaction receipts for gas information
      const transactionsWithDetails: Transaction[] = [];
      
      for (const log of allLogs) {
        try {
          const receipt = await publicClient.getTransactionReceipt({
            hash: log.transactionHash,
          });
          
          const transaction = await publicClient.getTransaction({
            hash: log.transactionHash,
          });

          const tokenAddress = log.args.token as string;
          const amount = log.args.amount as bigint;
          const timestamp = log.args.timestamp as bigint;
          
          const symbol = getTokenSymbol(tokenAddress);
          const decimals = getTokenDecimals(tokenAddress);
          const formattedAmount = formatUnits(amount, decimals);

          const tx: Transaction = {
            id: log.transactionHash,
            type: log.type as 'deposit' | 'withdraw',
            token: symbol,
            tokenAddress,
            amount: formattedAmount,
            value: `$${(parseFloat(formattedAmount) * (symbol === 'ETH' ? 2500 : symbol === 'USDC' || symbol === 'USDT' ? 1 : 1800)).toFixed(2)}`, // Mock USD values
            hash: log.transactionHash,
            timestamp: new Date(Number(timestamp) * 1000).toISOString(),
            status: receipt.status === 'success' ? 'confirmed' : 'failed',
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: transaction.gasPrice?.toString() || '0',
            blockNumber: Number(receipt.blockNumber),
          };
          
          transactionsWithDetails.push(tx);
        } catch (error) {
          console.error('Error processing transaction:', error);
        }
      }
      
      const sortedTransactions = transactionsWithDetails
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setTransactions(sortedTransactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setError(error?.message || 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, publicClient, contracts, chain]);

  useEffect(() => {
    if (isConnected && contracts && contracts.CrashGuardCore) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setIsLoading(false);
      if (!isConnected) {
        setError(null);
      } else if (!contracts.CrashGuardCore) {
        setError('Contract not deployed on this network');
      }
    }
  }, [fetchTransactions, isConnected, contracts]);

  return {
    transactions,
    isLoading,
    error,
    isConnected,
    hasContract: !!(contracts && contracts.CrashGuardCore),
    refetch: fetchTransactions,
  };
};

export { useContractTransactions };
export default useContractTransactions;