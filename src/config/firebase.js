// Import the functions you need from the SDKs you needimport { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCW5zfmZCohJktWJPWDTlQ2OemrzcL0EA8",
  authDomain: "paper-management-e5968.firebaseapp.com",
  projectId: "paper-management-e5968",
  storageBucket: "paper-management-e5968.firebasestorage.app",
  messagingSenderId: "869098794554",
  appId: "1:869098794554:web:05f6d86fae0d04c4690f03",
  measurementId: "G-XELVYRLW69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);