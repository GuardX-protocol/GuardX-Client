import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Activity, Wallet } from "lucide-react";
import { TokenInfo } from "@uniswap/token-lists";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAccount } from "wagmi";

interface TokenListItemProps {
  token: TokenInfo;
  onClick: () => void;
  priceData?: {
    price: bigint | number;
    confidence: bigint | number;
    expo: number;
    publishTime: bigint | number;
    formattedPrice: string;
  };
  isLoading?: boolean;
  showBalance?: boolean;
  customBalance?: string;
}

const TokenListItem: React.FC<TokenListItemProps> = ({
  token,
  onClick,
  priceData,
  isLoading,
  showBalance = false,
  customBalance,
}) => {
  const { isConnected } = useAccount();
  const { formattedBalance, isLoading: isBalanceLoading } = useTokenBalance(
    showBalance && isConnected && !customBalance ? token.address : "",
    token.decimals
  );

  const displayBalance = customBalance || formattedBalance;

  // Generate consistent mock 24h change based on token symbol
  // In production, this would come from historical price data
  const priceChange = useMemo(() => {
    const hash = token.symbol
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ((hash % 2000) - 1000) / 100; // Range: -10% to +10%
  }, [token.symbol]);

  const isPositive = priceChange >= 0;

  return (
    <button
      onClick={onClick}
      className="w-full p-6 lg:p-5 bg-gradient-to-br from-gray-900/60 via-black/40 to-black/60 border border-gray-800/40 backdrop-blur-md rounded-2xl hover:border-red-500/30 hover:bg-gradient-to-br hover:from-gray-900/80 hover:via-black/60 hover:to-black/70 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 text-left group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {token.logoURI ? (
            <img
              src={token.logoURI}
              alt={token.symbol}
              className="w-13 h-13 rounded-full flex-shrink-0 ring-2 ring-gray-700/30 group-hover:ring-red-500/20 transition-all"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-13 h-13 bg-gradient-to-br from-red-500/15 to-orange-500/10 rounded-full flex items-center justify-center flex-shrink-0 border border-red-500/20 group-hover:border-red-500/40 transition-all">
              <span className="text-white text-sm font-bold">
                {token.symbol[0]}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-white truncate text-base">
                {token.symbol}
              </p>
              <Activity className="h-4 w-4 text-red-400/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <p className="text-sm text-gray-500 truncate font-normal">
              {token.name}
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-800/40 rounded w-20 ml-auto"></div>
              <div className="h-4 bg-gray-800/30 rounded w-16 ml-auto"></div>
            </div>
          ) : priceData ? (
            <>
              <p className="font-bold text-white text-lg lg:text-xl leading-tight">
                ${priceData.formattedPrice}
              </p>
              <div
                className={`flex items-center justify-end gap-1.5 text-xs lg:text-sm font-semibold mt-1.5 px-2 py-1 rounded-lg w-fit ml-auto border ${
                  isPositive
                    ? "border-green-500/20 bg-green-500/5 text-green-400/90"
                    : "border-red-500/20 bg-red-500/5 text-red-400/90"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {priceChange.toFixed(2)}%
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500 font-medium">No price</p>
          )}
        </div>
      </div>

      {/* Balance Display */}
      {showBalance && isConnected && (
        <div className="mt-5 pt-5 border-t border-gray-800/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Wallet className="h-4 w-4 text-red-400/40" />
              <span className="font-medium text-gray-400">Balance</span>
            </div>
            {isBalanceLoading && !customBalance ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-800/30 rounded w-16"></div>
              </div>
            ) : (
              <span
                className={`font-semibold ${
                  parseFloat(displayBalance) > 0
                    ? "text-emerald-400/90"
                    : "text-gray-500"
                }`}
              >
                {parseFloat(displayBalance) > 0 ? displayBalance : "0.00"}{" "}
                {token.symbol}
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
};

export default TokenListItem;
