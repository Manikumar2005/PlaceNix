import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAi3Z8BQQkcMSqde6Pbc6S7C4EbLePhC9U",
  authDomain: "placenix.firebaseapp.com",
  projectId: "placenix",
  storageBucket: "placenix.firebasestorage.app",
  messagingSenderId: "340139234150",
  appId: "1:340139234150:web:bc123daa0854c26b692ea7",
  measurementId: "G-N56063L4TE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
