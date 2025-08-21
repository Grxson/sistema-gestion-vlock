import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './src/renderer',
  server: {
    port: 3001
  },
  build: {
    outDir: '../../build',
    emptyOutDir: true
  },
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  }
});
