// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqDfVt7avsFJga37gMW7_Uep6qeBBy2dQ",
  authDomain: "stock-inventory-skp.firebaseapp.com",
  projectId: "stock-inventory-skp",
  storageBucket: "stock-inventory-skp.firebasestorage.app",
  messagingSenderId: "327038823366",
  appId: "1:327038823366:web:1457be754474a5b3fce0c7",
  measurementId: "G-N8FETMYD3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
