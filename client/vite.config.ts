import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/auth': 'http://localhost:4000',
      '/me': 'http://localhost:4000',
      '/contacts': 'http://localhost:4000',
      '/shares': 'http://localhost:4000',
      '/sos': 'http://localhost:4000',
      '/places': 'http://localhost:4000',
      '/v': 'http://localhost:4000',
      '/ws': {
        target: 'ws://localhost:4000',
        ws: true,
      },
    },
  },
});
