        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import {
            getAuth,
            onAuthStateChanged,
            signOut,
            updateProfile
        } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
        import {
            getFirestore,
            doc,
            getDoc,
            setDoc
        } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

        // --- FIREBASE CONFIGURATION ---
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

        // Global State
        let currentUserUid = null;

        // --- AUTH LISTENER & ADMIN CHECK (✅ STEP 4) ---
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUserUid = user.uid;

                // 1. Check Admin Role in Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUserUid));

                    if (userDoc.exists()) {
                        const userData = userDoc.data();

                        // Critical Admin Check
                        if (userData.role !== "admin") {
                            alert("Access Denied: Admins only.");
                            window.location.href = "index.html"; // Redirect non-admins
                            return;
                        }
