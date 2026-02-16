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

        // --- AUTO ID GENERATION (T-2026-001) ---
        async function generateTeacherId() {
            const counterRef = doc(db, "counters", "teachers");
            const counterSnap = await getDoc(counterRef);
            let currentCount = 1;

            if (counterSnap.exists()) {
                currentCount = counterSnap.data().lastIndex + 1;
                await updateDoc(counterRef, { lastIndex: increment(1) });
            } else {
                await setDoc(counterRef, { lastIndex: 1 });
            }
            const year = new Date().getFullYear();
            return `T-${year}-${String(currentCount).padStart(3, '0')}`;
        }

        // --- SUBMIT LOGIC ---
        document.getElementById('teacherForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            if (assignedModules.length === 0) {
                alert("⚠️ Please assign at least one module!");
                return;
            }

            const loader = document.getElementById('loader');
            const loaderText = document.getElementById('loaderText');
            loader.style.display = 'flex';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value; // Temp password
            const name = document.getElementById('fullName').value;

            // ⚠️ SECONDARY APP to prevent logging out the current Admin
            let secondaryApp = null;

            try {
                // 1. Generate ID
                loaderText.innerText = "Generating ID...";
                const teacherId = await generateTeacherId();

                // 2. Create User (Using Secondary App)
                loaderText.innerText = "Creating Account...";

                // Initialize a temporary app instance for creating the user
                secondaryApp = initializeApp(firebaseConfig, "Secondary");
                const secondaryAuth = getAuth(secondaryApp);

                const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
                const user = userCredential.user;

                // 3. Upload Files
                loaderText.innerText = "Uploading Files...";
                const photoFile = document.getElementById('photo').files[0];
                const cvFile = document.getElementById('cv').files[0];

                let photoUrl = "";
                let cvUrl = "";

                if (photoFile) {
                    const photoRef = ref(storage, `teachers/${teacherId}/profile.jpg`);
                    await uploadBytes(photoRef, photoFile);
                    photoUrl = await getDownloadURL(photoRef);
                }

                if (cvFile) {
                    const cvRef = ref(storage, `teachers/${teacherId}/cv.pdf`);
                    await uploadBytes(cvRef, cvFile);
                    cvUrl = await getDownloadURL(cvRef);
                }

                // 4. Save to Database
                loaderText.innerText = "Finalizing...";
                const teacherData = {
                    teacherId: teacherId,
                    uid: user.uid,
                    personal: {
                        fullName: name,
                        nic: document.getElementById('nic').value,
                        mobile: document.getElementById('mobile').value,
                        address: document.getElementById('address').value,
                        photoUrl: photoUrl
                    },
                    professional: {
                        email: email,
                        role: "teacher",
                        status: "approved",
                        createdAt: serverTimestamp()
                    },
                    academic: {
                        qualification: document.getElementById('qualification').value,
                        experience: document.getElementById('experience').value,
                        cvUrl: cvUrl
                    },
                    assignments: {
                        modules: assignedModules
                    }
                };

                // Use the MAIN db instance to save (using admin/current user permissions)
                await setDoc(doc(db, "teachers", user.uid), teacherData);

                // Optional: Update profile on the secondary auth
                await updateProfile(user, { displayName: name, photoURL: photoUrl });
                await signOut(secondaryAuth); // Sign out the new teacher immediately

                alert(`✅ Teacher Enrolled Successfully!\n\nID: ${teacherId}\nPassword: ${password}\n\nPlease share these credentials with the teacher.`);
                window.location.reload();

            } catch (error) {
                console.error(error);
                alert("❌ Error: " + error.message);
            } finally {
                // Clean up the secondary app
                if (secondaryApp) {
                    await deleteApp(secondaryApp);
                }
                loader.style.display = 'none';
            }
        });

        // Auto generate a password on page load for convenience
        window.addEventListener('load', generatePassword);
