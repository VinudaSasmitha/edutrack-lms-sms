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

        
