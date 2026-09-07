// lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import config from '../../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: config.apiKey || "AIzaSyBh7XjADaX3Yvr_76d900gpVFcZ-SD1-Ew",
  authDomain: config.authDomain || "final-stop-barbershop.firebaseapp.com",
  projectId: config.projectId || "final-stop-barbershop",
  storageBucket: config.storageBucket || "final-stop-barbershop.firebasestorage.app",
  messagingSenderId: config.messagingSenderId || "875741459221",
  appId: config.appId || "1:875741459221:web:125280f682a5e3ce7d6f1c",
  measurementId: config.measurementId || "G-E598X4CY9E"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics when supported in browser environment
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.debug('Firebase Analytics not supported in current environment', err);
  });
}

// Standard Google Sign-In without intrusive calendar or slides permissions

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google', error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};

