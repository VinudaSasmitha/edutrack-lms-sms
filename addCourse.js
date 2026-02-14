import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
document.getElementById("addCourse").addEventListener("click", async () => {

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const instructor = document.getElementById("instructor").value;
  const program = document.getElementById("program").value;
  console.log(title, description, instructor,program);
  try {
    const docRef = await addDoc(collection(db, "course"), {
      title,
      description,
      instructor,
      program,
      createdAt: new Date()
    });

    alert("Course added with ID: " + docRef.id);
  } catch (error) {
    alert("try again something went wrong");
  }
});