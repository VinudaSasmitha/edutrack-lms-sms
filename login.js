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


/* Get DOM elements */
const ui = {
    email: document.getElementById("email"),           // Email input
    password: document.getElementById("password"),     // Password input
    loginBtn: document.getElementById("loginBtn"),     // Login button
    googleBtn: document.getElementById("googleBtn"),   // Google login button
    errorMsg: document.getElementById("errorMsg"),     // Error message area
    loginCard: document.getElementById("loginCard"),   // Login card (for animation)
    loader: document.getElementById("loader"),         // Loading spinner
    toggleBtn: document.getElementById("toggleBtn"),   // Show/Hide password button
    eyeIcon: document.getElementById("eyeIcon")        // Eye icon
};

// Prevent multiple submissions
let isSubmitting = false;

/*Show / hide loading state */
const setLoading = (isLoading) => {
    if (isLoading) {
        ui.loader.classList.add("active");      // Show loader
        ui.loginBtn.disabled = true;            // Disable buttons
        ui.googleBtn.disabled = true;
        ui.loginBtn.innerText = "Authenticating...";
    } else {
        ui.loader.classList.remove("active");   // Hide loader
        ui.loginBtn.disabled = false;
        ui.googleBtn.disabled = false;
        ui.loginBtn.innerText = "Log In";
    }
};