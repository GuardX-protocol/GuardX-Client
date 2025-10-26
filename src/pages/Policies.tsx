import React, { useState } from 'react';
import { Shield, Plus, Edit, Trash2, Eye, EyeOff, AlertTriangle, TrendingDown, TrendingUp, Activity, Target, Bell, Search, Filter, CheckCircle, Info } from 'lucide-react';
import TokenSelector from '@/components/ui/TokenSelector';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { useGuardXUser, useGuardXMonitors, useGuardXAlerts, useGuardXPrices } from '@/hooks/useGuardX';
import toast from 'react-hot-toast';

const Policies: React.FC = () => {
  const { isAuthenticated } = useVincentAuth();
  const { user, createUser } = useGuardXUser();
  const { monitors, createMonitor, updateMonitor, deleteMonitor, toggleMonitor } = useGuardXMonitors();
  const { alerts } = useGuardXAlerts();
  const { prices, fetchPrices } = useGuardXPrices();

  const [showCreateMonitor, setShowCreateMonitor] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [monitorForm, setMonitorForm] = useState({
    name: '',
    symbols: [] as string[],
    crash_threshold: 10,
    notification_channels: ['telegram'],
  });

  const handleCreateUser = async () => {
    try {
      await createUser({
        notificationPreferences: {
          telegram_alerts: true,
          email_alerts: false,
          webhook_alerts: false,
        },
      });
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        // User already exists, show success message and refresh
        toast.success('Connected to existing GuardX account!');
        window.location.reload();
      } else {
        console.error('Error creating GuardX user:', error);
        toast.error('Failed to create GuardX account');
      }
    }
  };

  const handleCreateMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!monitorForm.name.trim() || monitorForm.symbols.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createMonitor({
        name: monitorForm.name.trim(),
        symbols: monitorForm.symbols,
        crash_threshold: monitorForm.crash_threshold,
        enabled: true,
        notification_channels: monitorForm.notification_channels,
      });
      
      setShowCreateMonitor(false);
      resetForm();
    } catch (error) {
      console.error('Error creating monitor:', error);
    }
  };

  const handleUpdateMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMonitor || !monitorForm.name.trim()) {
      return;
    }

    try {
      await updateMonitor(editingMonitor.name, {
        name: monitorForm.name.trim(),
        symbols: monitorForm.symbols,
        crash_threshold: monitorForm.crash_threshold,
        notification_channels: monitorForm.notification_channels,
      });
      
      setEditingMonitor(null);
      setShowCreateMonitor(false);
      resetForm();
    } catch (error) {
      console.error('Error updating monitor:', error);
    }
  };

  const handleEditMonitor = (monitor: any) => {
    setEditingMonitor(monitor);
    setMonitorForm({
      name: monitor.name,
      symbols: monitor.symbols || [],
      crash_threshold: monitor.crash_threshold,
      notification_channels: monitor.notification_channels || ['telegram'],
    });
    setShowCreateMonitor(true);
  };

  const handleDeleteMonitor = async (monitorName: string) => {
    if (window.confirm('Are you sure you want to delete this monitor?')) {
      try {
        await deleteMonitor(monitorName);
      } catch (error) {
        console.error('Error deleting monitor:', error);
      }
    }
  };

  const resetForm = () => {
    setMonitorForm({
      name: '',
      symbols: [],
      crash_threshold: 10,
      notification_channels: ['telegram'],
    });
  };

  // Fetch prices for monitor symbols
  React.useEffect(() => {
    const allSymbols = monitors.flatMap(m => m.symbols);
    if (allSymbols.length > 0) {
      fetchPrices(allSymbols);
    }
  }, [monitors, fetchPrices]);

  // Auto-refresh prices every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      const allSymbols = monitors.flatMap(m => m.symbols);
      if (allSymbols.length > 0) {
        fetchPrices(allSymbols);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [monitors, fetchPrices]);

  const getTokenPrice = (symbol: string) => {
    const priceData = prices[`${symbol}USDT`] || prices[symbol];
    return priceData ? {
      price: priceData.price,
      change: priceData.change_24h
    } : null;
  };

  // Filter monitors based on search and status
  const filteredMonitors = monitors.filter(monitor => {
    const matchesSearch = monitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         monitor.symbols.some(symbol => symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && monitor.enabled) ||
                         (filterStatus === 'inactive' && !monitor.enabled);
    return matchesSearch && matchesStatus;
  });

  // Require user to be onboarded before creating monitors
  if (!user && isAuthenticated) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
        <div className="relative z-10 min-h-[80vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center p-8 bg-black/50 rounded-2xl border border-red-500/30 backdrop-blur-sm">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <Shield className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-3">
              Complete Profile Setup
            </h2>
            <p className="text-gray-400 mb-6">Create your GuardX profile to start monitoring</p>
            <button
              onClick={handleCreateUser}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-orange-600 transition-colors"
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-30 animate-pulse">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-1/10 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/10 to-transparent"></div>
          <div className="relative p-8 bg-gray-900/50 rounded-2xl border border-red-500/30 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl border border-red-500/30">
                  <Shield className="h-10 w-10 text-red-400" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-400 via-white to-orange-400 bg-clip-text text-transparent mb-2">
                    AI Monitor Control
                  </h1>
                  <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-red-400" />
                    Advanced crash detection and protection
                  </p>
                </div>
              </div>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{monitors.filter(m => m.enabled).length}</div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{monitors.reduce((acc, m) => acc + m.symbols.length, 0)}</div>
                  <div className="text-xs text-gray-400">Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{alerts.length}</div>
                  <div className="text-xs text-gray-400">Alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters and Search */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-6 bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-red-400" />
                Filters
              </h3>
              
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search monitors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Status</label>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Monitors', count: monitors.length },
                    { id: 'active', label: 'Active', count: monitors.filter(m => m.enabled).length },
                    { id: 'inactive', label: 'Inactive', count: monitors.filter(m => !m.enabled).length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterStatus(filter.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterStatus === filter.id
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className="text-xs">{filter.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Monitor Button */}
              <button
                onClick={() => {
                  resetForm();
                  setEditingMonitor(null);
                  setShowCreateMonitor(true);
                }}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-orange-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Monitor
              </button>
            </div>
          </div>

          {/* Monitors Grid */}
          <div className="lg:col-span-3">
            {filteredMonitors.length === 0 ? (
              <div className="p-12 bg-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-700/20 to-gray-800/20 rounded-full flex items-center justify-center">
                  <Target className="h-10 w-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Monitors Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first monitor to start protecting your assets'
                  }
                </p>
                {!searchQuery && filterStatus === 'all' && (
                  <button
                    onClick={() => {
                      resetForm();
                      setEditingMonitor(null);
                      setShowCreateMonitor(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium hover:from-red-600 hover:to-orange-600 transition-colors"
                  >
                    Create Your First Monitor
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredMonitors.map((monitor, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] ${
                      monitor.enabled
                        ? 'bg-green-500/5 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]'
                        : 'bg-gray-900/50 border-gray-700/50'
                    }`}
                  >
                    {/* Monitor Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          monitor.enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                        }`} />
                        <h3 className="font-semibold text-white text-lg">{monitor.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleMonitor(monitor.id || monitor.name)}
                          className={`p-2 rounded-lg transition-colors ${
                            monitor.enabled 
                              ? 'text-green-400 hover:bg-green-500/20' 
                              : 'text-gray-500 hover:bg-gray-700/50'
                          }`}
                        >
                          {monitor.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEditMonitor(monitor)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMonitor(monitor.id || monitor.name)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Monitor Details */}
                    <div className="space-y-4">
                      {/* Threshold */}
                      <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-gray-300">Crash Threshold</span>
                        </div>
                        <span className="text-sm font-medium text-yellow-400">{monitor.crash_threshold}%</span>
                      </div>

                      {/* Tokens */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Activity className="h-4 w-4 text-red-400" />
                          Monitoring {monitor.symbols.length} tokens
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {monitor.symbols.slice(0, 6).map((symbol: string) => {
                            const priceInfo = getTokenPrice(symbol);
                            return (
                              <div
                                key={symbol}
                                className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                                  priceInfo?.change >= 0
                                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  <span>{symbol}</span>
                                  {priceInfo && (
                                    <>
                                      {priceInfo.change >= 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3" />
                                      )}
                                      <span>{priceInfo.change.toFixed(1)}%</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {monitor.symbols.length > 6 && (
                            <div className="px-3 py-1 bg-gray-700/50 text-gray-400 rounded-lg text-xs">
                              +{monitor.symbols.length - 6} more
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Notifications */}
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Bell className="h-4 w-4" />
                        <span>Notifications: {monitor.notification_channels.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isAuthenticated && (
          <div className="p-6 bg-black/50 rounded-2xl border border-red-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(255,66,6,0.2)]">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-white">Connect Your Wallet</p>
                <p className="text-sm text-gray-300 mt-1">
                  Connect your wallet to manage protection policies
                </p>
              </div>
            </div>
          </div>
        )}

          {/* AI Monitoring Section */}
          <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" />
                AI Crash Monitoring
              </h3>
              {user && (
                <button
                  onClick={() => setShowCreateMonitor(true)}
                  className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {!user ? (
              <div className="text-center py-6">
                <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Enable AI monitoring to get crash alerts</p>
                <button
                  onClick={handleCreateUser}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
                >
                  Enable AI Monitoring
                </button>
              </div>
            ) : (
              <div>
                {/* Monitor Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{monitors.filter(m => m.enabled).length}</div>
                    <div className="text-xs text-gray-400">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{monitors.reduce((acc, m) => acc + m.symbols.length, 0)}</div>
                    <div className="text-xs text-gray-400">Symbols</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{alerts.length}</div>
                    <div className="text-xs text-gray-400">Alerts</div>
                  </div>
                </div>

                {/* Monitors List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {monitors.map((monitor, index) => (
                    <div key={index} className="p-3 bg-gray-900/50 rounded-lg border border-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${monitor.enabled ? 'bg-green-400' : 'bg-gray-500'}`} />
                          <span className="font-medium text-white text-sm">{monitor.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleMonitor(monitor.id || monitor.name)}
                            className={`p-1 rounded transition-colors ${
                              monitor.enabled 
                                ? 'text-green-400 hover:text-green-300' 
                                : 'text-gray-500 hover:text-gray-400'
                            }`}
                          >
                            {monitor.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          </button>
                          <button
                            onClick={() => handleEditMonitor(monitor)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteMonitor(monitor.id || monitor.name)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>{monitor.symbols.join(', ')} • {monitor.crash_threshold}% threshold</div>
                        <div className="flex gap-2 flex-wrap">
                          {monitor.symbols.slice(0, 3).map((symbol: string) => {
                            const priceInfo = getTokenPrice(symbol);
                            return priceInfo ? (
                              <span key={symbol} className={`text-xs px-2 py-1 rounded ${ 
                                priceInfo.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {symbol}: ${priceInfo.price.toFixed(2)} ({priceInfo.change >= 0 ? '+' : ''}{priceInfo.change.toFixed(1)}%)
                              </span>
                            ) : (
                              <span key={symbol} className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-400">
                                {symbol}: Loading...
                              </span>
                            );
                          })}
                          {monitor.symbols.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{monitor.symbols.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {monitors.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm">No monitors created yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create/Edit Monitor Modal */}
        {showCreateMonitor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-white mb-4">
                {editingMonitor ? 'Edit Monitor' : 'Create New Monitor'}
              </h3>
              <form onSubmit={editingMonitor ? handleUpdateMonitor : handleCreateMonitor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Monitor Name</label>
                  <input
                    type="text"
                    value={monitorForm.name}
                    onChange={(e) => setMonitorForm({ ...monitorForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    placeholder="My Crypto Monitor"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Tokens to Monitor</label>
                  <TokenSelector
                    selectedTokens={monitorForm.symbols}
                    onTokensChange={(tokens) => setMonitorForm({ ...monitorForm, symbols: tokens })}
                    placeholder="Select tokens to monitor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Crash Threshold (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={monitorForm.crash_threshold}
                    onChange={(e) => setMonitorForm({ ...monitorForm, crash_threshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateMonitor(false);
                      setEditingMonitor(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
                  >
                    {editingMonitor ? 'Update' : 'Create'} Monitor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Create/Edit Monitor Modal */}
        {showCreateMonitor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30">
                    <Target className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {editingMonitor ? 'Edit Monitor' : 'Create Monitor'}
                    </h3>
                    <p className="text-gray-400 text-sm">Configure AI-powered crash detection</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateMonitor(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={editingMonitor ? handleUpdateMonitor : handleCreateMonitor} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Monitor Name</label>
                  <input
                    type="text"
                    value={monitorForm.name}
                    onChange={(e) => setMonitorForm({ ...monitorForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="My Crypto Monitor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Select Tokens to Monitor</label>
                  <TokenSelector
                    selectedTokens={monitorForm.symbols}
                    onTokensChange={(tokens) => setMonitorForm({ ...monitorForm, symbols: tokens })}
                    placeholder="Select tokens to monitor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Crash Threshold ({monitorForm.crash_threshold}%)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={monitorForm.crash_threshold}
                      onChange={(e) => setMonitorForm({ ...monitorForm, crash_threshold: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>1% (Very Sensitive)</span>
                      <span>50% (Less Sensitive)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Notification Channels</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'telegram', name: 'Telegram', icon: '📱' },
                      { id: 'email', name: 'Email', icon: '📧' },
                      { id: 'webhook', name: 'Webhook', icon: '🔗' },
                    ].map((channel) => (
                      <label
                        key={channel.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          monitorForm.notification_channels.includes(channel.id)
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-gray-800/30 border-gray-700/50 text-gray-300 hover:border-gray-600/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={monitorForm.notification_channels.includes(channel.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMonitorForm({
                                ...monitorForm,
                                notification_channels: [...monitorForm.notification_channels, channel.id]
                              });
                            } else {
                              setMonitorForm({
                                ...monitorForm,
                                notification_channels: monitorForm.notification_channels.filter(c => c !== channel.id)
                              });
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="text-xl">{channel.icon}</span>
                        <span className="font-medium">{channel.name}</span>
                        {monitorForm.notification_channels.includes(channel.id) && (
                          <CheckCircle className="h-4 w-4 ml-auto" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateMonitor(false)}
                    className="flex-1 px-6 py-3 border border-gray-600/50 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-colors font-medium"
                  >
                    {editingMonitor ? 'Update' : 'Create'} Monitor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
};

export default Policies;