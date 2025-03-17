import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/nrd-sgo/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true
    },
    css: {
      postcss: './postcss.config.cjs'
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/database']
          }
        }
      }
    },
    define: {
      __FIREBASE_CONFIG__: {
        apiKey: JSON.stringify(env.VITE_FIREBASE_API_KEY),
        authDomain: JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
        databaseURL: JSON.stringify(env.VITE_FIREBASE_DATABASE_URL),
        projectId: JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
        storageBucket: JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
        messagingSenderId: JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
        appId: JSON.stringify(env.VITE_FIREBASE_APP_ID)
      }
    }
  }
})
