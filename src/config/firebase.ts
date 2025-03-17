import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

declare const __FIREBASE_CONFIG__: {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const firebaseConfig = __FIREBASE_CONFIG__;

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app); 