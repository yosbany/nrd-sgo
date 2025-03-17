import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Verificar que todas las variables requeridas estén definidas
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

// Verificar cada variable y mostrar cuáles faltan
const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Log de todas las variables (ocultando la API key)
console.log('All environment variables present:', {
  VITE_FIREBASE_API_KEY: '***',
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_DATABASE_URL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID
});

// Configuración para producción
const prodConfig = {
  apiKey: "AIzaSyCdMDfbGDnJ39_BE3iCtvPOctdzd7W96A4",
  authDomain: "nrd-sgo-prod.firebaseapp.com",
  databaseURL: "https://nrd-sgo-prod-default-rtdb.firebaseio.com",
  projectId: "nrd-sgo-prod",
  storageBucket: "nrd-sgo-prod.firebasestorage.app",
  messagingSenderId: "95818518262",
  appId: "1:95818518262:web:5a77d39f5dee45877ae6d7"
};

// Configuración para desarrollo
const devConfig = {
  apiKey: "AIzaSyCrq7Am9kiE3levq6hOGBuh_wb3lGxfdT0",
  authDomain: "nrd-sgo.firebaseapp.com",
  databaseURL: "https://nrd-sgo-default-rtdb.firebaseio.com",
  projectId: "nrd-sgo",
  storageBucket: "nrd-sgo.firebasestorage.app",
  messagingSenderId: "386786255981",
  appId: "1:386786255981:web:95cabd428cf0ca17c58b64"
};

// Seleccionar la configuración según el ambiente
const firebaseConfig = import.meta.env.PROD ? prodConfig : devConfig;

// Log de la configuración (ocultando valores sensibles)
console.log(`Firebase configuration (${import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT'}):`, {
  ...firebaseConfig,
  apiKey: '***',
  messagingSenderId: '***',
  appId: '***'
});

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export const database = getDatabase(app);
export const auth = getAuth(app); 