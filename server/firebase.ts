// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4_567dcodjHlx1T4zdOsIRYgLD45dLRU",
  authDomain: "goaltrireserve-manage.firebaseapp.com",
  projectId: "goaltrireserve-manage",
  storageBucket: "goaltrireserve-manage.firebasestorage.app",
  messagingSenderId: "813446515183",
  appId: "1:813446515183:web:ec4f46d9b117bd9d678e1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

// Read firebase credentials securely
const CONFIG_PATH = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};

try {
  if (fs.existsSync(CONFIG_PATH)) {
    firebaseConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } else {
    console.error('[FIREBASE]: Credentials file not found at:', CONFIG_PATH);
  }
} catch (e) {
  console.error('[FIREBASE CONFIG EXCEPTION]: Error parsing configurations:', e);
}

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without this line passing the firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'ai-studio-22548b9b-b157-4d35-8a28-79744d6730b1');
export const auth = getAuth(app);

// Server admin authentication routine for Firebase/Firestore operations
export async function authenticateServer() {
  console.log('[FIREBASE AUTH]: Authenticating server as admin@canchafutbol.com...');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, 'admin@canchafutbol.com', 'admin');
    console.log('[FIREBASE AUTH]: Server authenticated successfully with UID:', userCredential.user.uid);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || String(err).includes('credential')) {
      console.log('[FIREBASE AUTH]: Admin user not found in Auth. Creating admin user in Firebase Auth...');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, 'admin@canchafutbol.com', 'admin');
        console.log('[FIREBASE AUTH]: Admin user generated and signed in successfully with UID:', userCredential.user.uid);
      } catch (createErr) {
        console.error('[FIREBASE AUTH EXCEPTION] Failed to register admin user:', createErr);
        throw createErr;
      }
    } else {
      console.error('[FIREBASE AUTH EXCEPTION] Error signing in:', err);
      throw err;
    }
  }
}

// Core connection validation constraint
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[FIREBASE CONNECTION SUCCESS]: Connected to Firestore database:', firebaseConfig.firestoreDatabaseId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('[FIREBASE CONNECTION ERROR]: Please check your configuration. The client is offline.');
    } else {
      console.log('[FIREBASE CONNECTION]: Optional ping verification finished:', error instanceof Error ? error.message : String(error));
    }
  }
}

testConnection();

