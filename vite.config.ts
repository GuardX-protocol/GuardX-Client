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
      '/api/coinmarketcap': {
        target: 'https://sandbox-api.coinmarketcap.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coinmarketcap/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-CMC_PRO_API_KEY', 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c');
            proxyReq.setHeader('Accept', 'application/json');
          });
        },
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
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
    include: ['react', 'react-dom', 'wagmi', 'viem'],
  },
});