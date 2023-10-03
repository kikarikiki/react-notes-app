// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore, collection } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyIOp-hG_BxTEaVgkBX8tsaqL_CSa1APg",
  authDomain: "react-notes-app-75eb1.firebaseapp.com",
  projectId: "react-notes-app-75eb1",
  storageBucket: "react-notes-app-75eb1.appspot.com",
  messagingSenderId: "290677119786",
  appId: "1:290677119786:web:a066138a5f7232f646dc53"
};

// Initialize Firebase
//
const app = initializeApp(firebaseConfig);

// Return instance of database
const db = getFirestore(app)
// Access to notescollection
const notesCollection = collection(db, "notes")
