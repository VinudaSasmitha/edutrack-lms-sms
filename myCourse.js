// ================= Firebase Configuration =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAMRV4fGPR7XobJjUd27a5F9cK3w8IBbAI",
    authDomain: "edu-lms-e2f94.firebaseapp.com",
    projectId: "edu-lms-e2f94",
    storageBucket: "edu-lms-e2f94.firebasestorage.app",
    messagingSenderId: "1023275038162",
    appId: "1:1023275038162:web:d746ff3b11ed64427c440b"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const container = document.getElementById("coursesContainer");

async function loadCourses() {
    try {
        const coursesCol = collection(db, "course"); // Make sure your collection is named 'courses'
        const courseSnapshot = await getDocs(coursesCol);
        const courses = courseSnapshot.docs.map(doc => doc.data());
        displayCourses(courses);
    } catch (error) {
        console.error("Error loading courses:", error);
        container.innerHTML = "<p style='color:red;'>Failed to load courses</p>";
    }
}

function displayCourses(courseList) {
    container.innerHTML = ""; 
    courseList.forEach(course => {
        const card = document.createElement("div");
        card.classList.add("course-card");
        card.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <p class="instructor">Instructor: ${course.instructor}</p>
        `;
        container.appendChild(card);
    });
}

loadCourses();
