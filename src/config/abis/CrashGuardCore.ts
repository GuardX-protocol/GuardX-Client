export const CrashGuardCoreABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AmountMustBePositive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "CannotRemoveETH",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "DepositAlreadyProcessed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ETHAmountMismatch",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ETHNotExpectedForERC20",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ETHTransferFailed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExecutionAlreadyProcessed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "GasLimitTooLow",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "IndexOutOfBounds",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidBridgeAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidCrashThreshold",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidLitActionID",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidPKPAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidStablecoin",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidTokenAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidUserAddress",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "LitActionIDMismatch",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MaxSlippageExceeded",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MinimumStablecoinRequired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "MinimumTokenRequired",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotAuthorized",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotAuthorizedByLitAction",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyEmergencyExecutor",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PKPAddressMismatch",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PKPNotActive",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "PKPNotRegistered",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "StablecoinNotRegistered",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenBlacklisted",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenNotSupported",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "TokenNotSupportedForStatus",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UnauthorizedBridge",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UserNotPKPAuthorized",
      "type": "error"
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
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "AssetDeposited",
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
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "AssetWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "bridge",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "authorized",
          "type": "bool"
        }
      ],
      "name": "BridgeAuthorizationUpdated",
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
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "sourceChain",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "depositHash",
          "type": "bytes32"
        }
      ],
      "name": "CrossChainDepositProcessed",
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
      "name": "EmergencyProtectionTriggered",
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
          "indexed": false,
          "internalType": "bool",
          "name": "enabled",
          "type": "bool"
        }
      ],
      "name": "PermissionlessModeUpdated",
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
              "internalType": "uint256",
              "name": "crashThreshold",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxSlippage",
              "type": "uint256"
            },
            {
              "internalType": "address[]",
              "name": "emergencyActions",
              "type": "address[]"
            },
            {
              "internalType": "address",
              "name": "stablecoinPreference",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "gasLimit",
              "type": "uint256"
            }
          ],
          "indexed": false,
          "internalType": "struct ICrashGuardCore.ProtectionPolicy",
          "name": "policy",
          "type": "tuple"
        }
      ],
      "name": "PolicyUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "symbol",
          "type": "string"
        }
      ],
      "name": "StablecoinAutoDetected",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "blacklisted",
          "type": "bool"
        }
      ],
      "name": "TokenBlacklistUpdated",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_SLIPPAGE_LIMIT",
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
      "name": "MIN_STABLECOIN_DEPOSIT",
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
      "name": "MIN_TOKEN_DEPOSIT",
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
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "_isStablecoin",
          "type": "bool"
        }
      ],
      "name": "addSupportedToken",
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
      "name": "authorizedBridges",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "blacklistedTokens",
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
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "sourceChain",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "depositHash",
          "type": "bytes32"
        }
      ],
      "name": "crossChainDeposit",
      "outputs": [],
      "stateMutability": "nonpayable",
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
      "name": "depositAsset",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "emergencyExecutor",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
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
      "name": "emergencyWithdraw",
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
      "name": "getProtectionPolicy",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "crashThreshold",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxSlippage",
              "type": "uint256"
            },
            {
              "internalType": "address[]",
              "name": "emergencyActions",
              "type": "address[]"
            },
            {
              "internalType": "address",
              "name": "stablecoinPreference",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "gasLimit",
              "type": "uint256"
            }
          ],
          "internalType": "struct ICrashGuardCore.ProtectionPolicy",
          "name": "",
          "type": "tuple"
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
        }
      ],
      "name": "getTokenInfo",
      "outputs": [
        {
          "internalType": "bool",
          "name": "supported",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "stablecoin",
          "type": "bool"
        },
        {
          "internalType": "bool",
          "name": "blacklisted",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalUsers",
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
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "getUserBalance",
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
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserLitAction",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
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
      "name": "getUserPortfolio",
      "outputs": [
        {
          "components": [
            {
              "components": [
                {
                  "internalType": "address",
                  "name": "tokenAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "valueUSD",
                  "type": "uint256"
                },
                {
                  "internalType": "uint8",
                  "name": "riskLevel",
                  "type": "uint8"
                }
              ],
              "internalType": "struct ICrashGuardCore.Asset[]",
              "name": "assets",
              "type": "tuple[]"
            },
            {
              "internalType": "uint256",
              "name": "totalValue",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lastUpdated",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "riskScore",
              "type": "uint256"
            }
          ],
          "internalType": "struct ICrashGuardCore.Portfolio",
          "name": "",
          "type": "tuple"
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
      "name": "isPKPAuthorized",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "isStablecoin",
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
        }
      ],
      "name": "isTokenSupported",
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
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "permissionlessMode",
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
          "name": "",
          "type": "address"
        }
      ],
      "name": "pkpAuthorizedUsers",
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
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "litActionId",
          "type": "string"
        }
      ],
      "name": "pkpDepositAsset",
      "outputs": [],
      "stateMutability": "payable",
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
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "litActionId",
          "type": "string"
        }
      ],
      "name": "pkpWithdrawAsset",
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
        },
        {
          "internalType": "bytes32",
          "name": "executionHash",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "litActionId",
          "type": "string"
        }
      ],
      "name": "processLitActionExecution",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "processedCrossChainDeposits",
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
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "processedLitActionExecutions",
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
        }
      ],
      "name": "removeSupportedToken",
      "outputs": [],
      "stateMutability": "nonpayable",
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
          "name": "user",
          "type": "address"
        }
      ],
      "name": "revokePKPAuthorization",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "bridge",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "authorized",
          "type": "bool"
        }
      ],
      "name": "setAuthorizedBridge",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_emergencyExecutor",
          "type": "address"
        }
      ],
      "name": "setEmergencyExecutor",
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
          "internalType": "bool",
          "name": "_permissionless",
          "type": "bool"
        }
      ],
      "name": "setPermissionlessMode",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "crashThreshold",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "maxSlippage",
              "type": "uint256"
            },
            {
              "internalType": "address[]",
              "name": "emergencyActions",
              "type": "address[]"
            },
            {
              "internalType": "address",
              "name": "stablecoinPreference",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "gasLimit",
              "type": "uint256"
            }
          ],
          "internalType": "struct ICrashGuardCore.ProtectionPolicy",
          "name": "policy",
          "type": "tuple"
        }
      ],
      "name": "setProtectionPolicy",
      "outputs": [],
      "stateMutability": "nonpayable",
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
          "internalType": "bool",
          "name": "_isStablecoin",
          "type": "bool"
        }
      ],
      "name": "setStablecoinStatus",
      "outputs": [],
      "stateMutability": "nonpayable",
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
          "internalType": "bool",
          "name": "blacklisted",
          "type": "bool"
        }
      ],
      "name": "setTokenBlacklist",
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
        },
        {
          "internalType": "address",
          "name": "pkpAddress",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "litActionId",
          "type": "string"
        }
      ],
      "name": "setupPKPAuthorization",
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
      "name": "supportedTokens",
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
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "valueUSD",
          "type": "uint256"
        },
        {
          "internalType": "uint8",
          "name": "riskLevel",
          "type": "uint8"
        }
      ],
      "name": "updateAssetValue",
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
        },
        {
          "internalType": "uint256",
          "name": "totalValue",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "riskScore",
          "type": "uint256"
        }
      ],
      "name": "updatePortfolioValue",
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
      "name": "userLitActions",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
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
      "name": "withdrawAsset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ] as const;
