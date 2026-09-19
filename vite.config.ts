import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

/** Upstream for the optional `/api/v2` dev proxy — see `.env-example`. */
const XENOCHOICE_ORIGIN = 'http://80.78.247.32:8080';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), glsl()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Only used when VITE_XENOCHOICE_API_URL is set to the relative `/api/v2`.
      '/api/v2': {
        target: XENOCHOICE_ORIGIN,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
