import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // proxy to Corteza so the SPA, API and auth server share an origin in dev
      // (avoids CORS/cross-site cookie issues, matching how Corteza's own webapps run)
      // Explicit 127.0.0.1 (not localhost): Node 18+ resolves localhost to ::1 first,
      // but Corteza's docker-compose only binds the port on 127.0.0.1 (IPv4).
      '/api': 'http://127.0.0.1:18080',
      '/auth': 'http://127.0.0.1:18080',
    },
  },
})
