// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    "AIzaSyAGRbWwyxxL8KpaAGA3aOj2p-0Tz5c4Mkw",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "wasla-fdf21.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "wasla-fdf21",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "wasla-fdf21.firebasestorage.app",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "114509869401",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    "1:114509869401:web:03fd4405640b7c3eb4dc48",
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-Y778ZJFRT2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics with error handling
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn("Firebase Analytics initialization failed:", error);
  analytics = null;
}

export { analytics };

// Export the app instance
export default app;
