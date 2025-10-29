import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.VERCEL ? '/' : './', // '/' para web (Vercel), './' para Electron
  root: './src/renderer',
  server: {
    port: 3000,
  },
  build: {
    outDir: process.env.VERCEL ? '../../dist' : '../../build',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500
  },
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  }
});
