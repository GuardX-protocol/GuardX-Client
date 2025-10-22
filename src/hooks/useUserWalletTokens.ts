import { useState, useEffect, useMemo } from 'react';
import { useAccount, useNetwork, useBalance } from 'wagmi';
import { useTokenList } from './useTokenList';
import { useNetworkTokens } from './useNetworkTokens';
import { TokenInfo } from '@uniswap/token-lists';


interface TokenWithBalance extends TokenInfo {
    balance: string;
    formattedBalance: string;
    hasBalance: boolean;
}

export const useUserWalletTokens = () => {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const { tokens: uniswapTokens } = useTokenList();
    const { tokens: networkTokens } = useNetworkTokens();
    const [tokensWithBalance, setTokensWithBalance] = useState<TokenWithBalance[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Get native token balance
    const { data: nativeBalance } = useBalance({
        address,
        enabled: !!address && isConnected,
    });

    // Combine all available tokens (Uniswap + Network specific)
    const allTokens = useMemo(() => {
        const tokenMap = new Map<string, TokenInfo>();

        // Add network-specific tokens first
        networkTokens.forEach(token => {
            if (chain && token.chainId === chain.id) {
                tokenMap.set(token.address.toLowerCase(), token);
            }
        });

        // Add Uniswap tokens (only if not already present)
        uniswapTokens.forEach(token => {
            if (chain && token.chainId === chain.id) {
                const key = token.address.toLowerCase();
                if (!tokenMap.has(key)) {
                    tokenMap.set(key, token);
                }
            }
        });

        // Add common stablecoins and testnet tokens if not present
        const commonTokens = [
            // Stablecoins
            { symbol: 'USDC', name: 'USD Coin' },
            { symbol: 'USDT', name: 'Tether USD' },
            { symbol: 'DAI', name: 'Dai Stablecoin' },
            { symbol: 'BUSD', name: 'Binance USD' },
            // Major tokens
            { symbol: 'WETH', name: 'Wrapped Ether' },
            { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
            { symbol: 'LINK', name: 'Chainlink' },
            { symbol: 'UNI', name: 'Uniswap' },
            { symbol: 'AAVE', name: 'Aave' },
        ];

        // Add missing common tokens with placeholder addresses
        commonTokens.forEach(({ symbol, name }) => {
            const exists = Array.from(tokenMap.values()).some(token =>
                token.symbol.toUpperCase() === symbol.toUpperCase()
            );

            if (!exists && chain) {
                tokenMap.set(`placeholder-${symbol.toLowerCase()}`, {
                    chainId: chain.id,
                    address: `0x${'0'.repeat(40)}`, // Placeholder address
                    symbol,
                    name,
                    decimals: 18,
                    logoURI: undefined,
                });
            }
        });

        return Array.from(tokenMap.values());
    }, [uniswapTokens, networkTokens, chain]);

    // Fetch token balances with debouncing
    useEffect(() => {
        if (!address || !isConnected || !chain) {
            setTokensWithBalance([]);
            setIsLoading(false);
            return;
        }

        // Debounce to prevent excessive API calls
        const timeoutId = setTimeout(() => {
            const fetchBalances = async () => {
                setIsLoading(true);
                
                try {
                    const tokensWithBalanceData: TokenWithBalance[] = [];

                    // Add native token if we have balance data
                    if (nativeBalance && Number(nativeBalance.formatted) > 0) {
                        const nativeToken: TokenWithBalance = {
                            chainId: chain.id,
                            address: '0x0000000000000000000000000000000000000000',
                            symbol: nativeBalance.symbol,
                            name: `Native ${nativeBalance.symbol}`,
                            decimals: nativeBalance.decimals,
                            balance: nativeBalance.value.toString(),
                            formattedBalance: nativeBalance.formatted,
                            hasBalance: true,
                        };
                        tokensWithBalanceData.push(nativeToken);
                    }

                    // For demo purposes, add some tokens with mock balances
                    const mockBalances = [
                        { symbol: 'USDC', balance: '1000.50' },
                        { symbol: 'USDT', balance: '500.25' },
                        { symbol: 'DAI', balance: '750.00' },
                        { symbol: 'WETH', balance: '2.5' },
                        { symbol: 'LINK', balance: '100.0' },
                        { symbol: 'UNI', balance: '50.0' },
                    ];

                    // Limit the number of tokens to prevent performance issues
                    const limitedTokens = allTokens.slice(0, 20);

                    limitedTokens.forEach(token => {
                        // Skip placeholder addresses
                        if (token.address === `0x${'0'.repeat(40)}`) {
                            const mockBalance = mockBalances.find(mb =>
                                mb.symbol.toUpperCase() === token.symbol.toUpperCase()
                            );

                            if (mockBalance) {
                                tokensWithBalanceData.push({
                                    ...token,
                                    balance: mockBalance.balance,
                                    formattedBalance: mockBalance.balance,
                                    hasBalance: true,
                                });
                            }
                            return;
                        }

                        // For real tokens, add them with zero balance
                        tokensWithBalanceData.push({
                            ...token,
                            balance: '0',
                            formattedBalance: '0.0',
                            hasBalance: false,
                        });
                    });

                    // Sort by balance (tokens with balance first, then alphabetically)
                    tokensWithBalanceData.sort((a, b) => {
                        if (a.hasBalance && !b.hasBalance) return -1;
                        if (!a.hasBalance && b.hasBalance) return 1;
                        if (a.hasBalance && b.hasBalance) {
                            return parseFloat(b.formattedBalance) - parseFloat(a.formattedBalance);
                        }
                        return a.symbol.localeCompare(b.symbol);
                    });

                    setTokensWithBalance(tokensWithBalanceData);
                } catch (error) {
                    console.error('Error fetching token balances:', error);
                    setTokensWithBalance([]);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchBalances();
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [address, isConnected, chain?.id, nativeBalance?.formatted]);

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