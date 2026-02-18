import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
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

// Toast notification function
window.showToast = (message, type = "success") => {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// Auto-update Pass/Fail status when marks change
document.getElementById("marks").addEventListener("input", function() {
    const marks = parseFloat(this.value);
    const statusSelect = document.getElementById("gradeStatus");
    
    if (isNaN(marks) || marks < 0) {
        statusSelect.value = "";
    } else if (marks > 100) {
        statusSelect.value = "";
    } else {
        // Pass if marks >= 40, otherwise Fail
        statusSelect.value = marks >= 40 ? "Pass" : "Fail";
    }
});

// Look up student by email and auto-fill course
document.getElementById("studentEmail").addEventListener("blur", async function() {
    const email = this.value.trim().toLowerCase();
    const nameInput = document.getElementById("studentName");
    const courseInput = document.getElementById("course");
    
    if (!email) return;
    
    try {
        // Check in students collection first
        const studentRef = doc(db, "students", email);
        const studentSnap = await getDoc(studentRef);
        
        if (studentSnap.exists()) {
            const studentData = studentSnap.data();
            nameInput.value = studentData.personal?.fullName || studentData.personal?.initials || "";
            // Auto-fill course from academic data
            courseInput.value = studentData.academic?.course || "";
        } else {
            // Also check in users collection
            const userRef = doc(db, "users", email);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                nameInput.value = userData.name || "";
                courseInput.value = userData.course || "";
            } else {
                nameInput.value = "";
                courseInput.value = "";
                showToast("Student not found in system", "error");
            }
        }
    } catch (error) {
        console.error("Error looking up student:", error);
    }
});

// Save grade to Firebase
window.saveGrade = async function() {
    const loader = document.getElementById("loader");
    
    // Get form values
    const studentEmail = document.getElementById("studentEmail").value.trim().toLowerCase();
    const studentName = document.getElementById("studentName").value.trim();
    const course = document.getElementById("course").value.trim();
    const academicYear = document.getElementById("academicYear").value;
    const semester = document.getElementById("semester").value;
    const subject = document.getElementById("subject").value.trim();
    const marks = parseFloat(document.getElementById("marks").value);
    const gradeStatus = document.getElementById("gradeStatus").value;
    const notes = document.getElementById("notes").value.trim();

    // Validation
    if (!studentEmail) {
        showToast("Please enter student email", "error");
        return;
    }
    if (!academicYear) {
        showToast("Please select academic year", "error");
        return;
    }
    if (!semester) {
        showToast("Please select semester", "error");
        return;
    }
    if (!subject) {
        showToast("Please enter subject name", "error");
        return;
    }
    if (isNaN(marks) || marks < 0 || marks > 100) {
        showToast("Please enter valid marks (0-100)", "error");
        return;
    }
    if (!gradeStatus) {
        showToast("Please select Pass/Fail status", "error");
        return;
    }

    loader.classList.add("active");

    try {
        // Create unique document ID
        const gradeId = `${studentEmail}_${academicYear}_${semester}_${subject}`.replace(/[^a-zA-Z0-9]/g, "_");
        
        // Prepare grade data
        const gradeData = {
            studentEmail: studentEmail,
            studentName: studentName || "Unknown",
            course: course || "Unknown",
            academicYear: academicYear,
            semester: semester,
            subject: subject,
            marks: marks,
            status: gradeStatus, // Pass or Fail
            notes: notes,
            createdAt: serverTimestamp(),
            createdBy: "admin"
        };

        // Save to Firestore
        await setDoc(doc(db, "grades", gradeId), gradeData);

        loader.classList.remove("active");
        showToast("Grade saved successfully!", "success");
        
        // Reset form after short delay
        setTimeout(() => {
            resetForm();
        }, 1500);

    } catch (error) {
        loader.classList.remove("active");
        console.error("Error saving grade:", error);
        showToast("Failed to save grade: " + error.message, "error");
    }
};

// Reset form
window.resetForm = function() {
    document.getElementById("studentEmail").value = "";
    document.getElementById("studentName").value = "";
    document.getElementById("course").value = "";
    document.getElementById("academicYear").value = "";
    document.getElementById("semester").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("marks").value = "";
    document.getElementById("gradeStatus").value = "";
    document.getElementById("notes").value = "";
};
