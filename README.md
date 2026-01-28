# edutrack-lms-sms
EduTrack is a full-stack Learning Management System (LMS) and Student Management System (SMS) built using HTML, CSS, JavaScript, Node.js, and Firebase. It supports role-based access for admins, teachers, students, and parents, with features including course management, assignments, attendance, grading, scheduling, and real-time notifications.

# EduTrack  
### Learning Management System & Student Management System

EduTrack is a **full-stack, cloud-based Learning Management System (LMS) and Student Management System (SMS)** designed to manage academic operations such as user roles, courses, assignments, attendance, grades, scheduling, and communication within a single unified platform.

The system is developed using **HTML, CSS, JavaScript, Node.js, and Firebase**, following modern web development best practices and a modular full-stack architecture.

---

## 📌 Project Overview

Educational institutions often require multiple disconnected systems to manage learning content, student records, assessments, and communication. EduTrack solves this problem by providing a **centralized, secure, and scalable platform** that supports administrators, teachers, students, and parents.

The project focuses on:
- Role-based access control
- Real-time data handling
- Cloud-hosted infrastructure
- Modular feature development

---

## 🚀 Key Features

### User & Role Management
- Secure authentication using Firebase Authentication
- Role-based access for **Admin, Teacher, Student, and Parent**
- User profile management
- Access control enforced via Firestore security rules

### Course & Curriculum Management
- Course creation and management
- Curriculum structure with lessons and modules
- Upload and manage learning materials (PDFs, videos, documents)
- Student enrollment management

### Assignments & Assessments
- Assignment creation and submission
- Online quizzes (MCQ and short-answer)
- Automated grading for objective questions
- Manual grading with feedback support

### Grades & Reporting
- Digital gradebook
- Student progress tracking
- Attendance and performance reports
- Dashboard-based visualization

### Attendance & Scheduling
- Daily attendance tracking
- Class timetables and exam schedules
- Assignment and exam deadlines
- Attendance analytics

### Communication
- Announcements and notifications
- Student-teacher messaging
- Real-time updates using Firebase

### Security
- Secure authentication and authorization
- Role-based Firestore security rules
- Protected file storage using Firebase Storage

---

## 🛠 Technology Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Cloud & Database
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Admin SDK

---

## 🧱 System Architecture

Client (HTML, CSS, JavaScript)
|
| REST API / Firebase SDK
|
Server (Node.js + Express)
|
| Firebase Admin SDK
|
Firebase (Auth, Firestore, Storage)




---

## 👥 Team & Responsibilities

| Member | Role | Module Responsibility |
|------|------|-----------------------|
| **Vinuda** (Leader) | Full-Stack Developer | Authentication, User Roles, Security |
| Dinel | Full-Stack Developer | Course & Curriculum Management |
| Thenuk | Full-Stack Developer | Assignments, Quizzes & Grades |
| Hirun | Full-Stack Developer | Attendance, Scheduling, Notifications & Analytics |

Each member is responsible for **frontend, backend, and Firebase integration** within their assigned module.

---

## 📂 Project Structure

edutrack-lms-sms/
│
├── frontend/
│ ├── css/
│ ├── js/
│ ├── pages/
│ └── index.html
│
├── backend/
│ ├── routes/
│ ├── controllers/
│ ├── server.js
│
├── firebase/
│ ├── firebaseConfig.js
│ ├── firestore.rules
│
├── package.json
└── README.md



