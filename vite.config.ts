import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nrd-sgo/', // Repository name
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
