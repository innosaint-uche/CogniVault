import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Safe helper to get environment variables
const getEnv = (key: string) => {
  try {
    return (typeof process !== 'undefined' && process.env?.[key]) || "";
  } catch (e) {
    return "";
  }
};

// REPLACE THESE VALUES WITH YOUR FIREBASE PROJECT CONFIGURATION
// You can find these in the Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY") || "YOUR_API_KEY_HERE",
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN") || "your-app.firebaseapp.com",
  projectId: getEnv("FIREBASE_PROJECT_ID") || "your-project-id",
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET") || "your-app.appspot.com",
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID") || "123456789",
  appId: getEnv("FIREBASE_APP_ID") || "1:123456789:web:abcdef"
};

let db: Firestore | null = null;

try {
  // Only initialize if we have somewhat valid config to avoid immediate crashes in demo mode
  // and ensure we are not running with placeholder values if we actually want to sync.
  // We check for "YOUR_API_KEY_HERE" which is the default placeholder.
  if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE" && firebaseConfig.apiKey !== "") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } else {
    console.warn("Firebase config missing. Realtime sync is disabled.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { db };