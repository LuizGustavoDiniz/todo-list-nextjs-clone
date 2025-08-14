import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDHRxZnjQPNJSlYDYOIb1hd-6t9r_-TWbY",
  authDomain: "todolist-3661d.firebaseapp.com",
  projectId: "todolist-3661d",
  storageBucket: "todolist-3661d.firebasestorage.app",
  messagingSenderId: "692156166594",
  appId: "1:692156166594:web:c88039601ca8ad6912665b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

export { db }