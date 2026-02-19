document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if we are in an iframe. If so, DO NOT inject sidebar.
    if (window.self !== window.top) {
        return;
    }

    // 2. Check User Role
    const userRole = localStorage.getItem('userRole');

    // If no role, strictly we might want to redirect to login, 
    // but for now we'll just not show the sidebar or default to guest.
    // However, the requirement is "student dashboard" or "admin dashboard".

    if (!userRole) {
        // Optional: Redirect to login if not on public pages
        // if (!window.location.href.includes('index.html') && !window.location.href.includes('login')) {
        //     window.location.href = 'index.html';
        // }
        return;
    }

    injectSidebar(userRole);
});

function injectSidebar(role) {
    // Create Sidebar Element
    const sidebar = document.createElement('nav');
    sidebar.className = 'sidebar';

    // Define Menu Items
    let menuItems = '';
    let dashboardTitle = 'EduTrack';

    if (role === 'student') {
        dashboardTitle = 'EduTrack Student';
        menuItems = `
            <a href="student-dashboard.html" class="menu-item ${isActive('student-dashboard.html')}">
                <i class="fa-solid fa-home"></i>
                <span>Dashboard</span>
            </a>
            <a href="myCourse.html" class="menu-item ${isActive('myCourse.html')}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>My Course</span>
            </a>
            <a href="grades.html" class="menu-item ${isActive('grades.html')}">
                <i class="fa-solid fa-users"></i>
                <span>Grades</span>
            </a>
            <a href="calendar.html" class="menu-item ${isActive('calendar.html')}">
                <i class="fa-solid fa-calendar-days"></i>
                <span>Calendar</span>
            </a>
            <a href="attendance.html" class="menu-item ${isActive('attendance.html')}">
                <i class="fa-solid fa-clipboard-user"></i>
                <span>Attendance</span>
            </a>
            <a href="payment.html" class="menu-item ${isActive('payment.html')}">
                <i class="fa-solid fa-credit-card"></i>
                <span>Payments</span>
            </a>
            <a href="profile.html" class="menu-item ${isActive('profile.html')}">
                <i class="fa-solid fa-user"></i>
                <span>Profile</span>
            </a>
        `;
    } else if (role === 'admin') {
        dashboardTitle = 'EduTrack Admin';
        menuItems = `
            <a href="admin-dashboard.html" class="menu-item ${isActive('admin-dashboard.html')}">
                <i class="fa-solid fa-gauge"></i>
                <span>Dashboard</span>
            </a>
            <a href="enrollment.html" class="menu-item ${isActive('enrollment.html')}">
                <i class="fa-solid fa-user-plus"></i>
                <span>Enrollments</span>
            </a>
            <a href="addCourse.html" class="menu-item ${isActive('addCourse.html')}">
                <i class="fa-solid fa-book-medical"></i>
                <span>Add Course</span>
            </a>
            <a href="addGrade.html" class="menu-item ${isActive('addGrade.html')}">
                <i class="fa-solid fa-marker"></i>
                <span>Add Grades</span>
            </a>
            <a href="#" class="menu-item" onclick="alert('Coming Soon')">
                <i class="fa-solid fa-file-invoice"></i>
                <span>Reports</span>
            </a>
        `;
    }

    // Sidebar HTML Structure
    sidebar.innerHTML = `
        <div class="logo-section">
            <i class="fa-solid fa-graduation-cap"></i>
            <span class="logo-text">${dashboardTitle}</span>
        </div>

        <div class="menu">
            ${menuItems}
        </div>

        <div class="logout-section">
            <button id="logoutBtn" class="btn-logout">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Log Out</span>
            </button>
        </div>
    `;

    // Inject into Body
    document.body.prepend(sidebar);
    document.body.classList.add('with-sidebar');

    // Attach Logout Event
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('loggedInUserId');
        window.location.href = 'index.html';
    });
}

function isActive(pageName) {
    const path = window.location.pathname;
    const currentFile = path.split('/').pop();
    if (currentFile === pageName) return 'active';
    if (pageName === 'student-dashboard.html' && (currentFile === '' || currentFile === 'index.html')) return ''; // edge cases
    return '';
}
