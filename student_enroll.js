        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
        import { getFirestore, doc, runTransaction, serverTimestamp, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
        import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

        // 🔥 Your Firebase Configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAMRV4fGPR7XobJjUd27a5F9cK3w8IBbAI",
            authDomain: "edu-lms-e2f94.firebaseapp.com",
            projectId: "edu-lms-e2f94",
            storageBucket: "edu-lms-e2f94.firebasestorage.app",
            messagingSenderId: "1023275038162",
            appId: "1:1023275038162:web:d746ff3b11ed64427c440b"
        };

        // Initialize Main App
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const storage = getStorage(app);

        // --- PASSWORD GENERATOR FUNCTION ---
        window.generateStudentPass = function () {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            document.getElementById('tempPassword').value = "Stu@" + randomNum;
        }

        // --- 1. Real-time Financial Calculator ---
        function calculateFinance() {
            const total = parseFloat(document.getElementById('feeTotal').value) || 0;
            const discount = parseFloat(document.getElementById('feeDiscount').value) || 0;
            const paid = parseFloat(document.getElementById('feePaid').value) || 0;

            const finalTotal = total - discount;
            const balance = finalTotal - paid;

            const balanceField = document.getElementById('feeBalance');
            const statusText = document.getElementById('statusText');

            balanceField.value = balance.toFixed(2);

            if (balance <= 0 && finalTotal > 0) {
                statusText.innerText = "FULLY PAID ✅"; statusText.style.color = "var(--success)";
            } else if (paid > 0) {
                statusText.innerText = "PARTIAL PAYMENT ⚠️"; statusText.style.color = "#ca8a04";
            } else {
                statusText.innerText = "PENDING ❌"; statusText.style.color = "var(--danger)";
            }
        }

        ['feeTotal', 'feeDiscount', 'feePaid'].forEach(id => {
            document.getElementById(id).addEventListener('input', calculateFinance);
        });

        // --- 2. File Upload Helper ---
        async function uploadDoc(file, path) {
            if (!file) return null;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            return await getDownloadURL(storageRef);
        }

        // --- 3. MAIN SUBMISSION LOGIC ---
        document.getElementById('enrollmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const loader = document.getElementById('loader');
            loader.style.display = 'flex';

            try {
                // Step A: Basic Data Gathering
                const courseSelect = document.getElementById('courseSelect');
                const selectedOption = courseSelect.options[courseSelect.selectedIndex];
                const prefix = selectedOption.getAttribute('data-prefix');
                const courseName = selectedOption.value;

                if (!prefix) throw new Error("Please select a valid Degree Program.");

                const nic = document.getElementById('nic').value.trim().toUpperCase();
                const year = new Date().getFullYear().toString();
                const streamName = (prefix === 'I') ? 'IT' : 'Business';

                // 🔥 LOGIN CREATION WITH VISIBLE PASSWORD
                const email = document.getElementById('email').value.trim();
                const tempPassword = document.getElementById('tempPassword').value; // Get from Visible Input

                if (tempPassword.length < 6) throw new Error("Password must be at least 6 characters!");

                // 1. Initialize Secondary App to create user
                const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
                const secondaryAuth = getAuth(secondaryApp);

                // 2. Create Auth User
                const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword);
                const userUid = userCredential.user.uid;

                // Step C: Run Transaction (Now using userUid as Doc ID)
                const result = await runTransaction(db, async (transaction) => {

                    // 1. Check NIC
                    const nicRef = doc(db, "nic_registry", nic);
                    const nicDoc = await transaction.get(nicRef);
                    if (nicDoc.exists()) throw "Error: Student with this NIC is already enrolled!";

                    // 2. Counters
                    const counterRef = doc(db, "counters", `${year}_${prefix}`);
                    const counterDoc = await transaction.get(counterRef);
                    const nextNum = counterDoc.exists() ? counterDoc.data().count + 1 : 1;
                    const paddedNum = nextNum.toString().padStart(3, '0');
                    const admissionNo = `${prefix}-${year}-${paddedNum}`;

                    // 3. Prepare Data (Using userUid)
                    const newStudentRef = doc(db, "students", userUid); // 👈 Linked to Auth ID

                    const studentData = {
                        uid: userUid, // Save UID in data too
                        meta: {
                            admissionNo: admissionNo,
                            prefix: prefix,
                            stream: streamName,
                            role: "student",
                            enrolledAt: serverTimestamp(),
                            status: "Active"
                        },
                        personal: {
                            fullName: document.getElementById('fullName').value,
                            initials: document.getElementById('initials').value,
                            nic: nic,
                            dob: document.getElementById('dob').value,
                            gender: document.getElementById('gender').value,
                            nationality: document.getElementById('nationality').value
                        },
                        contact: {
                            mobile: document.getElementById('mobile').value,
                            email: email,
                            address: document.getElementById('address').value
                        },
