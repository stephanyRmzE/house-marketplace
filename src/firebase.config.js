// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore}  from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyDXi_AAx9EyePqWWq1E3-aw0vh7IcZUX2I",
  authDomain: "house-marketplace-app-2c780.firebaseapp.com",
  projectId: "house-marketplace-app-2c780",
  storageBucket: "house-marketplace-app-2c780.appspot.com",
  messagingSenderId: "353009979156",
  appId: "1:353009979156:web:ee6eb5547bc73996d73c01"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore()
