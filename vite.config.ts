import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sgo-app/',
  server: {
    port: 3000,
    open: true
  },
  css: {
    postcss: './postcss.config.cjs'
  }
})
