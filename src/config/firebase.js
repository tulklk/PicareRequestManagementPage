// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  // apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
  // authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT_ID,
  // storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  // appId: import.meta.env.REACT_APP_FIREBASE_APP_ID,
  // measurementId: import.meta.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  apiKey: "AIzaSyCEm5yiKbrO4jktVdea5RrSUeWAqMzhNHM",
  authDomain: "pp-management-e8ea7.firebaseapp.com",
  projectId: "pp-management-e8ea7",
  storageBucket: "pp-management-e8ea7.firebasestorage.app",
  messagingSenderId: "615869334261",
  appId: "1:615869334261:web:8d571743ddccdbcd083bbc",
  measurementId: "G-MYX2M72BW0"
  };

// Initialize Firebase
const storageApp = initializeApp(firebaseConfig, "storage");
const authApp = initializeApp(firebaseConfig, "auth");


export const storage = getStorage(storageApp);
export const auth = getAuth(authApp);
export const provider = new GoogleAuthProvider();