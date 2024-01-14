// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAT_eenN3lS26peDKTxWKa3H8qrl3DL5T4",
  authDomain: "multihangman-35515.firebaseapp.com",
  databaseURL: "https://multihangman-35515-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "multihangman-35515",
  storageBucket: "multihangman-35515.appspot.com",
  messagingSenderId: "1039000061263",
  appId: "1:1039000061263:web:2ab630cb2234e960f0b13a",
  // databaseURL: "https://multihangman-35515-default-rtdb.europe-west1.firebasedatabase.app/https://DATABASE_NAME.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);
export const database = getDatabase(initializeApp(firebaseConfig));