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

                        // 2. Load UI Data
                        document.getElementById('adminNameDisplay').innerText = userData.name || "Admin";
                        document.getElementById('profileNameHead').innerText = userData.name || "Admin";
                        document.getElementById('profileNameInput').value = userData.name || "";
                        document.getElementById('profileEmailInput').value = user.email;
                        document.getElementById('profileAvatar').innerText = (userData.name || "A").charAt(0).toUpperCase();

                        // Load Settings into forms (Simulated loading for now, creates doc if empty)
                        loadSettingsToForms(userData);
                    }
                } catch (error) {
                    console.error("Error fetching admin profile:", error);
                    showToast("System Error", "Could not verify admin privileges", "error");
                }
            } else {
                // Not logged in -> Redirect
                window.location.href = "login.html";
            }
        });

        // --- SETTINGS MANAGEMENT (✅ STEP 3: setDoc merge) ---
        window.saveSettings = async function (event, section) {
            event.preventDefault();

            // ✅ STEP 2: Write Guard
            if (!currentUserUid) {
                showToast("Login required", "Please login first", "error");
                return;
            }

            const btn = event.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
            btn.disabled = true;

            // Gather Data from Form
            const formData = new FormData(event.target);
            const data = {};
            formData.forEach((value, key) => {
                // Convert 'on' to boolean for checkboxes
                if (event.target.querySelector(`[name="${key}"]`).type === 'checkbox') {
                    data[key] = true;
                } else {
                    data[key] = value;
                }
            });

            // Handle unchecked checkboxes (FormData ignores them)
            event.target.querySelectorAll('input[type="checkbox"]:not(:checked)').forEach(box => {
                data[box.name] = false;
            });

            try {
                // ✅ STEP 3: Use setDoc with merge:true
                // We save everything under the user's document for simplicity in this example
                // In a real app, you might have a separate 'settings' collection
                await setDoc(doc(db, "users", currentUserUid), {
                    settings: {
                        [section]: data
                    }
                }, { merge: true });

             
