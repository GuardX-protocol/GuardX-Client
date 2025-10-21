import { useContractWrite, usePrepareContractWrite, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS } from '@/config/contracts';
import { DEXAggregatorABI } from '@/config/abis';

export const useDEXSwap = (
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    decimalsIn: number,
    slippageTolerance: number = 0.5 // 0.5% default slippage
) => {
    const { address: userAddress } = useAccount();

    // Calculate deadline (10 minutes from now)
    const deadline = Math.floor(Date.now() / 1000) + 600;

    // Calculate max slippage in basis points (0.5% = 50 basis points)
    const maxSlippage = BigInt(Math.floor(slippageTolerance * 100));

    const { config } = usePrepareContractWrite({
        address: CONTRACTS.DEXAggregator as `0x${string}`,
        abi: DEXAggregatorABI,
        functionName: 'swapTokens',
        args: [
            tokenIn as `0x${string}`,
            tokenOut as `0x${string}`,
            parseUnits(amountIn || '0', decimalsIn),
            maxSlippage,
            BigInt(deadline),
        ],
        enabled: !!tokenIn && !!tokenOut && !!amountIn && parseFloat(amountIn) > 0 && !!userAddress,
    });

    const { write, data, isLoading, isSuccess, isError, error } = useContractWrite(config);

    return {
        swap: write,
        transaction: data,
        isLoading,
        isSuccess,
        isError,
        error,
    };
};
