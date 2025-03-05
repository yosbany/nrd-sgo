import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCrq7Am9kiE3levq6hOGBuh_wb3lGxfdT0",
  authDomain: "nrd-sgo.firebaseapp.com",
  databaseURL: "https://nrd-sgo-default-rtdb.firebaseio.com",
  projectId: "nrd-sgo",
  storageBucket: "nrd-sgo.appspot.com",
  messagingSenderId: "386786255981",
  appId: "1:386786255981:web:95cabd428cf0ca17c58b64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

export default app; 