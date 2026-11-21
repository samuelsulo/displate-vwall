import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { displateProxy } from './proxy/displate-proxy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), displateProxy()],
  // The proxy is for local use only: never listen on the network.
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
