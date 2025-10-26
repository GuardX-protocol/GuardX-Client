// Vincent Configuration
export const VINCENT_CONFIG = {
  // App ID from Vincent Dashboard
  APP_ID: import.meta.env.VITE_VINCENT_APP_ID || 'guardx-crash-protection',
  
  // Redirect URIs (must be registered in Vincent Dashboard)
  REDIRECT_URIS: {
    development: 'https://guardx-protocol.vercel.app/',
    production: 'https://guardx-protocol.vercel.app/', // Update with your production domain
  },
  
  // Expected audience (should match your domain)
  AUDIENCE: window.location.origin,
  
  // JWT storage key
  JWT_STORAGE_KEY: 'vincent_jwt',
  
  // Abilities that your app will request
  REQUESTED_ABILITIES: [
    'uniswap-swap',
    'token-transfer',
    'contract-interaction',
  ],
} as const;

// Helper to get current redirect URI based on environment
export const getCurrentRedirectUri = () => {
  const isDev = import.meta.env.DEV;
  return isDev ? VINCENT_CONFIG.REDIRECT_URIS.development : VINCENT_CONFIG.REDIRECT_URIS.production;
};

// Helper to validate JWT structure
export const isValidVincentJWT = (jwt: string): boolean => {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    return !!(payload.pkpAddress && payload.aud && payload.exp);
  } catch {
    return false;
  }
};

// Helper to extract user info from JWT
export const extractUserFromJWT = (jwt: string) => {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return {
      pkpAddress: payload.pkpAddress,
      permissions: payload.permissions || [],
      audience: payload.aud,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
};