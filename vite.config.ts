import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wagmi: ['wagmi', 'viem', '@wagmi/core'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wagmi',
      'viem',
      'buffer',
      'process',
      'util',
      'bn.js',
      'bignumber.js',
    ],
    exclude: [
      '@account-kit/smart-contracts',
      '@coinbase/wallet-sdk',
    ],
    esbuildOptions: {
      // Handle CommonJS modules properly
      mainFields: ['module', 'main'],
      conditions: ['import', 'module', 'browser', 'default'],
    },
    force: true,
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.browser': true,
    'Browser.T': '(() => new Uint8Array())',
  },
});