import React, { useState } from 'react';
import {
  User,
  Mail,
  MessageSquare,
  Bell,
  Settings,
  Edit,
  Save,
  X,
  ExternalLink,
  Shield,
  Activity,
  Loader2,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useGuardXUser } from '@/hooks/useGuardX';
import toast from 'react-hot-toast';

const ProfileManagement: React.FC = () => {
  const { address } = useAccount();
  const { user, createUser, updateUser, isLoading } = useGuardXUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    telegramId: '',
    notificationPreferences: {
      telegram_alerts: true,
      email_alerts: false,
      webhook_alerts: false,
    },
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        telegramId: user.telegramId || '',
        notificationPreferences: {
          telegram_alerts: user.notificationPreferences?.telegram_alerts ?? true,
          email_alerts: user.notificationPreferences?.email_alerts ?? false,
          webhook_alerts: user.notificationPreferences?.webhook_alerts ?? false,
        },
      });
    }
  }, [user]);

  const handleCreateProfile = async () => {
    try {
      await createUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        notificationPreferences: formData.notificationPreferences,
      });
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleTelegramSetup = () => {
    window.open('https://t.me/guardx_detector_bot', '_blank');
    toast.success('Opening Telegram bot. Send /start to begin setup!');
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
          <span className="ml-2 text-white">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-6 w-6 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Profile Setup</h3>
        </div>
        
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
            <User className="h-8 w-8 text-cyan-400" />
          </div>
          <h4 className="text-white font-medium mb-2">Create Your Profile</h4>
          <p className="text-gray-400 text-sm mb-4">
            Set up your profile to enable notifications and personalized features
          </p>
          <button
            onClick={handleCreateProfile}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-colors"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Profile</h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                placeholder="Doe"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Telegram ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.telegramId}
                onChange={(e) => setFormData({ ...formData, telegramId: e.target.value })}
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                placeholder="123456789"
                readOnly
              />
              <button
                type="button"
                onClick={handleTelegramSetup}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Setup
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click Setup to connect with our Telegram bot
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notification Preferences</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notificationPreferences.telegram_alerts}
                  onChange={(e) => setFormData({
                    ...formData,
                    notificationPreferences: {
                      ...formData.notificationPreferences,
                      telegram_alerts: e.target.checked,
                    },
                  })}
                  className="rounded"
                />
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Telegram Alerts</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notificationPreferences.email_alerts}
                  onChange={(e) => setFormData({
                    ...formData,
                    notificationPreferences: {
                      ...formData.notificationPreferences,
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
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">Name</span>
              </div>
              <p className="text-white">
                {user.firstName || user.lastName 
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : 'Not set'
                }
              </p>
            </div>
            
            <div className="p-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">Email</span>
              </div>
              <p className="text-white">{user.email || 'Not set'}</p>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-400">Wallet Address</span>
            </div>
            <p className="text-white font-mono text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          {/* Telegram Status */}
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">Telegram</span>
              </div>
              {!user.telegramId && (
                <button
                  onClick={handleTelegramSetup}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Setup
                </button>
              )}
            </div>
            <p className="text-white">
              {user.telegramId ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  Not connected
                </span>
              )}
            </p>
          </div>

          {/* Notification Preferences */}
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-400">Notifications</span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  user.notificationPreferences?.telegram_alerts ? 'bg-green-400' : 'bg-gray-500'
                }`} />
                <span className="text-sm text-white">Telegram</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  user.notificationPreferences?.email_alerts ? 'bg-green-400' : 'bg-gray-500'
                }`} />
                <span className="text-sm text-white">Email</span>
              </div>
            </div>
          </div>

          {/* Account Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-900/50 rounded-lg text-center">
              <Activity className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{user.monitors?.length || 0}</div>
              <div className="text-xs text-gray-400">Monitors</div>
            </div>
            <div className="p-3 bg-gray-900/50 rounded-lg text-center">
              <Settings className="h-4 w-4 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">
                {user.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <div className="text-xs text-gray-400">Days Active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;