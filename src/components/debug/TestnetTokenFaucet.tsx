import React, { useState } from 'react';
import { Droplets, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import toast from 'react-hot-toast';

const TestnetTokenFaucet: React.FC = () => {
    const { walletAddress } = useWeb3Auth();
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    // Prioritize Web3 wallet address for getting testnet tokens
    const effectiveAddress = walletAddress;

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedAddress(text);
            toast.success(`${label} copied to clipboard!`);
            setTimeout(() => setCopiedAddress(null), 2000);
        } catch (error) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const faucets = [
        {
            name: 'Arbitrum Sepolia ETH',
            description: 'Get ETH for Arbitrum Sepolia testnet',
            url: 'https://faucet.quicknode.com/arbitrum/sepolia',
            chain: 'Arbitrum Sepolia',
            token: 'ETH'
        },
        {
            name: 'Base Sepolia ETH',
            description: 'Get ETH for Base Sepolia testnet',
            url: 'https://faucet.quicknode.com/base/sepolia',
            chain: 'Base Sepolia',
            token: 'ETH'
        },
        {
            name: 'Ethereum Sepolia ETH',
            description: 'Get ETH for Ethereum Sepolia testnet',
            url: 'https://faucet.quicknode.com/ethereum/sepolia',
            chain: 'Ethereum Sepolia',
            token: 'ETH'
        },
        {
            name: 'Chainlink Faucet',
            description: 'Multi-chain testnet faucet',
            url: 'https://faucets.chain.link/',
            chain: 'Multiple',
            token: 'ETH'
        }
    ];

    if (!effectiveAddress) {
        return (
            <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    Testnet Token Faucet
                </h3>
                <p className="text-gray-400">Connect your Web3 wallet to get testnet tokens</p>
                <p className="text-xs text-gray-500 mt-2">
                    Testnet tokens should be sent to your Web3 wallet address, not Vincent PKP
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-400" />
                Testnet Token Faucet
            </h3>

            {/* Address Display */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-white mb-1">Your Address</h4>
                        <p className="text-xs text-gray-400 font-mono">
                            {effectiveAddress.slice(0, 6)}...{effectiveAddress.slice(-4)}
                        </p>
                    </div>
                    <button
                        onClick={() => copyToClipboard(effectiveAddress, 'Address')}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        {copiedAddress === effectiveAddress ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                        <span className="text-xs">Copy</span>
                    </button>
                </div>
            </div>

            {/* Faucet Links */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Available Faucets:</h4>
                {faucets.map((faucet, index) => (
                    <div key={index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h5 className="text-sm font-medium text-white">{faucet.name}</h5>
                                <p className="text-xs text-gray-400 mt-1">{faucet.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                        {faucet.chain}
                                    </span>
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                        {faucet.token}
                                    </span>
                                </div>
                            </div>
                            <a
                                href={faucet.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs transition-colors"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Get Tokens
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-sm font-medium text-blue-400 mb-2">How to use:</h4>
                <div className="text-xs text-blue-300/80 space-y-1">
                    <div>1. Copy your address above</div>
                    <div>2. Visit any faucet link</div>
                    <div>3. Paste your address and request tokens</div>
                    <div>4. Wait for tokens to arrive (usually 1-2 minutes)</div>
                    <div>5. Refresh the token selector to see your balance</div>
                </div>
            </div>

            {/* Popular Testnet Tokens */}
            <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
                <h4 className="text-sm font-medium text-white mb-2">Popular Testnet Tokens:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-400">
                        <div className="font-medium text-white">Arbitrum Sepolia:</div>
                        <div>• ETH (Native)</div>
                        <div>• USDC, WETH, ARB</div>
                    </div>
                    <div className="text-gray-400">
                        <div className="font-medium text-white">Base Sepolia:</div>
                        <div>• ETH (Native)</div>
                        <div>• WETH, USDC</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestnetTokenFaucet;