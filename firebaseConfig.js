// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBznRtFJckoIqDTtXBB3WjL9DeLm3IhCPU",
  authDomain: "notebookapp-d52a5.firebaseapp.com",
  projectId: "notebookapp-d52a5",
  storageBucket: "notebookapp-d52a5.firebasestorage.app",
  messagingSenderId: "941457293257",
  appId: "1:941457293257:web:3a222d2a6efd1a0ca03218",
  measurementId: "G-BZ974ZFR83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
export { app, db }
