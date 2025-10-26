// Real Vincent Abilities Implementation
// This file implements actual Vincent abilities for DeFi operations

import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import { bundledVincentAbility as UniswapSwapAbility } from '@lit-protocol/vincent-ability-uniswap-swap';
import { bundledVincentAbility as deBridgeAbility } from '@lit-protocol/vincent-ability-debridge';
import { bundledVincentAbility as ERC20TransferAbility } from '@lit-protocol/vincent-ability-erc20-transfer';
import { bundledVincentAbility as ERC20ApprovalAbility } from '@lit-protocol/vincent-ability-erc20-approval';
import { parseUnits } from 'viem';
import { ethers } from 'ethers';
import { derivePkpEthAddress, debugPkpKey } from './pkpUtils';

// RPC URLs - Use Chronicle Yellowstone for PKP operations
const RPC_URLS: Record<number, string> = {
  11155111: import.meta.env.VITE_RPC_SEPOLIA || 'https://ethereum-sepolia.publicnode.com',
  421614: import.meta.env.VITE_RPC_ARBITRUM_SEPOLIA || 'https://sepolia-rollup.arbitrum.io/rpc',
  84532: import.meta.env.VITE_RPC_BASE_SEPOLIA || 'https://sepolia.base.org',
  // Chronicle Yellowstone for PKP operations
  175188: 'https://yellowstone-rpc.litprotocol.com',
};

// PKP-specific RPC URLs (Chronicle Yellowstone)
const PKP_RPC_URLS: Record<number, string> = {
  11155111: 'https://yellowstone-rpc.litprotocol.com', // Use Chronicle for PKP operations
  421614: 'https://yellowstone-rpc.litprotocol.com',   // Use Chronicle for PKP operations
  84532: 'https://yellowstone-rpc.litprotocol.com',    // Use Chronicle for PKP operations
};

export interface VincentApp {
  wallet: {
    address: string;
    signer: any;
  };
  pkpAddress: string;
  pkpEthAddress?: string; // Derived Ethereum address
  jwt?: string; // Vincent JWT for authentication
  appId?: string; // Vincent App ID
}

// Vincent Ability Client Initialization with Authentication
export const createAuthenticatedVincentClient = (vincentApp: VincentApp, abilityBundle: any) => {
  console.log('🔐 Creating authenticated Vincent client:', {
    pkpAddress: vincentApp.pkpAddress,
    pkpEthAddress: vincentApp.pkpEthAddress,
    hasJWT: !!vincentApp.jwt,
    appId: vincentApp.appId
  });

  // Create the ability client - Vincent SDK handles authentication internally
  const client = getVincentAbilityClient({
    bundledVincentAbility: abilityBundle,
    ethersSigner: vincentApp.wallet.signer,
  });

  return client;
};

// PKP Validation and Address Derivation
export const validateAndPreparePKP = async (pkpKey: string, chainId: number): Promise<{ isValid: boolean; ethAddress: string }> => {
  try {
    console.log('🔍 Validating and preparing PKP:', { pkpKey, chainId });
    
    // Debug the PKP key format
    debugPkpKey(pkpKey);
    
    // Derive the Ethereum address from the PKP key
    const pkpEthAddress = derivePkpEthAddress(pkpKey);
    console.log('📍 Derived PKP Ethereum address:', pkpEthAddress);
    
    // Use Chronicle Yellowstone for PKP validation
    const rpcUrl = PKP_RPC_URLS[chainId];
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Check if the derived address exists on Chronicle Yellowstone
    const balance = await provider.getBalance(pkpEthAddress);
    const code = await provider.getCode(pkpEthAddress);
    
    // PKP should have some balance or code to be considered valid
    const isValid = balance > 0n || code !== '0x';
    
    console.log('PKP validation result:', { 
      originalKey: pkpKey,
      derivedAddress: pkpEthAddress,
      balance: balance.toString(),
      hasCode: code !== '0x',
      isValid,
      rpcUrl
    });
    
    return { isValid, ethAddress: pkpEthAddress };
  } catch (error) {
    console.error('PKP validation failed:', error);
    return { isValid: false, ethAddress: '' };
  }
};

// Uniswap Swap (intra-chain, e.g., on Sepolia)
export const executeUniswapSwap = async (vincentApp: VincentApp, params: {
  inputToken: string;
  outputToken: string;
  amount: string;
  chainId: number;
  slippageBps?: number;
  deadline?: number;
}) => {
  console.log('🔄 Executing Uniswap swap via Vincent:', params);

  // Validate and prepare PKP
  const { isValid, ethAddress } = await validateAndPreparePKP(vincentApp.pkpAddress, params.chainId);
  if (!isValid) {
    throw new Error(`PKP ${vincentApp.pkpAddress} is not properly registered. Derived address: ${ethAddress}`);
  }

  const swapAbility = createAuthenticatedVincentClient(vincentApp, UniswapSwapAbility);

  // Phase 1: Precheck (quote + validation)
  const precheckParams = {
    rpcUrl: RPC_URLS[params.chainId],
    chainId: params.chainId.toString(),
    inputToken: params.inputToken,
    outputToken: params.outputToken,
    amount: params.amount,
    recipient: ethAddress, // Use the PKP address as recipient
    slippageBps: params.slippageBps || 50, // 0.5%
    deadline: params.deadline || Math.floor(Date.now() / 1000) + 1200, // 20 min
  };

  console.log('precheck', {
    rawAbilityParams: precheckParams,
    delegatorPkpEthAddress: ethAddress,
    rpcUrl: RPC_URLS[params.chainId]
  });

  const precheckResult = await swapAbility.precheck(precheckParams, {
    delegatorPkpEthAddress: ethAddress, // Use derived Ethereum address
  });

  if (!precheckResult.success) {
    console.error('Uniswap precheck failed:', {
      error: precheckResult.runtimeError,
      params: precheckParams,
      result: precheckResult
    });
    throw new Error('Uniswap precheck failed: ' + (precheckResult.runtimeError || 'Invalid precheck parameters.'));
  }

  console.log('✅ Uniswap precheck passed:', precheckResult.result);

  // Phase 2: Execute
  const executeResult = await swapAbility.execute(precheckParams, {
    delegatorPkpEthAddress: ethAddress, // Use derived Ethereum address
  });

  if (!executeResult.success) {
    throw new Error('Uniswap execution failed: ' + (executeResult.runtimeError || 'Unknown error'));
  }

  console.log('🚀 Uniswap swap executed:', executeResult.result);
  return executeResult.result || {}; // { txHash, outputAmount, etc. }
};

// deBridge (cross-chain, e.g., Sepolia -> Base Sepolia)
export const executeDebridge = async (vincentApp: VincentApp, params: {
  sourceChain: number;
  destinationChain: number;
  sourceToken: string;
  destinationToken: string;
  amount: string;
  slippageBps?: number;
}) => {
  console.log('🌉 Executing deBridge via Vincent:', params);

  // CRITICAL: Verify JWT is provided
  if (!vincentApp.jwt) {
    throw new Error(
      'No JWT provided. User must authorize Vincent first. ' +
      'Please redirect to Vincent Connect Page to grant permissions.'
    );
  }

  // Validate and prepare PKP
  const { isValid, ethAddress } = await validateAndPreparePKP(vincentApp.pkpAddress, params.sourceChain);
  if (!isValid) {
    throw new Error(`PKP ${vincentApp.pkpAddress} is not properly registered or accessible. Derived address: ${ethAddress}. Please ensure the PKP is deployed on Chronicle Yellowstone.`);
  }

  // Update vincentApp with derived address
  const updatedVincentApp = {
    ...vincentApp,
    pkpEthAddress: ethAddress,
  };

  const bridgeAbility = createAuthenticatedVincentClient(updatedVincentApp, deBridgeAbility);

  // Phase 1: Precheck (quote + fees)
  const precheckParams = {
    rpcUrl: RPC_URLS[params.sourceChain],
    sourceChain: params.sourceChain.toString(),
    destinationChain: params.destinationChain.toString(),
    sourceToken: params.sourceToken,
    destinationToken: params.destinationToken,
    amount: params.amount,
    operation: 'BRIDGE' as const,
    slippageBps: params.slippageBps || 100, // 1%
  };

  try {
    const precheckResult = await bridgeAbility.precheck(precheckParams, {
      delegatorPkpEthAddress: ethAddress, // Use derived Ethereum address
    });

    if (!precheckResult.success) {
      throw new Error('deBridge precheck failed: ' + (precheckResult.runtimeError || 'Unknown error'));
    }

    console.log('✅ deBridge precheck passed:', precheckResult.result);

    // Phase 2: Execute
    const executeResult = await bridgeAbility.execute(precheckParams, {
      delegatorPkpEthAddress: ethAddress, // Use derived Ethereum address
    });

    if (!executeResult.success) {
      throw new Error('deBridge execution failed: ' + (executeResult.runtimeError || 'Unknown error'));
    }

    console.log('🌉 deBridge executed:', executeResult.result);
    return executeResult.result || {}; // { orderId, txHash, estimatedTime }

  } catch (error: any) {
    // Enhanced error handling for different types of Vincent errors
    if (error.message?.includes('ethAddressToPkpId') || error.message?.includes('CALL_EXCEPTION')) {
      throw new Error(`PKP lookup failed for address ${vincentApp.pkpAddress}. This PKP may not be registered on the Lit Protocol Pubkey Router contract. Please ensure your PKP is properly deployed on Chronicle Yellowstone network.`);
    }
    
    if (error.message?.includes('not permitted to execute Vincent Ability')) {
      const appId = vincentApp.appId || import.meta.env.VITE_VINCENT_APP_ID;
      throw new Error(
        `Permission denied: PKP ${vincentApp.pkpAddress} is not authorized to execute deBridge ability for App ID ${appId}.\n\n` +
        `To fix this:\n` +
        `1. Visit https://app.heyvincent.ai/connect/${appId}\n` +
        `2. Connect your wallet\n` +
        `3. Grant deBridge permissions to your PKP\n` +
        `4. Return here and try again`
      );
    }
    
    if (error.message?.includes('App Delegatee') || error.message?.includes('authorization failed')) {
      const appId = vincentApp.appId || import.meta.env.VITE_VINCENT_APP_ID;
      throw new Error(
        `Vincent authorization failed. User must authorize Vincent first.\n\n` +
        `Please visit https://app.heyvincent.ai/connect/${appId} to grant permissions.`
      );
    }
    
    throw error;
  }
};

// ERC20 Transfer
export const executeERC20Transfer = async (vincentApp: VincentApp, params: {
  tokenAddress: string;
  to: string;
  amount: string;
  chainId: number;
}) => {
  console.log('💸 Executing ERC20 transfer via Vincent:', params);

  // Validate and prepare PKP
  const { isValid, ethAddress } = await validateAndPreparePKP(vincentApp.pkpAddress, params.chainId);
  if (!isValid) {
    throw new Error(`PKP ${vincentApp.pkpAddress} is not properly registered. Derived address: ${ethAddress}`);
  }

  const transferAbility = createAuthenticatedVincentClient(vincentApp, ERC20TransferAbility);

  const transferParams = {
    rpcUrl: RPC_URLS[params.chainId],
    chainId: params.chainId.toString(),
    tokenAddress: params.tokenAddress,
    to: params.to,
    amount: params.amount,
  };

  // Precheck
  const precheckResult = await transferAbility.precheck(transferParams, {
    delegatorPkpEthAddress: ethAddress, // Use derived Ethereum address
  });

  if (!precheckResult.success) {
    throw new Error('ERC20 transfer precheck failed: ' + (precheckResult.runtimeError || 'Unknown error'));
  }

  // Execute
  const executeResult = await transferAbility.execute(transferParams, {
    delegatorPkpEthAddress: ethAddress, // Use derived Ethereum address
  });

  if (!executeResult.success) {
    throw new Error('ERC20 transfer execution failed: ' + (executeResult.runtimeError || 'Unknown error'));
  }

  console.log('💸 ERC20 transfer executed:', executeResult.result);
  return executeResult.result || {};
};

// ERC20 Approval
export const executeERC20Approval = async (vincentApp: VincentApp, params: {
  tokenAddress: string;
  spender: string;
  amount: string;
  chainId: number;
}) => {
  console.log('✅ Executing ERC20 approval via Vincent:', params);

  // Validate and prepare PKP
  const { isValid, ethAddress } = await validateAndPreparePKP(vincentApp.pkpAddress, params.chainId);
  if (!isValid) {
    throw new Error(`PKP ${vincentApp.pkpAddress} is not properly registered. Derived address: ${ethAddress}`);
  }

  const approvalAbility = createAuthenticatedVincentClient(vincentApp, ERC20ApprovalAbility);

  const approvalParams = {
    rpcUrl: RPC_URLS[params.chainId],
    chainId: params.chainId.toString(),
    tokenAddress: params.tokenAddress,
    spender: params.spender,
    amount: params.amount,
  };

  // Precheck
  const precheckResult = await approvalAbility.precheck(approvalParams, {
    delegatorPkpEthAddress: ethAddress, // Use derived Ethereum address
  });

  if (!precheckResult.success) {
    throw new Error('ERC20 approval precheck failed: ' + (precheckResult.runtimeError || 'Unknown error'));
  }

  // Execute
  const executeResult = await approvalAbility.execute(approvalParams, {
    delegatorPkpEthAddress: ethAddress, // Use derived Ethereum address
  });

  if (!executeResult.success) {
    throw new Error('ERC20 approval execution failed: ' + (executeResult.runtimeError || 'Unknown error'));
  }

  console.log('✅ ERC20 approval executed:', executeResult.result);
  return executeResult.result || {};
};

// Deposit to vault using ERC20 transfer
export const depositToVault = async (vincentApp: VincentApp, params: {
  token: string;
  amount: string;
  vaultAddress: string;
  chainId: number;
  decimals?: number;
}) => {
  console.log('🏦 Depositing to vault via Vincent:', params);

  const decimals = params.decimals || 18;
  const amountWei = parseUnits(params.amount, decimals).toString();

  // Use ERC20 transfer to send tokens to vault
  const transferResult = await executeERC20Transfer(vincentApp, {
    tokenAddress: params.token,
    to: params.vaultAddress,
    amount: amountWei,
    chainId: params.chainId,
  });

  console.log('🏦 Vault deposit completed:', transferResult);
  return transferResult;
};

// Combined flow: Swap -> Bridge -> Deposit
export const executeAutomatedFlow = async (vincentApp: VincentApp, params: {
  // Swap params
  inputToken: string;
  outputToken: string;
  swapAmount: string;
  sourceChain: number;

  // Bridge params
  destinationChain: number;
  bridgeToken: string;

  // Deposit params
  vaultAddress: string;
  decimals?: number;
}) => {
  console.log('🤖 Executing automated DeFi flow via Vincent:', params);

  try {
    // Step 1: Swap tokens on source chain
    const swapResult = await executeUniswapSwap(vincentApp, {
      inputToken: params.inputToken,
      outputToken: params.outputToken,
      amount: params.swapAmount,
      chainId: params.sourceChain,
    });

    console.log('✅ Step 1 complete - Swap:', swapResult);

    // Step 2: Bridge to destination chain
    const bridgeResult = await executeDebridge(vincentApp, {
      sourceChain: params.sourceChain,
      destinationChain: params.destinationChain,
      sourceToken: params.outputToken,
      destinationToken: params.bridgeToken,
      amount: (swapResult && typeof swapResult === 'object' && 'outputAmount' in swapResult) 
        ? (swapResult as any).outputAmount 
        : params.swapAmount, // Use actual output or fallback
    });

    console.log('✅ Step 2 complete - Bridge:', bridgeResult);

    // Step 3: Wait for bridge completion (simplified)
    console.log('⏳ Waiting for bridge completion...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute

    // Step 4: Deposit to vault on destination chain
    const depositResult = await depositToVault(vincentApp, {
      token: params.bridgeToken,
      amount: (bridgeResult && typeof bridgeResult === 'object' && 'destinationAmount' in bridgeResult) 
        ? (bridgeResult as any).destinationAmount 
        : params.swapAmount, // Use actual amount or fallback
      vaultAddress: params.vaultAddress,
      chainId: params.destinationChain,
      decimals: params.decimals,
    });

    console.log('✅ Step 3 complete - Deposit:', depositResult);

    return {
      swapResult,
      bridgeResult,
      depositResult,
      success: true,
    };

  } catch (error) {
    console.error('❌ Automated flow failed:', error);
    throw error;
  }
};