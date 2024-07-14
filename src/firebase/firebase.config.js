// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAkmEGqRic5WBqGqtZvJ8h0W1Mrv6xJq_o",
  authDomain: "hangout-ac670.firebaseapp.com",
  projectId: "hangout-ac670",
  storageBucket: "hangout-ac670.appspot.com",
  messagingSenderId: "515914754906",
  appId: "1:515914754906:web:5d53f5fb3b74ad013c6163",
  measurementId: "G-V378M2ESD0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
