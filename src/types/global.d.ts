declare global {
  namespace NodeJS {
    interface Global {
      import: {
        meta: {
          env: {
            VITE_FIREBASE_API_KEY: string;
            VITE_FIREBASE_AUTH_DOMAIN: string;
            VITE_FIREBASE_DATABASE_URL: string;
            VITE_FIREBASE_PROJECT_ID: string;
            VITE_FIREBASE_STORAGE_BUCKET: string;
            VITE_FIREBASE_MESSAGING_SENDER_ID: string;
            VITE_FIREBASE_APP_ID: string;
          }
        }
      }
    }
  }
}

export {}; 