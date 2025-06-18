import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/_variables.scss"; @import "@/styles/_mixins.scss";'
      }
    }
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000
    },
    allowedHosts: ['0.0.0.0', 'localhost', '127.0.0.1', '09a9-164-163-34-186.ngrok-free.app', 'gestao.controleobras.online'],
    host: '0.0.0.0',
    port: 3000,
    hmr: {
      clientPort: 3000
    }
  }
})
