import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
        import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

        // 🔥 Paste Your Config Here
        const firebaseConfig = {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
            messagingSenderId: "YOUR_ID",
            appId: "YOUR_APP_ID"
        };

        // Main App (For Database & Storage)
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const storage = getStorage(app);

        // --- PASSWORD GENERATOR ---
        window.generatePassword = function () {
            const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789@#";
            let pass = "";
            for (let i = 0; i < 8; i++) {
                pass += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            document.getElementById('password').value = pass;
        }

        // --- MODULE SELECTION LOGIC ---
        let assignedModules = [];

        window.addModule = function () {
            const select = document.getElementById('moduleSelect');
            const value = select.value;
            if (value && !assignedModules.includes(value)) {
                assignedModules.push(value);
                renderModules();
            }
            select.value = "";
        }

        window.removeModule = function (modToRemove) {
            assignedModules = assignedModules.filter(mod => mod !== modToRemove);
            renderModules();
        }

        function renderModules() {
            const container = document.getElementById('moduleTagsContainer');
            if (assignedModules.length === 0) {
                container.innerHTML = '<span style="font-size: 12px; color: #94a3b8; font-style: italic;">No modules assigned yet.</span>';
                return;
            }
            container.innerHTML = assignedModules.map(mod => `
                <div class="tag">${mod} <i class="fas fa-times-circle" onclick="removeModule('${mod}')"></i></div>
            `).join('');
        }

