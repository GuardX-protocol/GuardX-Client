import React, { useState, useMemo, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  useAccount,
  useNetwork,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import toast from "react-hot-toast";
import {
  VAULT_CONTRACTS,
  SUPPORTED_TOKENS,
  SupportedToken,
} from "@/config/vault";
import { VaultERC4626ABI, ERC20ABI } from "@/config/abis/vault";

const VaultDepositForm: React.FC = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [selectedToken, setSelectedToken] = useState<SupportedToken | null>(
    null
  );
  const [amount, setAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tokens based on search
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_TOKENS;

    const query = searchQuery.toLowerCase();
    return SUPPORTED_TOKENS.filter(
      (token) =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Check if we're on the correct network
  const isCorrectNetwork = chain?.id === VAULT_CONTRACTS.CHAIN_ID;

  // Token balance
  const { data: tokenBalance } = useContractRead({
    address: selectedToken?.address,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: [address!],
    enabled: !!selectedToken && !!address,
    watch: true,
  });

  // Token allowance
  const { data: allowance } = useContractRead({
    address: selectedToken?.address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [address!, VAULT_CONTRACTS.VAULT_ADDRESS],
    enabled: !!selectedToken && !!address,
    watch: true,
  });

  // Vault shares balance
  const { data: vaultShares } = useContractRead({
    address: VAULT_CONTRACTS.VAULT_ADDRESS,
    abi: VaultERC4626ABI,
    functionName: "balanceOf",
    args: [address!],
    enabled: !!address,
    watch: true,
  });

  // Preview deposit (how many shares user will receive)
  const { data: previewShares } = useContractRead({
    address: VAULT_CONTRACTS.VAULT_ADDRESS,
    abi: VaultERC4626ABI,
    functionName: "previewDeposit",
    args: [
      selectedToken && amount ? parseUnits(amount, selectedToken.decimals) : 0n,
    ],
    enabled:
      !!selectedToken &&
      !!amount &&
      !isNaN(Number(amount)) &&
      Number(amount) > 0,
  });

  // Format balances
  const formattedTokenBalance = useMemo(() => {
    if (!tokenBalance || !selectedToken) return "0";
    return formatUnits(tokenBalance, selectedToken.decimals);
  }, [tokenBalance, selectedToken]);

  const formattedVaultShares = useMemo(() => {
    if (!vaultShares) return "0";
    return formatUnits(vaultShares, 18); // Vault shares are 18 decimals
  }, [vaultShares]);

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (!selectedToken || !amount || !allowance) return false;
    try {
      const amountBigInt = parseUnits(amount, selectedToken.decimals);
      return allowance < amountBigInt;
    } catch {
      return false;
    }
  }, [selectedToken, amount, allowance]);

  // Token approval
  const { write: approveToken, data: approvalTx } = useContractWrite({
    address: selectedToken?.address,
    abi: ERC20ABI,
    functionName: "approve",
    args: [
      VAULT_CONTRACTS.VAULT_ADDRESS,
      selectedToken && amount ? parseUnits(amount, selectedToken.decimals) : 0n,
    ],
  });

  const { isLoading: isApprovePending } = useWaitForTransaction({
    hash: approvalTx?.hash,
    onSuccess: () => {
      toast.success("Token approval successful!");
      setIsApproving(false);
    },
    onError: (error) => {
      toast.error("Approval failed: " + error.message);
      setIsApproving(false);
    },
  });

  // Vault deposit
  const { write: depositToVault, data: depositTx } = useContractWrite({
    address: VAULT_CONTRACTS.VAULT_ADDRESS,
    abi: VaultERC4626ABI,
    functionName: "deposit",
    args: [
      selectedToken && amount ? parseUnits(amount, selectedToken.decimals) : 0n,
      address!,
    ],
  });

  const { isLoading: isDepositPending } = useWaitForTransaction({
    hash: depositTx?.hash,
    onSuccess: () => {
      toast.success("Deposit successful!");
      setAmount("");
    },
    onError: (error) => {
      toast.error("Deposit failed: " + error.message);
    },
  });

  // Mint tokens (for Mock token testing)
  const { write: mintMockTokens } = useContractWrite({
    address: VAULT_CONTRACTS.MOCK_TOKEN,
    abi: ERC20ABI,
    functionName: "mint",
    args: [address!, parseUnits("1000", 18)], // Mint 1000 mock tokens
  });

  // Handle approval
  const handleApprove = useCallback(async () => {
    if (!selectedToken || !amount) return;

    setIsApproving(true);
    try {
      approveToken?.();
    } catch (error) {
      toast.error("Failed to approve token");
      setIsApproving(false);
    }
  }, [selectedToken, amount, approveToken]);

  // Handle deposit
  const handleDeposit = useCallback(async () => {
    if (!selectedToken || !amount) return;

    try {
      depositToVault?.();
    } catch (error) {
      toast.error("Failed to deposit to vault");
    }
  }, [selectedToken, amount, depositToVault]);

  // Handle mint mock tokens
  const handleMintMock = useCallback(() => {
    if (selectedToken?.symbol === "MOCK") {
      mintMockTokens?.();
      toast.success("Minting 1000 MOCK tokens...");
    }
  }, [selectedToken, mintMockTokens]);

  // Validation
  const isValidAmount = useMemo(() => {
    if (!amount || !selectedToken) return false;
    try {
      const amountBigInt = parseUnits(amount, selectedToken.decimals);
      return (
        amountBigInt > 0n && (!tokenBalance || amountBigInt <= tokenBalance)
      );
    } catch {
      return false;
    }
  }, [amount, selectedToken, tokenBalance]);

  if (!isCorrectNetwork) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Wrong Network
            </h3>
            <p className="text-gray-600 mb-4">
              Please switch to Base Sepolia (Chain ID:{" "}
              {VAULT_CONTRACTS.CHAIN_ID}) to use the vault.
            </p>
            <p className="text-sm text-gray-500">
              Current network: {chain?.name || "Unknown"} (ID:{" "}
              {chain?.id || "Unknown"})
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Deposit to Vault
        </h2>
        <p className="text-gray-600">
          Deposit tokens into the GuardX vault for crash protection
        </p>
      </div>

      {/* Vault Stats */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Your Vault Shares</p>
            <p className="text-lg font-semibold text-gray-900">
              {formattedVaultShares}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Vault Address</p>
            <a
              href={`https://sepolia.basescan.org/address/${VAULT_CONTRACTS.VAULT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {VAULT_CONTRACTS.VAULT_ADDRESS.slice(0, 8)}...
              {VAULT_CONTRACTS.VAULT_ADDRESS.slice(-6)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Token Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Token
        </label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Token List */}
          <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => setSelectedToken(token)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0 ${
                  selectedToken?.address === token.address
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
              >
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/32/6366f1/ffffff?text=" +
                      token.symbol[0];
                  }}
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {token.symbol}
                  </div>
                  <div className="text-sm text-gray-600">{token.name}</div>
                </div>
                {selectedToken?.address === token.address && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Token Info */}
      {selectedToken && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/32/6366f1/ffffff?text=" +
                    selectedToken.symbol[0];
                }}
              />
              <div>
                <div className="font-semibold text-gray-900">
                  {selectedToken.symbol}
                </div>
                <div className="text-sm text-gray-600">
                  Balance: {formattedTokenBalance}
                </div>
              </div>
            </div>
            {selectedToken.symbol === "MOCK" && (
              <button
                onClick={handleMintMock}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Mint Test Tokens
              </button>
            )}
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount to Deposit
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            disabled={!selectedToken}
          />
          {selectedToken && (
            <button
              onClick={() => setAmount(formattedTokenBalance)}
              className="absolute right-3 top-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              MAX
            </button>
          )}
        </div>

        {/* Preview */}
        {selectedToken && amount && previewShares && previewShares > 0n ? (
          <div className="mt-2 text-sm text-gray-600">
            You will receive: {formatUnits(previewShares, 18)} vault shares
          </div>
        ) : null}
      </div>

      {/* Deposit Button */}
      <div className="space-y-3">
        {needsApproval && (
          <button
            onClick={handleApprove}
            disabled={!isValidAmount || isApproving || isApprovePending}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isApproving || isApprovePending
              ? "Approving..."
              : `Approve ${selectedToken?.symbol}`}
          </button>
        )}

        <button
          onClick={handleDeposit}
          disabled={!isValidAmount || needsApproval || isDepositPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {isDepositPending ? "Depositing..." : "Deposit to Vault"}
        </button>
      </div>

      {/* Validation Messages */}
      {selectedToken && amount && !isValidAmount && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">
              {parseFloat(amount) <= 0
                ? "Amount must be greater than 0"
                : "Insufficient balance"}
            </span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Deposit tokens into the ERC4626 vault</li>
          <li>• Receive vault shares representing your deposit</li>
          <li>• AI monitors for market crashes</li>
          <li>• Emergency swaps protect your assets automatically</li>
          <li>• Withdraw anytime with your vault shares</li>
        </ul>
      </div>
    </div>
  );
};

export default VaultDepositForm;
