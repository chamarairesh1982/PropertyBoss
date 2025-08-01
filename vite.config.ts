import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the property portal.
// See https://vitejs.dev/config/ for more details.

export default defineConfig({
  plugins: [react()],
  define: {
    // Prevent Vite from replacing process.env with undefined at runtime.
    'process.env': {},
  },
  server: {
    port: 5173,
  },
});