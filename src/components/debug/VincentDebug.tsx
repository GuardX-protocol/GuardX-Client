import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const VincentDebug: React.FC = () => {
  const appId = import.meta.env.VITE_VINCENT_APP_ID || '5245122686';
  const currentUrl = window.location.href;
  const origin = window.location.origin;
  const isDev = import.meta.env.DEV;
  
  const getRedirectUri = () => {
    if (origin.includes('localhost')) {
      return `${origin}/`;
    }
    if (origin.includes('vercel.app') || origin.includes('guardx-protocol')) {
      return 'https://guardx-protocol.vercel.app/';
    }
    return `${origin}/`;
  };

  const redirectUri = getRedirectUri();
  const hasStoredJwt = !!localStorage.getItem('vincent_jwt');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const clearStorage = () => {
    localStorage.removeItem('vincent_jwt');
    sessionStorage.clear();
    toast.success('Storage cleared. Refresh the page.');
  };

  const configItems = [
    {
      label: 'App ID',
      value: appId,
      status: appId === "5245122686" ? 'success' : 'warning',
      expected: 'need app ID'
    },
    {
      label: 'Environment',
      value: isDev ? 'Development' : 'Production',
      status: 'info'
    },
    {
      label: 'Current URL',
      value: currentUrl,
      status: 'info'
    },
    {
      label: 'Origin',
      value: origin,
      status: 'info'
    },
    {
      label: 'Redirect URI',
      value: redirectUri,
      status: 'info'
    },
    {
      label: 'Stored JWT',
      value: hasStoredJwt ? 'Present' : 'None',
      status: hasStoredJwt ? 'success' : 'warning'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <div className="w-4 h-4 bg-orange-400 rounded-full" />;
    }
  };

  if (!isDev) {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <details className="bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden">
        <summary className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-medium text-white">Vincent Debug</span>
          </div>
        </summary>
        
        <div className="p-4 border-t border-gray-700/50 max-w-md">
          <h3 className="text-lg font-semibold text-white mb-4">Vincent Configuration</h3>
          
          <div className="space-y-3 mb-4">
            {configItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                {getStatusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-mono break-all">
                      {item.value}
                    </p>
                    <button
                      onClick={() => copyToClipboard(item.value)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3 w-3 text-gray-400" />
                    </button>
                  </div>
                  {item.expected && item.value !== item.expected && (
                    <p className="text-xs text-yellow-400 mt-1">
                      Expected: {item.expected}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white">Vincent Dashboard Setup</h4>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
              <p className="text-xs text-gray-300 mb-2">
                Add this redirect URI to Vincent Dashboard:
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-800 px-2 py-1 rounded text-cyan-400 flex-1">
                  {redirectUri}
                </code>
                <button
                  onClick={() => copyToClipboard(redirectUri)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Copy redirect URI"
                >
                  <Copy className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={clearStorage}
              className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
            >
              Clear Storage
            </button>
            <button
              onClick={() => window.open('https://vincent.lit.dev', '_blank')}
              className="flex-1 px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs hover:bg-cyan-500/30 transition-colors"
            >
              Vincent Dashboard
            </button>
          </div>
        </div>
      </details>
    </div>
  );
};

export default VincentDebug;