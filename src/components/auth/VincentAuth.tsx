import React, { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { getWebAuthClient } from '@lit-protocol/vincent-app-sdk/webAuthClient';
import { isExpired, VincentJWTAppUser } from '@lit-protocol/vincent-app-sdk/jwt';
import { jwtDecode } from 'jwt-decode';
import { Shield, LogOut, Wallet, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import toast from 'react-hot-toast';

// Vincent Auth Context
interface VincentAuthContextType {
    isAuthenticated: boolean;
    user: {
        pkpAddress: string;
        permissions: string[];
    } | null;
    jwt: string | null;
    logout: () => void;
    isLoading: boolean;
    initiateAuth: () => void;
    requiresWalletFirst: boolean;
    canAuthenticateVincent: boolean;
}

const VincentAuthContext = createContext<VincentAuthContextType | null>(null);

export const useVincentAuth = () => {
    const context = useContext(VincentAuthContext);
    if (!context) {
        throw new Error('useVincentAuth must be used within VincentAuthProvider');
    }
    return context;
};

// Environment variables - convert to number if it's a string
const APP_ID_FROM_ENV = import.meta.env.VITE_VINCENT_APP_ID || '5245122686';
const MY_APP_ID = typeof APP_ID_FROM_ENV === 'string' && !isNaN(Number(APP_ID_FROM_ENV))
    ? Number(APP_ID_FROM_ENV)
    : APP_ID_FROM_ENV;
// Try different audience formats to see which one works
const EXPECTED_AUDIENCE = window.location.origin;
const ALTERNATIVE_AUDIENCE = window.location.href.split('?')[0]; // URL without query params

// Get the correct redirect URI based on environment
const getRedirectUri = () => {
    const baseUrl = window.location.origin;

    // For development, use localhost with proper format (dynamic port detection)
    if (baseUrl.includes('localhost')) {
        return `${baseUrl}/`;
    }

    // For production, use the production domain
    if (baseUrl.includes('vercel.app') || baseUrl.includes('guardx-protocol')) {
        return 'https://guardx-protocol.vercel.app/';
    }

    // Fallback to current origin with trailing slash
    return `${baseUrl}/`;
};

// Debug logging for configuration
if (import.meta.env.DEV) {
    console.log('Vincent Configuration:', {
        appId: MY_APP_ID,
        audience: EXPECTED_AUDIENCE,
        redirectUri: getRedirectUri(),
        currentUrl: window.location.href,
        origin: window.location.origin,
    });
    console.log('Environment variables:', {
        VITE_VINCENT_APP_ID: import.meta.env.VITE_VINCENT_APP_ID,
        NODE_ENV: import.meta.env.NODE_ENV,
        DEV: import.meta.env.DEV,
    });
}

// Vincent client will be initialized inside the component

interface VincentAuthProviderProps {
    children: React.ReactNode;
}

export const VincentAuthProvider: React.FC<VincentAuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ pkpAddress: string; permissions: string[] } | null>(null);
    const [jwt, setJwt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Get Web3 wallet state to enforce wallet-first flow
    const { isConnected: isWalletConnected, walletAddress } = useWeb3Auth();

    // Initialize Vincent client with proper App ID
    const vincentAppClient = useMemo(() => {
        console.log('Vincent Client Configuration:', {
            appIdFromEnv: APP_ID_FROM_ENV,
            appIdType: typeof APP_ID_FROM_ENV,
            finalAppId: MY_APP_ID,
            finalAppIdType: typeof MY_APP_ID,
            audience: EXPECTED_AUDIENCE
        });
        return getWebAuthClient({ appId: MY_APP_ID });
    }, []);


    const logout = () => {
        localStorage.removeItem('vincent_jwt');
        setIsAuthenticated(false);
        setUser(null);
        setJwt(null);

        toast.success('Logged out successfully');
        // Redirect to home page instead of Vincent Connect
        window.location.href = '/';
    };

    const initiateAuth = () => {
        // Enforce wallet-first authentication flow
        if (!isWalletConnected) {
            toast.error('Please connect your Web3 wallet first before authenticating Vincent');
            return;
        }

        // Clear any existing JWT to ensure fresh authentication
        localStorage.removeItem('vincent_jwt');

        const redirectUri = getRedirectUri();
        console.log('Initiating Vincent auth with wallet connected:', {
            appId: MY_APP_ID,
            redirectUri,
            currentUrl: window.location.href,
            walletAddress,
            walletConnected: isWalletConnected
        });

        vincentAppClient.redirectToConnectPage({
            redirectUri
        });
    };

    useEffect(() => {
        const handleAuthFlow = async () => {
            try {
                setIsLoading(true);

                // Step 1: Check if URL has a fresh JWT from redirect
                if (vincentAppClient.uriContainsVincentJWT()) {
                    console.log('Processing Vincent JWT from URL...');

                    try {
                        // First, let's try to extract the JWT from URL manually to inspect it
                        const urlParams = new URLSearchParams(window.location.search);
                        const jwtFromUrl = urlParams.get('jwt');

                        if (jwtFromUrl) {
                            console.log('Raw JWT from URL:', jwtFromUrl.substring(0, 50) + '...');

                            // Decode JWT payload to inspect it
                            try {
                                const payload = JSON.parse(atob(jwtFromUrl.split('.')[1]));
                                console.log('JWT Payload inspection:', {
                                    aud: payload.aud,
                                    iss: payload.iss,
                                    appId: payload.appId,
                                    app: payload.app,
                                    pkpInfo: payload.pkpInfo,
                                    exp: payload.exp
                                });
                            } catch (e) {
                                console.log('Could not decode JWT payload for inspection:', e);
                            }
                        }

                        console.log('Attempting to decode JWT with audience:', EXPECTED_AUDIENCE);
                        console.log('Alternative audience:', ALTERNATIVE_AUDIENCE);
                        console.log('App ID being used:', MY_APP_ID);

                        // Try with the primary audience first
                        let result;
                        try {
                            result = await vincentAppClient.decodeVincentJWTFromUri(EXPECTED_AUDIENCE) as {
                                decodedJWT: VincentJWTAppUser;
                                jwtStr: string;
                            };
                        } catch (audienceError) {
                            console.log('Primary audience failed, trying alternative:', audienceError);
                            // Try with alternative audience
                            result = await vincentAppClient.decodeVincentJWTFromUri(ALTERNATIVE_AUDIENCE) as {
                                decodedJWT: VincentJWTAppUser;
                                jwtStr: string;
                            };
                        }
                        if (!result) throw new Error('Failed to decode JWT');
                        const { decodedJWT, jwtStr } = result;

                        // Validate JWT expiration - pass the decoded JWT, not the string
                        console.log('Checking JWT expiration for:', decodedJWT);
                        if (isExpired(decodedJWT as any)) {
                            throw new Error('JWT expired during decode');
                        }
                        console.log('JWT is valid and not expired');

                        // Store JWT securely
                        localStorage.setItem('vincent_jwt', jwtStr);

                        // Clean up URL to remove sensitive data
                        vincentAppClient.removeVincentJWTFromURI();

                        // Set user state with correct property paths
                        const pkpAddress = decodedJWT.payload.pkpInfo?.ethAddress || '';
                        const permissions = (decodedJWT.payload.app as any)?.permissions || [];

                        console.log('Vincent JWT decoded successfully:', {
                            pkpAddress,
                            permissions,
                            hasAbilities: permissions.length > 0,
                            jwtLength: jwtStr.length
                        });

                        setUser({
                            pkpAddress,
                            permissions,
                        });
                        setJwt(jwtStr);
                        setIsAuthenticated(true);

                        toast.success('Vincent authentication successful!');
                        console.log('Vincent auth complete:', {
                            user: { pkpAddress, permissions },
                            jwtValid: true
                        });
                    } catch (error: any) {
                        console.error('Auth failed:', error);

                        // Handle specific error types
                        if (error.message?.includes('appId mismatch')) {
                            toast.error('App ID mismatch. Check Vincent Dashboard configuration.');
                            console.error('App ID Mismatch Error:', {
                                configuredAppId: MY_APP_ID,
                                environmentAppId: import.meta.env.VITE_VINCENT_APP_ID,
                                error: error.message,
                                solution: 'Verify App ID in Vincent Dashboard matches environment variable'
                            });
                        } else if (error.message?.includes('redirect') || error.message?.includes('URI')) {
                            const redirectUri = getRedirectUri();
                            toast.error(`Redirect URI not configured: ${redirectUri}`);
                            console.error('Redirect URI Error Details:', {
                                requested: redirectUri,
                                origin: window.location.origin,
                                appId: MY_APP_ID,
                                error: error.message,
                                solution: 'Add this URI to Vincent Dashboard'
                            });
                        } else {
                            toast.error('Authentication failed');
                        }

                        // Don't auto-redirect on error - let user try again manually
                        console.log('Authentication failed. User needs to try connecting again.');
                    }
                    setIsLoading(false);
                    return;
                }

                // Step 2: Check for existing stored JWT
                const storedJwt = localStorage.getItem('vincent_jwt');
                if (storedJwt) {
                    try {
                        // Use jwt-decode for safer JWT parsing
                        const payload = jwtDecode<VincentJWTAppUser['payload']>(storedJwt);
                        const decodedForExpiry = { payload } as VincentJWTAppUser;

                        // Check if JWT is expired
                        if (!isExpired(decodedForExpiry as any)) {
                            setUser({
                                pkpAddress: payload.pkpInfo?.ethAddress || '', // Correct nested path
                                permissions: (payload.app as any)?.permissions || [], // Cast to any for permissions
                            });
                            setJwt(storedJwt);
                            setIsAuthenticated(true);
                            console.log('User already authenticated with stored JWT');
                        } else {
                            // Expired JWT: Clear and redirect
                            console.log('Stored JWT expired, clearing...');
                            localStorage.removeItem('vincent_jwt');
                        }
                    } catch (error) {
                        console.error('Stored JWT invalid:', error);
                        localStorage.removeItem('vincent_jwt');
                    }
                }

                // Step 3: No valid session — don't auto-redirect, wait for user action
                if (!isAuthenticated && !storedJwt) {
                    console.log('No valid session found. User needs to connect manually.');
                    // Don't auto-redirect - let user click connect button
                }
            } catch (error) {
                console.error('Auth flow error:', error);
                toast.error('Authentication error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        handleAuthFlow();
    }, [isAuthenticated]);

    const contextValue: VincentAuthContextType = {
        isAuthenticated,
        user,
        jwt,
        logout,
        isLoading,
        initiateAuth,
        requiresWalletFirst: !isWalletConnected,
        canAuthenticateVincent: isWalletConnected,
    };

    // Always render children with context - ProtectedRoute handles auth screens
    return (
        <VincentAuthContext.Provider value={contextValue}>
            {children}
        </VincentAuthContext.Provider>
    );
};

// User info component for header
export const VincentUserInfo: React.FC = () => {
    const { user, logout } = useVincentAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!user) return null;

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl hover:border-[#ff4206] transition-all"
            >
                <div className="w-8 h-8 bg-[#ff4206] rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-xs text-slate-400">Vincent PKP</p>
                    <p className="text-sm font-medium text-white">
                        {formatAddress(user.pkpAddress)}
                    </p>
                </div>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[60]"
                        onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl z-[70] overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#ff4206] rounded-xl flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Vincent PKP</p>
                                        <p className="text-xs text-slate-400 font-mono">
                                            {formatAddress(user.pkpAddress)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 hover:bg-[#ff4206]/20 rounded-lg transition-colors text-[#ff4206]"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="bg-green-900/20 border border-green-700 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-medium text-green-400">Authenticated</span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    {user.permissions.length} permissions granted
                                </p>
                            </div>
                        </div>

                        <div className="p-4">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#ff4206]/20 rounded-xl transition-colors text-[#ff4206]"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};