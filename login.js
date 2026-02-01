/* Firebase SDK imports (v10) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


/* Firebase configuration */
const firebaseConfig = {
    apiKey: "AIzaSyAMRV4fGPR7XobJjUd27a5F9cK3w8IBbAI",
    authDomain: "edu-lms-e2f94.firebaseapp.com",
    projectId: "edu-lms-e2f94",
    storageBucket: "edu-lms-e2f94.firebasestorage.app",
    messagingSenderId: "1023275038162",
    appId: "1:1023275038162:web:d746ff3b11ed64427c440b"
};

/* Initialize Firebase services */
const app = initializeApp(firebaseConfig); // Initialize app
const auth = getAuth(app);                // Firebase Authentication
const db = getFirestore(app);             // Firestore Database