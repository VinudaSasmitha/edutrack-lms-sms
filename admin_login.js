        import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        import { getFirestore, collection, query, where, getDocs, setDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAPogMd6sxgXfrbyYRuYUeA6oLQWRqzR40",
            authDomain: "edutrack-6b6b9.firebaseapp.com",
            projectId: "edutrack-6b6b9",
            storageBucket: "edutrack-6b6b9.firebasestorage.app",
            messagingSenderId: "840560519321",
            appId: "1:840560519321:web:51d05538c609ba1c01f008"
        };

        // Initialize Main App
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // --- LOAD EXISTING ADMINS ---
        loadAdmins();

        async function loadAdmins() {
            const tableBody = document.getElementById("adminTable");
            tableBody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

            const q = query(collection(db, "users"), where("role", "==", "admin"));
            const snapshot = await getDocs(q);

            tableBody.innerHTML = "";
            snapshot.forEach(doc => {
                const user = doc.data();

                // Format Permissions for display
                let permTags = "";
                if (user.permissions) {
                    Object.keys(user.permissions).forEach(key => {
                        if (user.permissions[key]) {
                            permTags += `<span style="border:1px solid #ccc; padding:2px 5px; font-size:10px; border-radius:3px; margin-right:3px;">${key}</span>`;
                        }
                    });
                }

                tableBody.innerHTML += `
                    <tr>
                        <td>
                            <b>${user.name}</b><br>
                            <small style="color:gray">${user.nic || ''}</small>
                        </td>
                        <td><span class="badge badge-dept">${user.department}</span></td>
                        <td>${user.email}</td>
                        <td>${permTags}</td>
                        <td><button onclick="deleteAdmin('${doc.id}')" style="color:red; border:none; background:none; cursor:pointer;"><i class="fa fa-trash"></i></button></td>
                    </tr>
                `;
            });
        }

        // --- CREATE NEW ADMIN (The Special Part) ---
        document.getElementById("createAdminForm").addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("adminName").value;
            const email = document.getElementById("adminEmail").value;
            const password = document.getElementById("adminPassword").value;
            const phone = document.getElementById("adminPhone").value;
            const nic = document.getElementById("adminNic").value;
            const department = document.getElementById("adminDepartment").value;

            // Construct Permissions Object
            const permissions = {
                users: document.getElementById("perm_users").checked,
                enrollments: document.getElementById("perm_enroll").checked,
                payments: document.getElementById("perm_payments").checked,
                courses: document.getElementById("perm_courses").checked,
                reports: document.getElementById("perm_reports").checked,
                settings: document.getElementById("perm_settings").checked
            };

            try {
                // TRICK: Initialize a SECONDARY Firebase App to create user without logging out the current admin
                const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
                const secondaryAuth = getAuth(secondaryApp);

                // 1. Create Auth User (Login Access)
                const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
                const newUser = userCredential.user;

                // 2. Save Data to Firestore (Database)
                await setDoc(doc(db, "users", newUser.uid), {
                    role: "admin",
                    name: name,
                    email: email,
                    phone: phone,
                    nic: nic,
                    department: department,
                    permissions: permissions,
                    status: "active",
                    createdAt: serverTimestamp()
                });

                alert("Admin Created Successfully! They can login now.");
                closeModal();
                loadAdmins();

                // Cleanup secondary app
                // Note: In a real module system we might delete the app, but here we leave it or reload.

            } catch (error) {
                console.error("Error:", error);
                alert("Error creating admin: " + error.message);
            }
        });

        // Delete Function
        window.deleteAdmin = async (id) => {
            if (confirm("Remove this admin from database? (Note: Auth account must be disabled manually in Console)")) {
                await deleteDoc(doc(db, "users", id));
                loadAdmins();
            }
        };

        window.openModal = () => document.getElementById("adminModal").style.display = "flex";
        window.closeModal = () => document.getElementById("adminModal").style.display = "none";
