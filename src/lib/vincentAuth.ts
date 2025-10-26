// Vincent Authentication Library
// Handles user authorization and JWT management

import { getWebAuthClient } from '@lit-protocol/vincent-app-sdk/webAuthClient';
import { isExpired } from '@lit-protocol/vincent-app-sdk/jwt';

const VINCENT_APP_ID = import.meta.env.VITE_VINCENT_APP_ID || '5245122686';

// Initialize Vincent Web Auth Client
export const vincentAppClient = getWebAuthClient({
  appId: typeof VINCENT_APP_ID === 'string' ? Number(VINCENT_APP_ID) : VINCENT_APP_ID
});

// Storage key for JWT
const JWT_STORAGE_KEY = 'VINCENT_AUTH_JWT';

/**
 * Check if user is authenticated with Vincent
 */
export function checkVincentAuth(): { authenticated: boolean; jwt: string | null } {
  const storedJwt = localStorage.getItem(JWT_STORAGE_KEY);
  
  if (!storedJwt || isExpired(storedJwt)) {
    return { authenticated: false, jwt: null };
  }
  
  return { authenticated: true, jwt: storedJwt };
}

/**
 * Store JWT in localStorage
 */
export function storeVincentJWT(jwt: string): void {
  localStorage.setItem(JWT_STORAGE_KEY, jwt);
}

/**
 * Remove JWT from localStorage
 */
export function clearVincentJWT(): void {
  localStorage.removeItem(JWT_STORAGE_KEY);
}

/**
 * Get stored JWT
 */
export function getStoredJWT(): string | null {
  return localStorage.getItem(JWT_STORAGE_KEY);
}

/**
 * Redirect user to Vincent Connect Page for authorization
 */
export function redirectToVincentConnect(redirectUri?: string): void {
  vincentAppClient.redirectToConnectPage({
    redirectUri: redirectUri || window.location.href
  });
}

/**
 * Check if current URL contains Vincent JWT (after redirect back)
 */
export function uriContainsVincentJWT(): boolean {
  return vincentAppClient.uriContainsVincentJWT();
}

/**
 * Decode and extract JWT from URL
 */
export function decodeVincentJWTFromUri(audience: string) {
  return vincentAppClient.decodeVincentJWTFromUri(audience);
}

/**
 * Remove JWT from URL after extraction
 */
export function removeVincentJWTFromURI(): void {
  vincentAppClient.removeVincentJWTFromURI();
}
