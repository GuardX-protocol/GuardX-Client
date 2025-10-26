import React, { useState } from 'react';
import { Zap, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { usePKPOperations } from '@/hooks/usePKPWallet';
import { useWalletTokens } from '@/hooks/useWalletTokens';

const VincentAbilitiesTest: React.FC = () => {
    const { isAuthenticated, user } = useVincentAuth();
    const pkpOperations = usePKPOperations(84532); // Base Sepolia

    const { tokens, loading: tokensLoading } = useWalletTokens(421614); // Arbitrum Sepolia

    const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
    const [testLogs, setTestLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testSwap = async () => {
        if (!isAuthenticated || !user?.pkpAddress) return;

        setTestResults(prev => ({ ...prev, swap: 'pending' }));
        addLog('Testing token swap via PKP...');

        try {
            // Check PKP funding first
            if (pkpOperations.needsFunding) {
                throw new Error(`PKP needs funding: ${pkpOperations.formattedBalance} ETH (need ${pkpOperations.minimumBalance} ETH)`);
            }

            // Find a token with balance to test swap
            const testToken = tokens.find(token =>
                !token.isNative && parseFloat(token.formattedBalance) > 0
            );

            if (!testToken) {
                throw new Error('No ERC20 tokens with balance found for testing. Please use the testnet faucet to get some tokens first.');
            }

            const result = await pkpOperations.executeSwapWithCheck({
                tokenIn: testToken.address,
                tokenOut: '0x0000000000000000000000000000000000000000', // ETH
                amountIn: '1000000', // Small amount for testing
                minAmountOut: '0',
                recipient: user.pkpAddress,
                chainId: 421614,
            });

            addLog(`Swap test successful via PKP: ${JSON.stringify(result)}`);
            setTestResults(prev => ({ ...prev, swap: 'success' }));
        } catch (error: any) {
            addLog(`Swap test failed: ${error.message}`);
            setTestResults(prev => ({ ...prev, swap: 'error' }));
        }
    };

    const testBridge = async () => {
        if (!isAuthenticated || !user?.pkpAddress) return;

        setTestResults(prev => ({ ...prev, bridge: 'pending' }));
        addLog('Testing cross-chain bridge via PKP...');

        try {
            // Check PKP funding first
            if (pkpOperations.needsFunding) {
                throw new Error(`PKP needs funding: ${pkpOperations.formattedBalance} ETH (need ${pkpOperations.minimumBalance} ETH)`);
            }

            const result = await pkpOperations.executeBridgeWithCheck({
                fromChain: 421614, // Arbitrum Sepolia
                toChain: 84532, // Base Sepolia
                token: '0x0000000000000000000000000000000000000000', // ETH
                amount: '1000000000000000', // 0.001 ETH
                recipient: user.pkpAddress,
            });

            addLog(`Bridge test successful via PKP: ${JSON.stringify(result)}`);
            setTestResults(prev => ({ ...prev, bridge: 'success' }));
        } catch (error: any) {
            addLog(`Bridge test failed: ${error.message}`);
            setTestResults(prev => ({ ...prev, bridge: 'error' }));
        }
    };

    const testDeposit = async () => {
        if (!isAuthenticated || !user?.pkpAddress) return;

        setTestResults(prev => ({ ...prev, deposit: 'pending' }));
        addLog('Testing vault deposit via PKP...');

        try {
            // Check PKP funding first
            if (pkpOperations.needsFunding) {
                throw new Error(`PKP needs funding: ${pkpOperations.formattedBalance} ETH (need ${pkpOperations.minimumBalance} ETH)`);
            }

            const result = await pkpOperations.executeDepositWithCheck({
                token: '0x0000000000000000000000000000000000000000', // ETH
                amount: '1000000000000000', // 0.001 ETH
                vaultAddress: '0x1234567890123456789012345678901234567890', // Mock vault address
            });

            addLog(`Deposit test successful via PKP: ${JSON.stringify(result)}`);
            setTestResults(prev => ({ ...prev, deposit: 'success' }));
        } catch (error: any) {
            addLog(`Deposit test failed: ${error.message}`);
            setTestResults(prev => ({ ...prev, deposit: 'error' }));
        }
    };

    const clearLogs = () => {
        setTestLogs([]);
        setTestResults({});
    };

    if (!isAuthenticated) {
        return (
            <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Vincent Abilities Test</h3>
                <p className="text-gray-400">Please authenticate with Vincent to test abilities</p>
            </div>
        );
    }

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'pending':
                return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case 'error':
                return <XCircle className="h-4 w-4 text-red-400" />;
            default:
                return <Zap className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Vincent Abilities Test</h3>
                <button
                    onClick={clearLogs}
                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                    Clear Logs
                </button>
            </div>

            {/* PKP Wallet Info */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">PKP Wallet Info</h4>
                <div className="text-xs text-gray-400 space-y-1">
                    <div>PKP Address: {user?.pkpAddress}</div>
                    <div>PKP Balance: <span className={pkpOperations.hasBalance ? 'text-green-400' : 'text-red-400'}>
                        {pkpOperations.formattedBalance} ETH
                    </span></div>
                    <div>Status: <span className={pkpOperations.canExecuteOperations ? 'text-green-400' : 'text-yellow-400'}>
                        {pkpOperations.canExecuteOperations ? 'Ready' : 
                         pkpOperations.needsFunding ? 'Needs Funding' : 'Not Ready'}
                    </span></div>
                    <div>Tokens loaded: {tokensLoading ? 'Loading...' : `${tokens.length} tokens`}</div>
                    <div>Tokens with balance: {tokens.filter(t => parseFloat(t.formattedBalance) > 0).length}</div>
                    {tokens.filter(t => parseFloat(t.formattedBalance) > 0).length === 0 && (
                        <div className="text-yellow-400 text-xs mt-1">
                            💡 Use testnet faucets to get tokens for testing
                        </div>
                    )}
                </div>
            </div>

            {/* Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                    onClick={testSwap}
                    disabled={pkpOperations.isExecuting || tokensLoading || pkpOperations.needsFunding}
                    className="flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                    {getStatusIcon(testResults.swap)}
                    Test Swap via PKP
                </button>

                <button
                    onClick={testBridge}
                    disabled={pkpOperations.isExecuting || pkpOperations.needsFunding}
                    className="flex items-center gap-2 p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                    {getStatusIcon(testResults.bridge)}
                    Test Bridge via PKP
                </button>

                <button
                    onClick={testDeposit}
                    disabled={pkpOperations.isExecuting || pkpOperations.needsFunding}
                    className="flex items-center gap-2 p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                    {getStatusIcon(testResults.deposit)}
                    Test Deposit via PKP
                </button>
            </div>

            {/* Test Logs */}
            {testLogs.length > 0 && (
                <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <h4 className="text-sm font-medium text-white mb-2">Test Logs</h4>
                    <div className="space-y-1">
                        {testLogs.map((log, index) => (
                            <div key={index} className="text-xs text-gray-300 font-mono">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Tokens */}
            {tokens.length > 0 && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-2">Available Tokens</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {tokens.map((token) => (
                            <div key={token.address} className="text-xs text-gray-400 flex justify-between">
                                <span>{token.symbol} ({token.name})</span>
                                <span>{parseFloat(token.formattedBalance).toFixed(4)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VincentAbilitiesTest;