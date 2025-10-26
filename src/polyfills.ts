// Polyfills for browser compatibility with Node.js packages
import { Buffer } from 'buffer';

// Create a minimal process object for browser
const processPolyfill = {
  env: {},
  browser: true,
  version: '',
  versions: {},
  nextTick: (fn: Function) => setTimeout(fn, 0),
  cwd: () => '/',
  platform: 'browser',
};

// Define Browser global that brotli expects
const browserPolyfill = {
  name: 'chrome',
  version: '120.0.0',
  platform: 'browser',
  // Mock the T function that brotli is trying to call
  T: () => new Uint8Array(),
  // Add other potential brotli functions
  compress: (input: any) => typeof input === 'string' ? new TextEncoder().encode(input) : input || new Uint8Array(),
  decompress: (input: any) => typeof input === 'string' ? input : new TextDecoder().decode(input || new Uint8Array()),
};

// Make all globals available
(globalThis as any).Buffer = Buffer;
(globalThis as any).process = processPolyfill;
(globalThis as any).global = globalThis;
(globalThis as any).Browser = browserPolyfill;

// Also set it on window for compatibility
if (typeof window !== 'undefined') {
  (window as any).Browser = browserPolyfill;
  (window as any).global = globalThis;
  (window as any).Buffer = Buffer;
  (window as any).process = processPolyfill;
}

export {};