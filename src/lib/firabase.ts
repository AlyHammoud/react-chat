// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "react-chat-realtime-326c1.firebaseapp.com",
  projectId: "react-chat-realtime-326c1",
  storageBucket: "react-chat-realtime-326c1.appspot.com",
  messagingSenderId: "395156174229",
  appId: "1:395156174229:web:27822831ca94381b82b29c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
