import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // proxy to Corteza so the SPA, API and auth server share an origin in dev
      // (avoids CORS/cross-site cookie issues, matching how Corteza's own webapps run)
      '/api': 'http://localhost:18080',
      '/auth': 'http://localhost:18080',
    },
  },
})
