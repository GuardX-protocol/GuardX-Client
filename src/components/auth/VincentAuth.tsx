import React, { useEffect, useState, createContext, useContext } from 'react';
import { getWebAuthClient } from '@lit-protocol/vincent-app-sdk/webAuthClient';
import { isExpired, VincentJWTAppUser } from '@lit-protocol/vincent-app-sdk/jwt';
import { jwtDecode } from 'jwt-decode';
import { Shield, Loader2, LogOut } from 'lucide-react';
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
}

const VincentAuthContext = createContext<VincentAuthContextType | null>(null);

export const useVincentAuth = () => {
    const context = useContext(VincentAuthContext);
    if (!context) {
        throw new Error('useVincentAuth must be used within VincentAuthProvider');
    }
    return context;
};

// Environment variables
const MY_APP_ID = import.meta.env.VITE_VINCENT_APP_ID || 'guardx-crash-protection';
const EXPECTED_AUDIENCE = window.location.origin;

// Initialize Vincent client
const vincentAppClient = getWebAuthClient({ appId: MY_APP_ID });

interface VincentAuthProviderProps {
    children: React.ReactNode;
}

export const VincentAuthProvider: React.FC<VincentAuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ pkpAddress: string; permissions: string[] } | null>(null);
    const [jwt, setJwt] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('vincent_jwt');
        setIsAuthenticated(false);
        setUser(null);
        setJwt(null);
        toast.success('Logged out successfully');
        // Redirect to connect page for re-authentication
        vincentAppClient.redirectToConnectPage({
            redirectUri: window.location.href
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
                        const result = await vincentAppClient.decodeVincentJWTFromUri(EXPECTED_AUDIENCE) as {
                            decodedJWT: VincentJWTAppUser;
                            jwtStr: string;
                        };
                        if (!result) throw new Error('Failed to decode JWT');
                        const { decodedJWT, jwtStr } = result;

                        // Validate JWT expiration (cast to any to avoid type issues for now)
                        if (isExpired(jwtStr as any)) {
                            throw new Error('JWT expired during decode');
                        }

                        // Store JWT securely
                        localStorage.setItem('vincent_jwt', jwtStr);

                        // Clean up URL to remove sensitive data
                        vincentAppClient.removeVincentJWTFromURI();

                        // Set user state with correct property paths
                        setUser({
                            pkpAddress: decodedJWT.payload.pkpInfo?.ethAddress || '', // Safe access to PKP address
                            permissions: (decodedJWT.payload.app as any)?.permissions || [], // Cast to any for permissions
                        });
                        setJwt(jwtStr);
                        setIsAuthenticated(true);

                        toast.success('Authentication successful!');
                        console.log('Vincent auth successful:', decodedJWT);
                    } catch (error) {
                        console.error('Auth failed:', error);
                        toast.error('Authentication failed');
                        // Redirect to connect page on error
                        vincentAppClient.redirectToConnectPage({
                            redirectUri: window.location.href
                        });
                    }
                    setIsLoading(false);
                    return;
                }

                // Step 2: Check for existing stored JWT
                const storedJwt = localStorage.getItem('vincent_jwt');
                if (storedJwt && !isExpired(storedJwt as any)) {
                    try {
                        // Use jwt-decode for safer JWT parsing
                        const payload = jwtDecode<VincentJWTAppUser['payload']>(storedJwt);

                        setUser({
                            pkpAddress: payload.pkpInfo?.ethAddress || '', // Correct nested path
                            permissions: (payload.app as any)?.permissions || [], // Cast to any for permissions
                        });
                        setJwt(storedJwt);
                        setIsAuthenticated(true);
                        console.log('User already authenticated with stored JWT');
                    } catch (error) {
                        console.error('Stored JWT invalid:', error);
                        localStorage.removeItem('vincent_jwt');
                    }
                } else if (storedJwt) {
                    // Expired JWT: Clear and redirect
                    console.log('Stored JWT expired, clearing...');
                    localStorage.removeItem('vincent_jwt');
                }

                // Step 3: No valid session — redirect to Vincent Connect
                if (!isAuthenticated && !storedJwt) {
                    console.log('No valid session, redirecting to Vincent Connect...');
                    vincentAppClient.redirectToConnectPage({
                        redirectUri: window.location.href
                    });
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
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
                <div className="text-center p-8 bg-gray-900/50 rounded-2xl border border-cyan-500/30 backdrop-blur-sm max-w-md w-full mx-4">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                        <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
                        Authenticating with Vincent
                    </h2>
                    <p className="text-gray-400 mb-4">
                        Connecting to Lit Protocol's secure authentication...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span>Powered by Lit Protocol</span>
                    </div>
                </div>
            </div>
        );
    }

    // Not authenticated state
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
                <div className="text-center p-8 bg-gray-900/50 rounded-2xl border border-cyan-500/30 backdrop-blur-sm max-w-md w-full mx-4">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                        <Shield className="h-10 w-10 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
                        Connect with Vincent
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Secure, non-custodial authentication using Lit Protocol's Programmable Key Pairs
                    </p>
                    <button
                        onClick={() => vincentAppClient.redirectToConnectPage({
                            redirectUri: window.location.href
                        })}
                        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-purple-600 transition-colors shadow-lg"
                    >
                        Connect with Vincent
                    </button>
                    <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <p className="text-xs text-gray-400">
                            Your private keys remain secure. Vincent uses Lit Protocol's PKPs for non-custodial authentication.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Authenticated - render children with context
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
                className="flex items-center gap-3 px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl hover:border-cyan-500/50 transition-all backdrop-blur-sm"
            >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-xs text-gray-400">Vincent PKP</p>
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
                    <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl z-[70] overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Vincent PKP</p>
                                        <p className="text-xs text-gray-400 font-mono">
                                            {formatAddress(user.pkpAddress)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                    title="Logout"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Permissions */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs font-medium text-green-400">Authenticated</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    {user.permissions.length} permissions granted
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-xl transition-colors text-red-400"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="text-sm">Logout</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};