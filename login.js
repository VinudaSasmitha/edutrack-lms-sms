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

/* -----------------------------
       Display error with animation
       ----------------------------- */
const displayError = (message) => {
    ui.errorMsg.innerText = message;             // Show error text
    ui.loginCard.classList.remove("shake");     // Reset animation
    void ui.loginCard.offsetWidth;              // Force reflow
    ui.loginCard.classList.add("shake");        // Shake card
};

/* -----------------------------
   Toggle password visibility
   ----------------------------- */
const togglePassword = () => {
    const type =
        ui.password.getAttribute("type") === "password"
            ? "text"
            : "password";

    ui.password.setAttribute("type", type);      // Change input type
    ui.eyeIcon.style.opacity = type === "text" ? "0.5" : "1";
};

/*    Check user role & redirect to correct dashboard */
const checkUserRoleAndRedirect = async (user) => {
    try {
        /* ---- 1. Check users collection (Admin / Student) ---- */
        let docRef = doc(db, "users", user.uid);
        let docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const role = docSnap.data().role;

            if (role === "admin") {
                window.location.href = "admin-home.html";
            } else {
                window.location.href = "student-dashboard.html";
            }
            return;
        }

        /* ---- 2. Check teachers collection ---- */
        docRef = doc(db, "teachers", user.uid);
        docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            window.location.href = "teacher-dashboard.html";
            return;
        }

        /* ---- 3. No profile found ---- */
        setLoading(false);
        displayError("Account exists but no profile found. Contact Admin.");
        isSubmitting = false;

    } catch (error) {
        console.error("Database Error:", error);
        setLoading(false);
        displayError("System error. Please try again.");
        isSubmitting = false;
    }
};


/* -----------------------------
       Email & Password login
       ----------------------------- */
const handleLogin = async () => {
    if (isSubmitting) return;

    const email = ui.email.value.trim();
    const password = ui.password.value;

    ui.errorMsg.innerText = "";

    // Validate inputs
    if (!email || !password) {
        displayError("Please enter both email and password.");
        return;
    }

    isSubmitting = true;
    setLoading(true);

    try {
        // Keep user logged in after refresh
        await setPersistence(auth, browserLocalPersistence);

        // Firebase sign-in
        const userCredential =
            await signInWithEmailAndPassword(auth, email, password);

        // Redirect based on role
        await checkUserRoleAndRedirect(userCredential.user);

    } catch (error) {
        console.error("Login Error:", error.code);

        // Friendly error messages
        const errorMap = {
            "auth/invalid-credential": "Invalid email or password.",
            "auth/user-not-found": "No account found with this email.",
            "auth/wrong-password": "Incorrect password.",
            "auth/too-many-requests": "Too many failed attempts. Try later."
        };

        displayError(
            errorMap[error.code] || "Login failed. Check your connection."
        );

        setLoading(false);
        isSubmitting = false;
    }
};

/* Google Sign-In login */
const handleGoogleLogin = async () => {
    if (isSubmitting) return;

    const provider = new GoogleAuthProvider();
    isSubmitting = true;
    setLoading(true);

    try {
        await setPersistence(auth, browserLocalPersistence);

        // Google popup login
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user already exists
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        // If new user → create student profile
        if (!docSnap.exists()) {
            await setDoc(docRef, {
                email: user.email,
                role: "student",
                createdAt: serverTimestamp(),
                method: "google"
            });
        }

        await checkUserRoleAndRedirect(user);

    } catch (error) {
        console.error("Google Auth Error:", error);
        setLoading(false);
        isSubmitting = false;
        displayError("Google Sign-In failed.");
    }
};

/*check Event listeners */
document.addEventListener("DOMContentLoaded", () => {
    ui.toggleBtn.addEventListener("click", togglePassword);
    ui.loginBtn.addEventListener("click", handleLogin);
    ui.googleBtn.addEventListener("click", handleGoogleLogin);

    // Press Enter to login
    document.addEventListener("keydown", (e) => {
        if (
            e.key === "Enter" &&
            (document.activeElement === ui.email ||
                document.activeElement === ui.password)
        ) {
            handleLogin();
        }
    });
});
