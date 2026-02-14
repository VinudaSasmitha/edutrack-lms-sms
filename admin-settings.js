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

                showToast("Success", `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved!`, "success");
            } catch (error) {
                console.error("Save error:", error);
                showToast("Error", "Failed to save settings.", "error");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        };

        // --- PROFILE UPDATE ---
        window.updateProfile = async function (event) {
            event.preventDefault();

            // ✅ STEP 2: Write Guard
            if (!auth.currentUser) {
                showToast("Login required", "Session expired", "error");
                return;
            }

            const newName = document.getElementById('profileNameInput').value;

            try {
                // Update Auth Profile
                await updateProfile(auth.currentUser, { displayName: newName });

                // Update Firestore (✅ STEP 3: setDoc merge)
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    name: newName
                }, { merge: true });

                // Update UI immediately
                document.getElementById('adminNameDisplay').innerText = newName;
                document.getElementById('profileNameHead').innerText = newName;
                document.getElementById('profileAvatar').innerText = newName.charAt(0).toUpperCase();

                showToast("Profile Updated", "Your details have been saved.", "success");
            } catch (error) {
                console.error(error);
                showToast("Error", error.message, "error");
            }
        };

        // --- LOGOUT (✅ STEP 5) ---
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                signOut(auth).then(() => {
                    showToast("Logged Out", "Redirecting...", "success");
                    setTimeout(() => window.location.href = "login.html", 1000);
                }).catch((error) => {
                    showToast("Error", "Logout failed", "error");
                });
            });
        }

        // --- UI HELPERS (Tabs, Theme, Toast) ---

        // Tab Switching
        window.switchTab = function (tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

            document.getElementById(`tab-${tabId}`).classList.add('active');
            // Find the button that called this (simple logic)
            const buttons = document.querySelectorAll('.tab-btn');
            // Loop to match text icon logic or just rely on simple onclick binding in HTML
            // For this snippet, we assume the user clicks the button which triggers this.
            event.currentTarget.classList.add('active');
        };

        // Theme Toggle
        window.toggleTheme = function () {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            const icon = document.querySelector('.theme-toggle i');
            if (newTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        };

        // Apply Saved Theme on Load
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Toast Notification
        window.showToast = function (title, message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = `toast`;
            toast.style.borderLeftColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
            toast.innerHTML = `
            <div>
                <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" 
                   style="color: ${type === 'success' ? 'var(--success)' : 'var(--danger)'}; font-size: 1.2rem;"></i>
            </div>
            <div>
                <h4 style="margin-bottom: 2px; font-size: 0.95rem;">${title}</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted);">${message}</p>
            </div>
        `;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'slideInRight 0.4s reverse forwards';
                setTimeout(() => toast.remove(), 400);
            }, 3000);
        };

        // Helper: Load Settings into Input Fields
        function loadSettingsToForms(userData) {
            if (!userData.settings) return;

            // Recursively find inputs matching setting keys
            for (const section in userData.settings) {
                const sectionData = userData.settings[section];
                for (const key in sectionData) {
                    const input = document.querySelector(`[name="${key}"]`);
                    if (input) {
                        if (input.type === 'checkbox') {
                            input.checked = sectionData[key];
                        } else {
                            input.value = sectionData[key];
                        }
                    }
                }
            }
        }

        // --- TODO ITEMS (✅ STEP 6) ---

        // TODO: Implement real activity logs (Fetch from 'logs' collection)
        const logBody = document.getElementById('activityLogBody');
        if (logBody) {
            logBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color:var(--text-muted); padding: 20px;">
                    <i class="fa-solid fa-code"></i> Real logs coming soon (TODO)
                </td>
            </tr>
        `;
        }

        // TODO: Implement real backup generation
        window.sendPasswordReset = function () {
            showToast("Feature Pending", "Password reset email logic is TODO", "error");
        };
