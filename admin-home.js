        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        // 1. Firebase Configuration
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
        const loader = document.getElementById("page-loader");

        // 2. Security Guard
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists() && userDoc.data().role === "admin") {
                        loader.style.opacity = "0"; // Fade out effect
                        setTimeout(() => { loader.style.display = "none"; }, 500);
                        window.showToast("Welcome Back", "Admin secure session active", "success");
                    } else {
                        alert("Access Denied: Admin privileges required.");
                        await signOut(auth);
                        window.location.href = "index.html";
                    }
                } catch (error) {
                    console.error("Auth Error:", error);
                    window.location.href = "index.html";
                }
            } else {
                window.location.href = "index.html";
            }
        });

        // 3. UI Functions
        window.showToast = (title, message, type = "success") => {
            const container = document.getElementById("toast-container");
            const toast = document.createElement("div");
            toast.className = `toast ${type}`;
            const iconClass = type === "success" ? "fa-circle-check" : "fa-triangle-exclamation";
            const iconColor = type === "success" ? "var(--success)" : "var(--danger)";

            toast.innerHTML = `
                <i class="fa-solid ${iconClass}" style="color:${iconColor}; font-size: 1.2rem; margin-top:2px;"></i>
                <div class="toast-content">
                    <span class="toast-title">${title}</span>
                    <span class="toast-msg">${message}</span>
                </div>
            `;
            container.appendChild(toast);

            // Auto remove
            setTimeout(() => {
                toast.style.animation = "fadeOut 0.4s ease-out forwards";
                setTimeout(() => toast.remove(), 400);
            }, 3500);
        };

        window.activateMenu = (element) => {
            document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
            element.classList.add('active');
        };

        window.logout = () => {
            if (confirm("End your admin session?")) {
                window.showToast('System', 'Securely logging out...', 'error');
                setTimeout(() => {
                    signOut(auth).then(() => {
                        window.location.href = "index.html";
                    });
                }, 1000);
            }
        };
