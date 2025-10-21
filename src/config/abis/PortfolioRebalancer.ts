export const PortfolioRebalancerABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_crashGuardCore",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_dexAggregator",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_priceMonitor",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "int256",
                "name": "amount",
                "type": "int256"
            }
        ],
        "name": "AllocationAdjusted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "totalValue",
                "type": "uint256"
            }
        ],
        "name": "RebalanceExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address[]",
                "name": "tokens",
                "type": "address[]"
            },
            {
                "indexed": false,
                "internalType": "uint256[]",
                "name": "allocations",
                "type": "uint256[]"
            }
        ],
        "name": "StrategySet",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "BASIS_POINTS",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_REBALANCE_THRESHOLD",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MIN_INTERVAL",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MIN_REBALANCE_THRESHOLD",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "authorizedRebalancers",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "checkRebalanceNeeded",
        "outputs": [
            {
                "internalType": "bool",
                "name": "needed",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "maxDeviation",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "crashGuardCore",
        "outputs": [
            {
                "internalType": "contract ICrashGuardCore",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "dexAggregator",
        "outputs": [
            {
                "internalType": "contract IDEXAggregator",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "emergencyRecoverToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "executeRebalance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getRebalanceTargets",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "token",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "targetPercentage",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "currentPercentage",
                        "type": "uint256"
                    },
                    {
                        "internalType": "int256",
                        "name": "rebalanceAmount",
                        "type": "int256"
                    }
                ],
                "internalType": "struct PortfolioRebalancer.AllocationTarget[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "lastRebalanceTime",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "priceMonitor",
        "outputs": [
            {
                "internalType": "contract IPythPriceMonitor",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "rebalancer",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "authorized",
                "type": "bool"
            }
        ],
        "name": "setAuthorizedRebalancer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "targetTokens",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "targetAllocations",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256",
                "name": "rebalanceThreshold",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minRebalanceInterval",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "autoRebalance",
                "type": "bool"
            }
        ],
        "name": "setRebalanceStrategy",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_crashGuardCore",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_dexAggregator",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_priceMonitor",
                "type": "address"
            }
        ],
        "name": "updateContracts",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "userStrategies",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "rebalanceThreshold",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minRebalanceInterval",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "autoRebalance",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
] as const;
