/* Firebase SDK imports (v10) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyAMRV4fGPR7XobJjUd27a5F9cK3w8IBbAI",
    authDomain: "edu-lms-e2f94.firebaseapp.com",
    projectId: "edu-lms-e2f94",
    storageBucket: "edu-lms-e2f94.firebasestorage.app",
    messagingSenderId: "1023275038162",
    appId: "1:1023275038162:web:d746ff3b11ed64427c440b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
const ui = {
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    loginBtn: document.getElementById("loginBtn"),
    errorMsg: document.getElementById("errorMsg"),
    loginCard: document.getElementById("loginCard"),
    loader: document.getElementById("loader"),
    toggleBtn: document.getElementById("toggleBtn"),
    eyeIcon: document.getElementById("eyeIcon")
};

let isSubmitting = false;

// --- Helper: Toggle Loading State ---
const setLoading = (isLoading) => {
    if (isLoading) {
        ui.loader.classList.add('active');
        ui.loginBtn.disabled = true;
        ui.loginBtn.innerText = "Authenticating...";
    } else {
        ui.loader.classList.remove('active');
        ui.loginBtn.disabled = false;
        ui.loginBtn.innerText = "Log In";
    }
};

// --- Helper: Display Error with Animation ---
const displayError = (message) => {
    ui.errorMsg.innerText = message;
    ui.loginCard.classList.remove("shake");
    void ui.loginCard.offsetWidth; // Trigger reflow to restart animation
    ui.loginCard.classList.add("shake");
};

// --- Helper: Toggle Password Visibility ---
const togglePassword = () => {
    const type = ui.password.getAttribute("type") === "password" ? "text" : "password";
    ui.password.setAttribute("type", type);
    ui.eyeIcon.style.opacity = type === "text" ? "0.5" : "1";
};

// --- Core Logic: Check Role & Redirect ---
const checkUserRoleAndRedirect = async (user) => {
    try {
        // 1. Check 'users' collection (Students & Admins)
        let docRef = doc(db, "users", user.uid);
        let docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const role = docSnap.data().role;

            // Save session data
            localStorage.setItem('loggedInUserId', user.email);
            localStorage.setItem('userRole', role);

            if (role === "admin") {
                window.location.href = "admin-home.html";
            } else {
                window.location.href = "student-dashboard.html";
            }
            return;
        }

        // 2. Check 'teachers' collection
        docRef = doc(db, "teachers", user.uid);
        docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            localStorage.setItem('loggedInUserId', user.email);
            localStorage.setItem('userRole', 'teacher');
            window.location.href = "teacher-dashboard.html";
            return;
        }

        // 3. User authenticated but no profile found
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

// --- Login Handler (Email/Password) ---
const handleLogin = async () => {
    if (isSubmitting) return;

    const email = ui.email.value.trim();
    const password = ui.password.value;

    ui.errorMsg.innerText = "";

    if (!email || !password) {
        displayError("Please enter both email and password.");
        return;
    }

    isSubmitting = true;
    setLoading(true);

    try {
        // Set persistence so user stays logged in even after refresh
        await setPersistence(auth, browserLocalPersistence);

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await checkUserRoleAndRedirect(userCredential.user);

    } catch (error) {
        console.error("Login Error:", error.code);

        // Map Firebase errors to user-friendly messages
        const errorMap = {
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
        };

        displayError(errorMap[error.code] || "Login failed. Check your connection.");
        setLoading(false);
        isSubmitting = false;
    }
};

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    ui.toggleBtn.addEventListener("click", togglePassword);
    ui.loginBtn.addEventListener("click", handleLogin);

    // Allow "Enter" key to submit
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (document.activeElement === ui.email || document.activeElement === ui.password)) {
            handleLogin();
        }
    });
});
