import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // base se inyecta via VITE_PROXY_BASE para que todos los paths de assets
  // apunten al proxy del backend en lugar de a la raiz del dominio.
  base: process.env.VITE_PROXY_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
  server: {
    host: '127.0.0.1',
    strictPort: true,
    allowedHosts: true,
    // HMR desactivado: el browser no puede hacer WebSocket a 127.0.0.1 directamente.
    // El refresh se maneja via previewNonce en el Studio cuando hay ediciones.
    hmr: false,
  },
  clearScreen: false,
});
