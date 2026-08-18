import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// El proxy reenvía las peticiones /api al backend Express (puerto 4000).
// Así el frontend y la API comparten origen en desarrollo y la cookie httpOnly
// de sesión funciona sin configurar CORS en el navegador.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
