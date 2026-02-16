        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

        // --- PASSWORD GENERATOR FUNCTION ---
        window.generateStudentPass = function () {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            document.getElementById('tempPassword').value = "Pass@" + randomNum;
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

        // --- 3. MAIN SUBMISSION LOGIC ---
        document.getElementById('enrollmentForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const loader = document.getElementById('loader');
            loader.style.display = 'flex';

            // safety timeout
            const timeout = setTimeout(() => { loader.style.display = 'none'; alert('Request timeout'); }, 15000);

            try {
                // Basic Data Gathering
                const courseSelect = document.getElementById('courseSelect');
                const selectedOption = courseSelect.options[courseSelect.selectedIndex];
                const courseName = selectedOption.value;

                if (!courseName) throw new Error("Please select a Degree Program.");

                const nic = document.getElementById('nic').value.trim().toUpperCase();

                // Login credentials
                const emailRaw = document.getElementById('email').value.trim();
                const email = emailRaw.toLowerCase();
                const password = document.getElementById('tempPassword').value.trim();

                if (!email) throw new Error('Please enter student email');
                if (password.length < 6) throw new Error('Password must be at least 6 characters');

                // Check if document with this email already exists
                const studentRef = doc(db, 'students', email);
                const existing = await getDoc(studentRef);
                if (existing.exists()) throw new Error('A student with this email is already registered');

                // Prepare student data
                const studentData = {
                    userId: email,
                    password: password,
                    contact: { email: email, mobile: document.getElementById('mobile').value, address: document.getElementById('address').value },
                    meta: { enrolledAt: serverTimestamp(), status: 'Active' },
                    personal: {
                        fullName: document.getElementById('fullName').value,
                        initials: document.getElementById('initials').value,
                        nic: nic,
                        dob: document.getElementById('dob').value,
                        gender: document.getElementById('gender').value,
                        nationality: document.getElementById('nationality').value
                    },
                    academic: { course: courseName, intake: document.getElementById('intake').value, mode: document.getElementById('mode').value },
                    finance: { totalFee: parseFloat(document.getElementById('feeTotal').value) || 0, discount: parseFloat(document.getElementById('feeDiscount').value) || 0, paid: parseFloat(document.getElementById('feePaid').value) || 0, balance: parseFloat(document.getElementById('feeBalance').value) || 0, method: document.getElementById('payMethod').value, status: document.getElementById('statusText').innerText }
                };

                await setDoc(studentRef, studentData);

                clearTimeout(timeout);
                loader.style.display = 'none';
                alert(`✅ ENROLLMENT SUCCESSFUL!\n\nEmail (Login ID): ${email}\nPassword: ${password}`);
                document.getElementById('enrollmentForm').reset();
                window.location.href = 'index.html';

            } catch (error) {
                console.error(error);
                clearTimeout(timeout);
                loader.style.display = 'none';
                alert('❌ ENROLLMENT FAILED:\n' + (error.message || error));
            }
        });
