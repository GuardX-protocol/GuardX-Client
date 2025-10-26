import React, { useState } from 'react';
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Plus,
  Settings,
  Activity,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useGuardXUser, useGuardXMonitors, useGuardXAlerts } from '@/hooks/useGuardX';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const GuardXMonitoringCard: React.FC = () => {
  const { user, createUser, isLoading: userLoading } = useGuardXUser();
  const { monitors, createMonitor, toggleMonitor } = useGuardXMonitors();
  const { alerts } = useGuardXAlerts();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMonitorName, setNewMonitorName] = useState('');
  const [newMonitorSymbols, setNewMonitorSymbols] = useState('BTC,ETH');
  const [newMonitorThreshold, setNewMonitorThreshold] = useState(10);

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
    
    if (!newMonitorName.trim() || !newMonitorSymbols.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createMonitor({
        name: newMonitorName.trim(),
        symbols: newMonitorSymbols.split(',').map(s => s.trim().toUpperCase()),
        crash_threshold: newMonitorThreshold,
        enabled: true,
        notification_channels: ['telegram'],
      });
      
      setShowCreateForm(false);
      setNewMonitorName('');
      setNewMonitorSymbols('BTC,ETH');
      setNewMonitorThreshold(10);
    } catch (error) {
      console.error('Error creating monitor:', error);
    }
  };

  const recentAlerts = alerts.slice(0, 3);
  const activeMonitors = monitors.filter(m => m.enabled);
  const totalSymbols = monitors.reduce((acc, m) => acc + m.symbols.length, 0);

  if (userLoading) {
    return (
      <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          <span className="ml-2 text-white">Loading GuardX status...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-6 w-6 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">GuardX AI Monitoring</h3>
        </div>
        
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
            <TrendingUp className="h-8 w-8 text-cyan-400" />
          </div>
          <h4 className="text-white font-medium mb-2">Enable AI Crash Detection</h4>
          <p className="text-gray-400 text-sm mb-4">
            Get real-time alerts when our AI detects potential market crashes
          </p>
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-colors"
          >
            Enable GuardX Monitoring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">GuardX AI Monitoring</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{activeMonitors.length}</div>
          <div className="text-xs text-gray-400">Active Monitors</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{totalSymbols}</div>
          <div className="text-xs text-gray-400">Symbols Tracked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{alerts.length}</div>
          <div className="text-xs text-gray-400">Total Alerts</div>
        </div>
      </div>

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            Recent Alerts
          </h4>
          <div className="space-y-2">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="p-3 bg-gray-900/50 rounded-lg border border-gray-800/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{alert.symbol}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.crash_detected_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-400">
                    -{alert.price_drop.toFixed(1)}% drop
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    alert.confidence_level === 'very_high' ? 'bg-red-500/20 text-red-400' :
                    alert.confidence_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {alert.confidence_level.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitors */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Monitors ({monitors.length})
          </h4>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="p-1 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateMonitor} className="mb-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800/50">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Monitor name"
                value={newMonitorName}
                onChange={(e) => setNewMonitorName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
              <input
                type="text"
                placeholder="Symbols (e.g., BTC,ETH,ADA)"
                value={newMonitorSymbols}
                onChange={(e) => setNewMonitorSymbols(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Threshold:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newMonitorThreshold}
                  onChange={(e) => setNewMonitorThreshold(Number(e.target.value))}
                  className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-500 text-white rounded text-sm hover:bg-cyan-600 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {monitors.map((monitor, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-800/50">
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{monitor.name}</div>
                <div className="text-xs text-gray-400">
                  {monitor.symbols.join(', ')} • {monitor.crash_threshold}% threshold
                </div>
              </div>
              <button
                onClick={() => toggleMonitor(monitor.name)}
                className={`p-1 rounded transition-colors ${
                  monitor.enabled 
                    ? 'text-green-400 hover:text-green-300' 
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                {monitor.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to="/app/guardx"
          className="flex-1 px-3 py-2 bg-gray-800 text-white rounded text-sm text-center hover:bg-gray-700 transition-colors"
        >
          View All
        </Link>
        <button className="px-3 py-2 bg-gray-800 text-gray-400 rounded text-sm hover:bg-gray-700 transition-colors">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default GuardXMonitoringCard;