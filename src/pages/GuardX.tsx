import React, { useState } from 'react';
import {
    Shield,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    AlertTriangle,
    TrendingDown,
    Activity,
    Settings,
    Bell,
    Mail,
    MessageSquare,
    Loader2,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useGuardXUser, useGuardXMonitors, useGuardXAlerts } from '@/hooks/useGuardX';
import toast from 'react-hot-toast';

const GuardX: React.FC = () => {
    const { isConnected } = useAccount();
    const { user, createUser, updateUser, isLoading: userLoading } = useGuardXUser();
    const { monitors, createMonitor, updateMonitor, deleteMonitor, toggleMonitor, isLoading: monitorsLoading } = useGuardXMonitors();
    const { alerts, isLoading: alertsLoading } = useGuardXAlerts();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingMonitor, setEditingMonitor] = useState<any>(null);
    const [showUserSettings, setShowUserSettings] = useState(false);

    // Form states
    const [monitorForm, setMonitorForm] = useState({
        name: '',
        symbols: 'BTC,ETH',
        crash_threshold: 10,
        notification_channels: ['telegram'],
    });

    const [userForm, setUserForm] = useState({
        email: '',
        firstName: '',
        telegramId: '',
        notificationPreferences: {
            telegram_alerts: true,
            email_alerts: false,
            webhook_alerts: false,
        } as {
            telegram_alerts: boolean;
            email_alerts: boolean;
            webhook_alerts: boolean;
        },
    });

    React.useEffect(() => {
        if (user) {
            setUserForm({
                email: user.email || '',
                firstName: user.firstName || '',
                telegramId: user.telegramId || '',
                notificationPreferences: {
                    telegram_alerts: user.notificationPreferences?.telegram_alerts ?? true,
                    email_alerts: user.notificationPreferences?.email_alerts ?? false,
                    webhook_alerts: user.notificationPreferences?.webhook_alerts ?? false,
                },
            });
        }
    }, [user]);

    const handleCreateUser = async () => {
        try {
            await createUser({
                notificationPreferences: {
                    telegram_alerts: true,
                    email_alerts: false,
                    webhook_alerts: false,
                },
            });
        } catch (error) {
            console.error('Error creating GuardX user:', error);
        }
    };

    const handleCreateMonitor = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!monitorForm.name.trim() || !monitorForm.symbols.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            await createMonitor({
                name: monitorForm.name.trim(),
                symbols: monitorForm.symbols.split(',').map(s => s.trim().toUpperCase()),
                crash_threshold: monitorForm.crash_threshold,
                enabled: true,
                notification_channels: monitorForm.notification_channels,
            });

            setShowCreateForm(false);
            setMonitorForm({
                name: '',
                symbols: 'BTC,ETH',
                crash_threshold: 10,
                notification_channels: ['telegram'],
            });
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
                symbols: monitorForm.symbols.split(',').map(s => s.trim().toUpperCase()),
                crash_threshold: monitorForm.crash_threshold,
                notification_channels: monitorForm.notification_channels,
            });

            setEditingMonitor(null);
            setMonitorForm({
                name: '',
                symbols: 'BTC,ETH',
                crash_threshold: 10,
                notification_channels: ['telegram'],
            });
        } catch (error) {
            console.error('Error updating monitor:', error);
        }
    };

    const handleEditMonitor = (monitor: any) => {
        setEditingMonitor(monitor);
        setMonitorForm({
            name: monitor.name,
            symbols: monitor.symbols.join(','),
            crash_threshold: monitor.crash_threshold,
            notification_channels: monitor.notification_channels || ['telegram'],
        });
        setShowCreateForm(true);
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

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await updateUser(userForm);
            setShowUserSettings(false);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
                <div className="relative z-10 min-h-[80vh] flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center p-8 bg-black/50 rounded-2xl border border-red-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(255,66,6,0.3)]">
                        <Shield className="h-16 w-16 mx-auto mb-4 text-red-400" />
                        <h2 className="text-2xl font-bold text-white mb-3">Connect Wallet</h2>
                        <p className="text-gray-400">Connect your wallet to access GuardX AI monitoring</p>
                    </div>
                </div>
            </div>
        );
    }

    if (userLoading) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
                <div className="relative z-10 min-h-[80vh] flex items-center justify-center p-4">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-red-400" />
                        <span className="text-xl text-white">Loading GuardX...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
                <div className="relative z-10 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                                <Shield className="h-12 w-12 text-red-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-4">Welcome to GuardX AI</h1>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Enable AI-powered crash detection and get real-time alerts when market conditions become dangerous
                            </p>
                            <button
                                onClick={handleCreateUser}
                                className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-colors font-medium"
                            >
                                Enable GuardX Monitoring
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const activeMonitors = monitors.filter(m => m.enabled);
    const recentAlerts = alerts.slice(0, 5);

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
            <div className="relative z-10 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/30">
                                <Shield className="h-8 w-8 text-red-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">GuardX AI Monitoring</h1>
                                <p className="text-gray-400">AI-powered crash detection and alerts</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowUserSettings(true)}
                                className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                            >
                                <Settings className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                New Monitor
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity className="h-5 w-5 text-red-400" />
                                <span className="text-sm text-gray-400">Active Monitors</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{activeMonitors.length}</div>
                        </div>
                        <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingDown className="h-5 w-5 text-orange-400" />
                                <span className="text-sm text-gray-400">Total Alerts</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{alerts.length}</div>
                        </div>
                        <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="h-5 w-5 text-green-400" />
                                <span className="text-sm text-gray-400">Symbols Tracked</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {monitors.reduce((acc, m) => acc + m.symbols.length, 0)}
                            </div>
                        </div>
                        <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Bell className="h-5 w-5 text-purple-400" />
                                <span className="text-sm text-gray-400">Recent Alerts</span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {alerts.filter(a => new Date(a.crash_detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Monitors */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Your Monitors</h2>

                            {monitorsLoading ? (
                                <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-red-400" />
                                        <span className="ml-2 text-white">Loading monitors...</span>
                                    </div>
                                </div>
                            ) : monitors.length === 0 ? (
                                <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm text-center">
                                    <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-4">No monitors created yet</p>
                                    <button
                                        onClick={() => setShowCreateForm(true)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Create Your First Monitor
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {monitors.map((monitor, index) => (
                                        <div key={index} className="p-4 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${monitor.enabled ? 'bg-green-400' : 'bg-gray-500'}`} />
                                                    <h3 className="font-semibold text-white">{monitor.name}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleMonitor(monitor.name)}
                                                        className={`p-1 rounded transition-colors ${monitor.enabled
                                                            ? 'text-green-400 hover:text-green-300'
                                                            : 'text-gray-500 hover:text-gray-400'
                                                            }`}
                                                    >
                                                        {monitor.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditMonitor(monitor)}
                                                        className="p-1 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMonitor(monitor.name)}
                                                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">
                                                <strong>Symbols:</strong> {monitor.symbols.join(', ')}
                                            </div>
                                            <div className="text-sm text-gray-400 mb-2">
                                                <strong>Threshold:</strong> {monitor.crash_threshold}% price drop
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                <strong>Notifications:</strong> {monitor.notification_channels?.join(', ') || 'telegram'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Alerts */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white">Recent Alerts</h2>

                            {alertsLoading ? (
                                <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-red-400" />
                                        <span className="ml-2 text-white">Loading alerts...</span>
                                    </div>
                                </div>
                            ) : recentAlerts.length === 0 ? (
                                <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm text-center">
                                    <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">No alerts yet</p>
                                    <p className="text-sm text-gray-500 mt-2">Alerts will appear here when crashes are detected</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentAlerts.map((alert, index) => (
                                        <div key={index} className="p-4 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-red-400" />
                                                    <span className="font-semibold text-white">{alert.symbol}</span>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(alert.crash_detected_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                                <div>
                                                    <span className="text-gray-400">Price Drop:</span>
                                                    <span className="text-red-400 ml-2 font-medium">-{alert.price_drop.toFixed(1)}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-400">Probability:</span>
                                                    <span className="text-orange-400 ml-2 font-medium">{(alert.crash_probability * 100).toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-1 rounded text-xs ${alert.confidence_level === 'very_high' ? 'bg-red-500/20 text-red-400' :
                                                    alert.confidence_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {alert.confidence_level.replace('_', ' ')} confidence
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    ${alert.current_price.toFixed(2)}
                                                </span>
                                            </div>
                                            {alert.analysis && (
                                                <div className="mt-3 p-3 bg-gray-900/50 rounded text-xs text-gray-300">
                                                    {alert.analysis.substring(0, 200)}...
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Monitor Modal */}
            {showCreateForm && (
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">Symbols (comma-separated)</label>
                                <input
                                    type="text"
                                    value={monitorForm.symbols}
                                    onChange={(e) => setMonitorForm({ ...monitorForm, symbols: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                    placeholder="BTC,ETH,ADA"
                                    required
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
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Notification Channels</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={monitorForm.notification_channels.includes('telegram')}
                                            onChange={(e) => {
                                                const channels = e.target.checked
                                                    ? [...monitorForm.notification_channels, 'telegram']
                                                    : monitorForm.notification_channels.filter(c => c !== 'telegram');
                                                setMonitorForm({ ...monitorForm, notification_channels: channels });
                                            }}
                                            className="rounded"
                                        />
                                        <MessageSquare className="h-4 w-4 text-orange-400" />
                                        <span className="text-sm text-gray-300">Telegram</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={monitorForm.notification_channels.includes('email')}
                                            onChange={(e) => {
                                                const channels = e.target.checked
                                                    ? [...monitorForm.notification_channels, 'email']
                                                    : monitorForm.notification_channels.filter(c => c !== 'email');
                                                setMonitorForm({ ...monitorForm, notification_channels: channels });
                                            }}
                                            className="rounded"
                                        />
                                        <Mail className="h-4 w-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Email</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setEditingMonitor(null);
                                        setMonitorForm({
                                            name: '',
                                            symbols: 'BTC,ETH',
                                            crash_threshold: 10,
                                            notification_channels: ['telegram'],
                                        });
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

            {/* User Settings Modal */}
            {showUserSettings && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold text-white mb-4">User Settings</h3>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                                <input
                                    type="text"
                                    value={userForm.firstName}
                                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Telegram ID</label>
                                <input
                                    type="text"
                                    value={userForm.telegramId}
                                    onChange={(e) => setUserForm({ ...userForm, telegramId: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                    placeholder="123456789"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Notification Preferences</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={userForm.notificationPreferences.telegram_alerts}
                                            onChange={(e) => setUserForm({
                                                ...userForm,
                                                notificationPreferences: {
                                                    ...userForm.notificationPreferences,
                                                    telegram_alerts: e.target.checked,
                                                },
                                            })}
                                            className="rounded"
                                        />
                                        <MessageSquare className="h-4 w-4 text-orange-400" />
                                        <span className="text-sm text-gray-300">Telegram Alerts</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={userForm.notificationPreferences.email_alerts}
                                            onChange={(e) => setUserForm({
                                                ...userForm,
                                                notificationPreferences: {
                                                    ...userForm.notificationPreferences,
                                                    email_alerts: e.target.checked,
                                                },
                                            })}
                                            className="rounded"
                                        />
                                        <Mail className="h-4 w-4 text-green-400" />
                                        <span className="text-sm text-gray-300">Email Alerts</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUserSettings(false)}
                                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuardX;