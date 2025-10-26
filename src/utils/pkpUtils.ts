import { ethers } from 'ethers';

/**
 * Derives the Ethereum address from a PKP public key
 * PKP public keys are compressed secp256k1 keys that need to be converted to Ethereum addresses
 */
export const derivePkpEthAddress = (pkpPubKey: string): string => {
  try {
    // Remove 0x prefix if present
    const cleanPubKey = pkpPubKey.startsWith('0x') ? pkpPubKey.slice(2) : pkpPubKey;
    
    // Check if it's already an Ethereum address (40 hex chars)
    if (cleanPubKey.length === 40) {
      return ethers.getAddress('0x' + cleanPubKey);
    }
    
    // Check if it's a compressed public key (66 hex chars, starts with 02 or 03)
    if (cleanPubKey.length === 66 && (cleanPubKey.startsWith('02') || cleanPubKey.startsWith('03'))) {
      // For compressed public keys, we need to expand them first
      const pubKeyBytes = ethers.getBytes('0x' + cleanPubKey);
      
      // Use ethers to derive the address from the public key
      // This handles the secp256k1 point decompression and keccak256 hashing
      const uncompressedKey = ethers.SigningKey.computePublicKey(pubKeyBytes, false);
      const address = ethers.computeAddress(uncompressedKey);
      
      return address;
    }
    
    // Check if it's an uncompressed public key (130 hex chars, starts with 04)
    if (cleanPubKey.length === 130 && cleanPubKey.startsWith('04')) {
      const address = ethers.computeAddress('0x' + cleanPubKey);
      return address;
    }
    
    throw new Error(`Invalid PKP key format. Expected 40 (address), 66 (compressed), or 130 (uncompressed) hex chars, got ${cleanPubKey.length}`);
    
  } catch (error: any) {
    console.error('PKP address derivation failed:', error);
    throw new Error(`Failed to derive PKP Ethereum address: ${error.message}`);
  }
};

/**
 * Validates if a string is a valid PKP public key or Ethereum address
 */
export const isValidPkpKey = (key: string): boolean => {
  try {
    const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
    
    // Valid formats:
    // - 40 hex chars (Ethereum address)
    // - 66 hex chars starting with 02/03 (compressed public key)
    // - 130 hex chars starting with 04 (uncompressed public key)
    
    if (cleanKey.length === 40) {
      return /^[0-9a-fA-F]{40}$/.test(cleanKey);
    }
    
    if (cleanKey.length === 66) {
      return /^(02|03)[0-9a-fA-F]{64}$/.test(cleanKey);
    }
    
    if (cleanKey.length === 130) {
      return /^04[0-9a-fA-F]{128}$/.test(cleanKey);
    }
    
    return false;
  } catch {
    return false;
  }
};

/**
 * Gets the PKP Ethereum address, deriving it if necessary
 */
export const getPkpEthAddress = (pkpKey: string): string => {
  if (!isValidPkpKey(pkpKey)) {
    throw new Error('Invalid PKP key format');
  }
  
  return derivePkpEthAddress(pkpKey);
};

/**
 * Debug function to log PKP key information
 */
export const debugPkpKey = (pkpKey: string) => {
  const cleanKey = pkpKey.startsWith('0x') ? pkpKey.slice(2) : pkpKey;
  
  console.log('PKP Key Debug:', {
    original: pkpKey,
    clean: cleanKey,
    length: cleanKey.length,
    type: cleanKey.length === 40 ? 'address' : 
          cleanKey.length === 66 ? 'compressed_pubkey' :
          cleanKey.length === 130 ? 'uncompressed_pubkey' : 'unknown',
    isValid: isValidPkpKey(pkpKey),
  });
  
  try {
    const derived = derivePkpEthAddress(pkpKey);
    console.log('Derived Ethereum address:', derived);
    return derived;
  } catch (error) {
    console.error('Derivation failed:', error);
    return null;
  }
};