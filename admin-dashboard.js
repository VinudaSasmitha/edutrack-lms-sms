 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        import {
            getFirestore,
            doc,
            getDoc,
            collection,
            query,
            where,
            orderBy,
            limit,
            getDocs,
            getCountFromServer
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        // 1. Firebase Config
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

        // 2. Main Logic
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // A. Load Admin Name
                loadAdminProfile(user.uid);

                // B. Load Dashboard Stats
                loadDashboardStats();

                // C. Load Recent Users Table
                loadRecentUsers();
            } else {
                // Not logged in, redirect to login via parent
                window.parent.location.href = "login.html";
            }
        });

        // --- Functions ---

        // A. Get Admin Name
        async function loadAdminProfile(uid) {
            try {
                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const name = data.name || "Admin";
                    document.getElementById("adminName").innerText = name;
                    document.getElementById("adminName").classList.remove("skeleton");
                    document.getElementById("adminAvatar").innerText = name.charAt(0).toUpperCase();
                }
            } catch (e) {
                console.error("Profile Error", e);
            }
        }

        // B. Get Stats (Total Students)
        async function loadDashboardStats() {
            try {
                // Count documents where role == 'student'
                const usersColl = collection(db, "users");
                const q = query(usersColl, where("role", "==", "student"));
                const snapshot = await getCountFromServer(q);

                const count = snapshot.data().count;
                const el = document.getElementById("statStudents");

                // Animation for numbers
                animateValue(el, 0, count, 1000);
                el.classList.remove("skeleton");

            } catch (e) {
                console.error("Stats Error", e);
                document.getElementById("statStudents").innerText = "0";
            }
        }

        // C. Get Recent Registrations
        async function loadRecentUsers() {
            const tableBody = document.getElementById("recentUsersTable");
            try {
                // Query: Get Users, sort by date (desc), limit to 5
                const usersColl = collection(db, "users");
                const q = query(usersColl, orderBy("createdAt", "desc"), limit(5));

                const querySnapshot = await getDocs(q);
                tableBody.innerHTML = ""; // Clear loader

                if (querySnapshot.empty) {
                    tableBody.innerHTML = "<tr><td colspan='3' style='text-align:center'>No registrations yet.</td></tr>";
                    return;
                }

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const status = data.status || "pending";
                    let badgeClass = "bg-pending";

                    if (status === 'active') badgeClass = "bg-active";
                    if (status === 'blocked') badgeClass = "bg-blocked";

                    const row = `
                        <tr>
                            <td>
                                <div style="font-weight:500;">${data.name || "Unknown"}</div>
                                <div style="font-size:0.75rem; color:#94a3b8;">${data.role || "student"}</div>
                            </td>
                            <td>${data.email}</td>
                            <td><span class="status-badge ${badgeClass}">${status}</span></td>
                        </tr>
                    `;
                    tableBody.innerHTML += row;
                });

            } catch (e) {
                console.error("Table Error", e);
                // Check for Index Error (Common in Firestore)
                if (e.message.includes("index")) {
                    tableBody.innerHTML = "<tr><td colspan='3' style='color:orange; text-align:center;'>Dev Note: Create Firestore Index (See Console)</td></tr>";
                } else {
                    tableBody.innerHTML = "<tr><td colspan='3' style='text-align:center'>Error loading data.</td></tr>";
                }
            }
        }

        // Simple Number Animation Function
        function animateValue(obj, start, end, duration) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                obj.innerHTML = Math.floor(progress * (end - start) + start);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        }
