export const EmergencyExecutorABI = [
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
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "executionsCount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "successCount",
          "type": "uint256"
        }
      ],
      "name": "BatchExecutionCompleted",
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
          "components": [
            {
              "internalType": "bool",
              "name": "success",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amountConverted",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "actualSlippage",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "errorMessage",
              "type": "string"
            }
          ],
          "indexed": false,
          "internalType": "struct IEmergencyExecutor.ExecutionResult",
          "name": "result",
          "type": "tuple"
        }
      ],
      "name": "EmergencyExecutionCompleted",
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
        }
      ],
      "name": "EmergencyExecutionStarted",
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
      "inputs": [],
      "name": "DEFAULT_DEADLINE",
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
      "name": "MAX_BATCH_SIZE",
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
      "name": "MAX_SLIPPAGE",
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
          "internalType": "string",
          "name": "litActionId",
          "type": "string"
        }
      ],
      "name": "authorizeLitAction",
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
      "name": "authorizedControllers",
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
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "authorizedLitActions",
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
          "components": [
            {
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "internalType": "address[]",
              "name": "assetsToConvert",
              "type": "address[]"
            },
            {
              "internalType": "address",
              "name": "targetStablecoin",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "maxSlippage",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            }
          ],
          "internalType": "struct IEmergencyExecutor.EmergencyAction[]",
          "name": "actions",
          "type": "tuple[]"
        }
      ],
      "name": "batchEmergencyActions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bool",
              "name": "success",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amountConverted",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "actualSlippage",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "errorMessage",
              "type": "string"
            }
          ],
          "internalType": "struct IEmergencyExecutor.ExecutionResult[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
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
      "name": "canExecuteEmergency",
      "outputs": [
        {
          "internalType": "bool",
          "name": "canExecute",
          "type": "bool"
        },
        {
          "internalType": "string",
          "name": "reason",
          "type": "string"
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
          "internalType": "address[]",
          "name": "assets",
          "type": "address[]"
        },
        {
          "internalType": "address",
          "name": "targetStable",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "maxSlippage",
          "type": "uint256"
        }
      ],
      "name": "emergencyConvertToStable",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bool",
              "name": "success",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amountConverted",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "actualSlippage",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "errorMessage",
              "type": "string"
            }
          ],
          "internalType": "struct IEmergencyExecutor.ExecutionResult",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyPaused",
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
      "name": "executeEmergencyProtection",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bool",
              "name": "success",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amountConverted",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "actualSlippage",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "errorMessage",
              "type": "string"
            }
          ],
          "internalType": "struct IEmergencyExecutor.ExecutionResult",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "litActionId",
          "type": "string"
        },
        {
          "internalType": "bytes",
          "name": "executionData",
          "type": "bytes"
        }
      ],
      "name": "executeLitActionTriggeredProtection",
      "outputs": [
        {
          "components": [
            {
              "internalType": "bool",
              "name": "success",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "amountConverted",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "actualSlippage",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "errorMessage",
              "type": "string"
            }
          ],
          "internalType": "struct IEmergencyExecutor.ExecutionResult",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getExecutionStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "total",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "successful",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "successRate",
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
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserExecutionHistory",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "lastExecution",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "executionCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "litActionId",
          "type": "string"
        }
      ],
      "name": "isLitActionAuthorized",
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
      "inputs": [],
      "name": "litProtocolIntegration",
      "outputs": [
        {
          "internalType": "contract ILitProtocolIntegration",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "litRelayContract",
      "outputs": [
        {
          "internalType": "contract ILitRelayContract",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "maxRetries",
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
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "retryDelay",
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
          "internalType": "string",
          "name": "litActionId",
          "type": "string"
        }
      ],
      "name": "revokeLitActionAuthorization",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "controller",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "hasAccess",
          "type": "bool"
        }
      ],
      "name": "setAccessControl",
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
        }
      ],
      "name": "setCrashGuardCore",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_dexAggregator",
          "type": "address"
        }
      ],
      "name": "setDEXAggregator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "paused",
          "type": "bool"
        }
      ],
      "name": "setEmergencyPause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_litProtocolIntegration",
          "type": "address"
        }
      ],
      "name": "setLitProtocolIntegration",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_litRelayContract",
          "type": "address"
        }
      ],
      "name": "setLitRelayContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_maxRetries",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_retryDelay",
          "type": "uint256"
        }
      ],
      "name": "setRetryConfig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "successfulExecutions",
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
      "name": "totalExecutions",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "userExecutionCount",
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
      "name": "userLastExecution",
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
      "stateMutability": "payable",
      "type": "receive"
    }
  ] as const;
