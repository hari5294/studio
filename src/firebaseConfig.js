import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBKyV2J1wOkMQ2wEiGYRO6p675DzwL852o",
  authDomain: "badgese-e258f.firebaseapp.com",
  projectId: "badgese-e258f",
  storageBucket: "badgese-e258f.firebasestorage.app",
  messagingSenderId: "877963955625",
  appId: "1:877963955625:web:a21674fc078a0e30bc48b8",
  measurementId: "G-5ZGXZRLGZL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
