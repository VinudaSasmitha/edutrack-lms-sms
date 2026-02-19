import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMRV4fGPR7XobJjUd27a5F9cK3w8IBbAI",
    authDomain: "edu-lms-e2f94.firebaseapp.com",
    projectId: "edu-lms-e2f94",
    storageBucket: "edu-lms-e2f94.firebasestorage.app",
    messagingSenderId: "1023275038162",
    appId: "1:1023275038162:web:d746ff3b11ed64427c440b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const regBtn = document.getElementById("regBtn");
const errorMsg = document.getElementById("errorMsg");
const successMsg = document.getElementById("successMsg");

regBtn.addEventListener("click", async () => {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;

    errorMsg.innerText = "";
    successMsg.innerText = "";

    if (!name || !email || !password) {
        errorMsg.innerText = "Please fill in all fields.";
        return;
    }

    if (password.length < 6) {
        errorMsg.innerText = "Password must be at least 6 characters.";
        return;
    }

    regBtn.disabled = true;
    regBtn.innerText = "Creating Account...";

    try {
        // 1. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Check/Create Firestore Document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // New user - create document
            // Default role is 'student' unless it's a known admin email (optional check)

            // Check if there is an existing 'student' or 'user' doc with email ID (legacy data)
            // This handles the case where we used email as ID previously
            const legacyUserRef = doc(db, "users", email);
            const legacyUserSnap = await getDoc(legacyUserRef);

            let role = "student";
            let userData = {
                name: name,
                email: email,
                role: "student",
                createdAt: serverTimestamp()
            };

            if (legacyUserSnap.exists()) {
                // If they existed in the old system, copy their data/role
                const legacyData = legacyUserSnap.data();
                if (legacyData.role) role = legacyData.role;
                userData = { ...legacyData, ...userData, role: role }; // merge
            }

            // Create the new document with UID as key (best practice)
            await setDoc(userRef, userData);

            // Also update the legacy doc if it exists to link UID, or just leave it.
            // For now, we focus on ensuring the Auth UID doc exists.
        } else {
            // Document already exists for this UID (unlikely for new reg, but safe to handle)
            console.log("User document already exists.");
        }

        successMsg.innerText = "Account created successfully! Redirecting...";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    } catch (error) {
        console.error("Registration Error:", error);
        let msg = "Failed to create account.";
        if (error.code === 'auth/email-already-in-use') {
            msg = "Email is already registered. Please log in.";
        } else if (error.code === 'auth/invalid-email') {
            msg = "Invalid email address.";
        }
        errorMsg.innerText = msg;
        regBtn.disabled = false;
        regBtn.innerText = "Sign Up";
    }
});
