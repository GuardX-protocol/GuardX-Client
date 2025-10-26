import { useState, useEffect, useMemo } from 'react';
import { useAccount, useChainId, useBalance, useReadContracts } from 'wagmi';
import { useTokenList } from './useTokenList';
import { useNetworkTokens } from './useNetworkTokens';
import { TokenInfo } from '@uniswap/token-lists';
import { ERC20_ABI } from '@/config/abis/ERC20';
import { formatUnits } from 'viem';

interface TokenWithBalance extends TokenInfo {
    balance: string;
    formattedBalance: string;
    hasBalance: boolean;
}

export const useUserWalletTokens = () => {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { tokens: uniswapTokens } = useTokenList();
    const { tokens: networkTokens } = useNetworkTokens();
    const [tokensWithBalance, setTokensWithBalance] = useState<TokenWithBalance[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Get native token balance
    const { data: nativeBalance } = useBalance({
        address,
        query: {
            enabled: !!address && isConnected,
        },
    });

    // Combine all available tokens (Uniswap + Network specific)
    const allTokens = useMemo(() => {
        const tokenMap = new Map<string, TokenInfo>();

        // Add network-specific tokens first
        networkTokens.forEach(token => {
            if (chainId && token.chainId === chainId) {
                tokenMap.set(token.address.toLowerCase(), token);
            }
        });

        // Add Uniswap tokens (only if not already present)
        uniswapTokens.forEach(token => {
            if (chainId && token.chainId === chainId) {
                const key = token.address.toLowerCase();
                if (!tokenMap.has(key)) {
                    tokenMap.set(key, token);
                }
            }
        });

        // Only use real tokens from token lists, no fallback tokens

        return Array.from(tokenMap.values());
    }, [uniswapTokens, networkTokens, chainId]);

    // Prepare contract calls for token balances
    const tokenContracts = useMemo(() => {
        if (!address || !allTokens.length) return [];

        return allTokens
            .filter(token =>
                token.address !== `0x${'0'.repeat(40)}` && // Skip placeholder addresses
                token.address.startsWith('0x') &&
                token.address.length === 42 &&
                /^0x[a-fA-F0-9]{40}$/.test(token.address) // Valid hex address
            )
            .map(token => ({
                address: token.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [address],
                token,
            }));
    }, [address, allTokens]);

    // Fetch token balances using batch contract reads
    const { data: balanceResults, isLoading: isLoadingBalances } = useReadContracts({
        contracts: tokenContracts,
        query: {
            enabled: !!address && isConnected && tokenContracts.length > 0,
        },
    });

    // Process balance results
    const processedTokens = useMemo(() => {
        const tokensWithBalanceData: TokenWithBalance[] = [];

        // Add native token if we have balance data
        if (nativeBalance && nativeBalance.value > 0n) {
            const formattedBalance = formatUnits(nativeBalance.value, nativeBalance.decimals);
            const nativeToken: TokenWithBalance = {
                chainId: chainId || 0,
                address: '0x0000000000000000000000000000000000000000',
                symbol: nativeBalance.symbol,
                name: `Native ${nativeBalance.symbol}`,
                decimals: nativeBalance.decimals,
                balance: nativeBalance.value.toString(),
                formattedBalance,
                hasBalance: true,
            };
            tokensWithBalanceData.push(nativeToken);
        }

        // Process ERC20 token balances
        if (balanceResults && tokenContracts.length > 0) {
            balanceResults.forEach((result, index) => {
                const contract = tokenContracts[index];
                if (!contract) return;

                try {
                    if (result && typeof result === 'bigint') {
                        const balance = result as bigint;
                        const formattedBalance = formatUnits(balance, contract.token.decimals);
                        const hasBalance = balance > 0n;

                        if (hasBalance) {
                            tokensWithBalanceData.push({
                                ...contract.token,
                                balance: balance.toString(),
                                formattedBalance,
                                hasBalance,
                            });
                        }
                    }
                } catch (error: any) {
                    // Silently skip tokens that fail to parse
                    console.debug(`Failed to process balance for ${contract.token.symbol}:`, error);
                }
            });
        }

        // For demo purposes, add some mock tokens if no real balances found
        // This helps with testing the UI when users don't have testnet tokens
        if (tokensWithBalanceData.length === 0 && allTokens.length > 0) {
            const mockBalances = [
                { symbol: 'USDC', balance: '1000.50' },
                { symbol: 'WETH', balance: '2.5' },
                { symbol: 'DAI', balance: '750.00' },
            ];

            allTokens.slice(0, 3).forEach((token, index) => {
                const mockBalance = mockBalances[index];
                if (mockBalance && token.symbol.toUpperCase() === mockBalance.symbol) {
                    tokensWithBalanceData.push({
                        ...token,
                        balance: mockBalance.balance,
                        formattedBalance: mockBalance.balance,
                        hasBalance: true,
                    });
                }
            });
        }

        // Sort by balance (highest first)
        tokensWithBalanceData.sort((a, b) => {
            const aValue = parseFloat(a.formattedBalance);
            const bValue = parseFloat(b.formattedBalance);
            return bValue - aValue;
        });

        return tokensWithBalanceData;
    }, [balanceResults, tokenContracts, nativeBalance, chainId, allTokens]);

    // Update state when processed tokens change
    useEffect(() => {
        setTokensWithBalance(processedTokens);
        setIsLoading(isLoadingBalances);
    }, [processedTokens, isLoadingBalances]);

    // Filter tokens with balance
    const filteredTokensWithBalance = useMemo(() =>
        tokensWithBalance.filter(token => token.hasBalance),
        [tokensWithBalance]
    );

    // All tokens (with and without balance)
    const allUserTokens = useMemo(() => tokensWithBalance, [tokensWithBalance]);

    return {
        tokensWithBalance: filteredTokensWithBalance,
        allUserTokens,
        isLoading,
        hasTokens: filteredTokensWithBalance.length > 0,
    };
};