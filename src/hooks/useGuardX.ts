import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { guardxApi, type User, type Monitor, type MonitorAlert } from '@/services/guardxApi';
import toast from 'react-hot-toast';

export const useGuardXUser = () => {
  const { address } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const userData = await guardxApi.getUser(address);
      setUser(userData);
    } catch (err) {
      // User might not exist, that's okay
      console.log('User not found in GuardX system:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const createUser = useCallback(async (userData: Partial<User>) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const newUser = await guardxApi.createUser({
        walletAddress: address,
        ...userData,
      });
      setUser(newUser);
      toast.success('GuardX account created successfully!');
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await guardxApi.updateUser(address, userData);
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    fetchUser,
    createUser,
    updateUser,
  };
};

export const useGuardXMonitors = () => {
  const { address } = useAccount();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitors = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const monitorsData = await guardxApi.getMonitors(address);
      setMonitors(monitorsData);
    } catch (err) {
      console.log('No monitors found:', err);
      setMonitors([]);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const createMonitor = useCallback(async (monitorData: Partial<Monitor>) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const newMonitor = await guardxApi.createMonitor(address, monitorData);
      await fetchMonitors(); // Refresh the list
      toast.success('Monitor created successfully!');
      return newMonitor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create monitor';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, fetchMonitors]);

  const updateMonitor = useCallback(async (monitorId: string, monitorData: Partial<Monitor>) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedMonitor = await guardxApi.updateMonitor(monitorId, address, monitorData);
      await fetchMonitors(); // Refresh the list
      toast.success('Monitor updated successfully!');
      return updatedMonitor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update monitor';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, fetchMonitors]);

  const deleteMonitor = useCallback(async (monitorId: string) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      await guardxApi.deleteMonitor(monitorId, address);
      await fetchMonitors(); // Refresh the list
      toast.success('Monitor deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete monitor';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, fetchMonitors]);

  const toggleMonitor = useCallback(async (monitorId: string) => {
    if (!address) return;

    try {
      await guardxApi.toggleMonitor(monitorId, address);
      await fetchMonitors(); // Refresh the list
      toast.success('Monitor status updated!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle monitor';
      toast.error(errorMessage);
      throw err;
    }
  }, [address, fetchMonitors]);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  return {
    monitors,
    isLoading,
    error,
    fetchMonitors,
    createMonitor,
    updateMonitor,
    deleteMonitor,
    toggleMonitor,
  };
};

export const useGuardXAlerts = () => {
  const { address } = useAccount();
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async (options: {
    symbol?: string;
    severity?: string;
    limit?: number;
  } = {}) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const alertsData = await guardxApi.getAlerts({
        user_id: address,
        ...options,
      });
      setAlerts(alertsData);
    } catch (err) {
      console.log('No alerts found:', err);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const checkCrashAlerts = useCallback(async (symbols: string[]) => {
    if (!address) return null;

    try {
      return await guardxApi.checkCrashAlerts(address, symbols);
    } catch (err) {
      console.error('Error checking crash alerts:', err);
      return null;
    }
  }, [address]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    isLoading,
    error,
    fetchAlerts,
    checkCrashAlerts,
  };
};

export const useGuardXPrices = () => {
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async (symbols?: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const pricesData = await guardxApi.getPrices(symbols);
      setPrices(pricesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prices';
      setError(errorMessage);
      console.error('Error fetching prices:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPrice = useCallback(async (symbol: string) => {
    try {
      return await guardxApi.getPrice(symbol);
    } catch (err) {
      console.error(`Error fetching price for ${symbol}:`, err);
      return null;
    }
  }, []);

  const getRealTimePrice = useCallback(async (symbol: string) => {
    try {
      return await guardxApi.getRealTimePrice(symbol);
    } catch (err) {
      console.error(`Error fetching real-time price for ${symbol}:`, err);
      return null;
    }
  }, []);

  return {
    prices,
    isLoading,
    error,
    fetchPrices,
    getPrice,
    getRealTimePrice,
  };
};