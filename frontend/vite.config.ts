import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.readFileSync('/app/certs/localhost+2-key.pem'),
      cert: fs.readFileSync('/app/certs/localhost+2.pem'),
    },
    hmr: {
      protocol: 'wss',
      host: 'localhost',
      port: 5173,
    },
  },
});