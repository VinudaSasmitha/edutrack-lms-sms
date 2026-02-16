import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Get User ID from localStorage and load profile
(() => {
  const userId = localStorage.getItem('loggedInUserId');

  if (!userId) {
    window.location.href = "index.html";
    return;
  }

  // Fetch student document using User ID as document ID
  const docRef = doc(db, "students", userId);
  
  getDoc(docRef).then((snap) => {
    if (!snap.exists()) {
      alert("Student record not found in Firestore!");
      return;
    }

    const data = snap.data();

    // Verify that User ID in document matches logged-in User ID
    if (data?.userId !== userId) {
      console.error("User ID mismatch: Document User ID does not match logged-in User ID");
      alert("User ID mismatch. Please contact administrator.");
      return;
    }

    // Display student information
    document.getElementById("admNo").textContent =
      data?.meta?.admissionNo || "N/A";

    document.getElementById("fullName").textContent =
      data?.personal?.fullName || "N/A";

    document.getElementById("email").textContent =
      data?.contact?.email || "N/A";

    document.getElementById("mobile").textContent =
      data?.contact?.mobile || "N/A";

    document.getElementById("course").textContent =
      data?.academic?.course || "N/A";

    document.getElementById("intake").textContent =
      data?.academic?.intake || "N/A";

    document.getElementById("status").textContent =
      data?.finance?.status || "N/A";

  }).catch((error) => {
    console.error("Firestore error:", error);
    alert("Error loading student data. Check console.");
  });
})();
