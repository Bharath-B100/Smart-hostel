// MongoDB Configuration
const MONGODB_CONFIG = {
    API_URL: 'http://localhost:3000/api'
};

// Hostel and warden data
const hostelData = {
    boys: [
        { 
            name: "Marutham Hostel", 
            warden: "Saravanan",
            rooms: ["101", "102", "103", "104", "105", "201", "202", "203", "204", "205"]
        },
        { 
            name: "Kurinji Hostel", 
            warden: "Ramesh Kumar",
            rooms: ["101", "102", "103", "104", "105", "201", "202", "203", "204", "205"]
        },
        { 
            name: "Neithal Hostel", 
            warden: "Vijay Anand",
            rooms: ["101", "102", "103", "104", "105", "201", "202", "203", "204", "205"]
        }
    ],
    girls: [
        { 
            name: "Mullai Hostel", 
            warden: "Lakshmi Priya",
            rooms: ["101", "102", "103", "104", "105", "201", "202", "203", "204", "205"]
        },
        { 
            name: "Palai Hostel", 
            warden: "Geetha Rani",
            rooms: ["101", "102", "103", "104", "105", "201", "202", "203", "204", "205"]
        },
        { 
            name: "Kaanum Hostel", 
            warden: "Shanti Devi",
            rooms: ["101", "102", "103", "104", "105", "201", "202", "203", "204", "205"]
        }
    ]
};

// User authentication and data storage
let currentUser = null;
let users = [];
let feedbackData = [];
let leaveData = [];
let studentData = [];
let reportData = [];
let roomAllocations = [];
let attendanceData = [];
let visitorData = [];
let paymentData = [];

let announcements = [
    {
        id: 1,
        title: "Power Cut Notice",
        content: "There will be no power supply this Saturday from 10 AM to 4 PM for maintenance work.",
        date: "2023-10-28",
        type: "info"
    },
    {
        id: 2,
        title: "Water Supply Interruption",
        content: "Water supply will be interrupted on Friday from 10 AM to 12 PM for pipeline repairs.",
        date: "2023-10-27",
        type: "warning"
    },
    {
        id: 3,
        title: "Hostel Fee Payment",
        content: "Last date for hostel fee payment is 30th October. Late payment will incur a fine.",
        date: "2023-10-25",
        type: "important"
    }
];

// MongoDB Service
class MongoDBService {
    static async makeAPIRequest(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${MONGODB_CONFIG.API_URL}/${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.warn('API call failed, using localStorage:', error);
            return this.localStorageFallback(endpoint, method, data);
        }
    }
    
    static localStorageFallback(endpoint, method, data) {
        const key = `db_${endpoint}`;
        
        switch (method) {
            case 'GET':
                const stored = localStorage.getItem(key);
                return { success: true, data: stored ? JSON.parse(stored) : [] };
                
            case 'POST':
                const items = JSON.parse(localStorage.getItem(key) || '[]');
                const newItem = { ...data, _id: Date.now().toString() };
                items.push(newItem);
                localStorage.setItem(key, JSON.stringify(items));
                return { success: true, data: newItem };
                
            case 'PUT':
                const allItems = JSON.parse(localStorage.getItem(key) || '[]');
                const updatedItems = allItems.map(item => 
                    item._id === data._id ? { ...item, ...data } : item
                );
                localStorage.setItem(key, JSON.stringify(updatedItems));
                return { success: true, data: { modifiedCount: 1 } };
                
            case 'DELETE':
                const currentItems = JSON.parse(localStorage.getItem(key) || '[]');
                const filteredItems = currentItems.filter(item => item._id !== data._id);
                localStorage.setItem(key, JSON.stringify(filteredItems));
                return { success: true, data: { deletedCount: 1 } };
        }
    }
    
    // User methods
    static async getUsers() {
        const result = await this.makeAPIRequest('users');
        return result.data || [];
    }
    
    static async createUser(user) {
        const result = await this.makeAPIRequest('users', 'POST', user);
        return result.data;
    }
    
    static async updateUser(userId, updates) {
        const result = await this.makeAPIRequest('users', 'PUT', { _id: userId, ...updates });
        return result.data;
    }
    
    // Feedback methods
    static async getFeedback() {
        const result = await this.makeAPIRequest('feedback');
        return result.data || [];
    }
    
    static async createFeedback(feedback) {
        const result = await this.makeAPIRequest('feedback', 'POST', feedback);
        return result.data;
    }
    
    static async updateFeedback(feedbackId, updates) {
        const result = await this.makeAPIRequest('feedback', 'PUT', { _id: feedbackId, ...updates });
        return result.data;
    }
    
    // Leave methods
    static async getLeaves() {
        const result = await this.makeAPIRequest('leaves');
        return result.data || [];
    }
    
    static async createLeave(leave) {
        const result = await this.makeAPIRequest('leaves', 'POST', leave);
        return result.data;
    }
    
    static async updateLeave(leaveId, updates) {
        const result = await this.makeAPIRequest('leaves', 'PUT', { _id: leaveId, ...updates });
        return result.data;
    }
    
    // Student methods
    static async getStudents() {
        const result = await this.makeAPIRequest('students');
        return result.data || [];
    }
    
    static async createStudent(student) {
        const result = await this.makeAPIRequest('students', 'POST', student);
        return result.data;
    }
    
    static async updateStudent(studentId, updates) {
        const result = await this.makeAPIRequest('students', 'PUT', { _id: studentId, ...updates });
        return result.data;
    }
    
    static async deleteStudent(studentId) {
        const result = await this.makeAPIRequest('students', 'DELETE', { _id: studentId });
        return result.data;
    }
    
    // Report methods
    static async getReports() {
        const result = await this.makeAPIRequest('reports');
        return result.data || [];
    }
    
    static async createReport(report) {
        const result = await this.makeAPIRequest('reports', 'POST', report);
        return result.data;
    }
    
    static async updateReport(reportId, updates) {
        const result = await this.makeAPIRequest('reports', 'PUT', { _id: reportId, ...updates });
        return result.data;
    }
    
    // Room Management
    static async getRoomAllocations() {
        const result = await this.makeAPIRequest('room-allocations');
        return result.data || [];
    }
    
    static async createRoomAllocation(allocation) {
        const result = await this.makeAPIRequest('room-allocations', 'POST', allocation);
        return result.data;
    }
    
    // Attendance
    static async getAttendance() {
        const result = await this.makeAPIRequest('attendance');
        return result.data || [];
    }
    
    static async createAttendance(attendance) {
        const result = await this.makeAPIRequest('attendance', 'POST', attendance);
        return result.data;
    }
    
    // Visitors
    static async getVisitors() {
        const result = await this.makeAPIRequest('visitors');
        return result.data || [];
    }
    
    static async createVisitor(visitor) {
        const result = await this.makeAPIRequest('visitors', 'POST', visitor);
        return result.data;
    }
    
    // Payments
    static async getPayments() {
        const result = await this.makeAPIRequest('payments');
        return result.data || [];
    }
    
    static async createPayment(payment) {
        const result = await this.makeAPIRequest('payments', 'POST', payment);
        return result.data;
    }
}

// DOM elements
const loadingScreen = document.getElementById('loadingScreen');
const loginPage = document.getElementById('loginPage');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginModal = document.getElementById('adminLoginModal');
const showAdminLogin = document.getElementById('showAdminLogin');
const closeAdminModal = document.getElementById('closeAdminModal');
const hostelTypeOptions = document.querySelectorAll('.hostel-option');
const hostelSelection = document.getElementById('hostelSelection');
const hostelNameSelect = document.getElementById('hostelName');
const logoutBtn = document.getElementById('logoutBtn');
const logoutSettingsBtn = document.getElementById('logoutSettingsBtn');
const userDisplayName = document.getElementById('userDisplayName');
const userAvatar = document.getElementById('userAvatar');
const profilePicture = document.getElementById('profilePicture');
const wardenInfo = document.getElementById('wardenInfo');
const userHostel = document.getElementById('userHostel');
const userWarden = document.getElementById('userWarden');
const userRoom = document.getElementById('userRoom');
const themeToggle = document.getElementById('themeToggle');
const themeSelect = document.getElementById('themeSelect');
const notification = document.getElementById('notification');
const feedbackForm = document.getElementById('feedbackForm');
const feedbackList = document.getElementById('feedbackList');
const pendingLeavesEl = document.getElementById('pendingLeaves');
const totalFeedbackEl = document.getElementById('totalFeedback');
const totalReportsEl = document.getElementById('totalReports');
const currentDateEl = document.getElementById('currentDate');
const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
const applyLeaveBtn = document.getElementById('applyLeaveBtn');
const reportIssueBtn = document.getElementById('reportIssueBtn');
const displayNameInput = document.getElementById('displayName');
const roomNumberInput = document.getElementById('roomNumber');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const profilePictureInput = document.getElementById('profilePictureInput');
const uploadPictureBtn = document.getElementById('uploadPictureBtn');
const recentActivity = document.getElementById('recentActivity');
const announcementsList = document.getElementById('announcementsList');
const messRatingEl = document.getElementById('messRating');
const totalStudentsEl = document.getElementById('totalStudents');
const leaveForm = document.getElementById('leaveForm');
const myLeavesList = document.getElementById('myLeavesList');
const allLeavesList = document.getElementById('allLeavesList');
const manageLeavesTab = document.getElementById('manageLeavesTab');
const studentForm = document.getElementById('studentForm');
const studentList = document.getElementById('studentList');
const reportForm = document.getElementById('reportForm');
const myReportsList = document.getElementById('myReportsList');
const allReportsList = document.getElementById('allReportsList');
const allReportsTab = document.getElementById('allReportsTab');
const emergencyBtn = document.getElementById('emergencyBtn');
const markAttendanceBtn = document.getElementById('markAttendanceBtn');
const registerVisitorBtn = document.getElementById('registerVisitorBtn');
const roomOccupancyEl = document.getElementById('roomOccupancy');
const todayAttendanceEl = document.getElementById('todayAttendance');
const feeStatusEl = document.getElementById('feeStatus');
const roomOccupancyDashboardEl = document.getElementById('roomOccupancyDashboard');
const attendanceRateEl = document.getElementById('attendanceRate');
const roomAllocationForm = document.getElementById('roomAllocationForm');
const roomAllocationsList = document.getElementById('roomAllocationsList');
const roomAvailabilityGrid = document.getElementById('roomAvailabilityGrid');
const allocateStudent = document.getElementById('allocateStudent');
const allocateRoom = document.getElementById('allocateRoom');
const attendanceDate = document.getElementById('attendanceDate');
const attendanceType = document.getElementById('attendanceType');
const attendanceStudentList = document.getElementById('attendanceStudentList');
const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
const attendanceCalendar = document.getElementById('attendanceCalendar');
const visitorForm = document.getElementById('visitorForm');
const visitorRecordsList = document.getElementById('visitorRecordsList');
const studentVisiting = document.getElementById('studentVisiting');
const paymentForm = document.getElementById('paymentForm');
const paymentRecordsList = document.getElementById('paymentRecordsList');
const paymentStudent = document.getElementById('paymentStudent');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            applyUserTheme();
            showApp();
        } else {
            showLogin();
        }
    }, 2000);
    
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    setupEventListeners();
    loadInitialData();
});

// Load initial data
async function loadInitialData() {
    try {
        users = await MongoDBService.getUsers();
        feedbackData = await MongoDBService.getFeedback();
        leaveData = await MongoDBService.getLeaves();
        studentData = await MongoDBService.getStudents();
        reportData = await MongoDBService.getReports();
        roomAllocations = await MongoDBService.getRoomAllocations();
        attendanceData = await MongoDBService.getAttendance();
        visitorData = await MongoDBService.getVisitors();
        paymentData = await MongoDBService.getPayments();
        
        // Initialize with sample data if empty
        if (studentData.length === 0) {
            const sampleStudents = [
                {
                    name: "John Doe",
                    roll: "23CB001",
                    email: "23cb001@drngpit.ac.in",
                    room: "101",
                    department: "CSE",
                    phone: "9876543210"
                },
                {
                    name: "Jane Smith",
                    roll: "23CB002", 
                    email: "23cb002@drngpit.ac.in",
                    room: "102",
                    department: "ECE",
                    phone: "9876543211"
                }
            ];
            
            for (const student of sampleStudents) {
                await MongoDBService.createStudent(student);
            }
            studentData = await MongoDBService.getStudents();
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Set up all event listeners
function setupEventListeners() {
    hostelTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            selectHostelType(type);
        });
    });
    
    loginForm.addEventListener('submit', handleLogin);
    showAdminLogin.addEventListener('click', () => adminLoginModal.style.display = 'flex');
    closeAdminModal.addEventListener('click', () => adminLoginModal.style.display = 'none');
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    logoutBtn.addEventListener('click', handleLogout);
    logoutSettingsBtn.addEventListener('click', handleLogout);
    themeToggle.addEventListener('click', toggleTheme);
    themeSelect.addEventListener('change', handleThemeChange);
    
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const navItem = this.getAttribute('data-nav');
            handleNavigation(navItem);
        });
    });
    
    document.querySelectorAll('.card[data-nav]').forEach(card => {
        card.addEventListener('click', function() {
            const navItem = this.getAttribute('data-nav');
            handleNavigation(navItem);
        });
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const parentId = this.closest('.tab-content').id.replace('Content', '');
            switchTab(tabId, parentId);
        });
    });
    
    feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    submitFeedbackBtn.addEventListener('click', () => {
        handleNavigation('mess');
        setTimeout(() => switchTab('feedback', 'mess'), 100);
    });
    
    applyLeaveBtn.addEventListener('click', () => {
        handleNavigation('leave');
        setTimeout(() => switchTab('apply', 'leave'), 100);
    });
    
    reportIssueBtn.addEventListener('click', () => {
        handleNavigation('reports');
        setTimeout(() => switchTab('report', 'reports'), 100);
    });
    
    leaveForm.addEventListener('submit', handleLeaveSubmit);
    studentForm.addEventListener('submit', handleStudentSubmit);
    reportForm.addEventListener('submit', handleReportSubmit);
    saveProfileBtn.addEventListener('click', saveProfileSettings);
    uploadPictureBtn.addEventListener('click', uploadProfilePicture);
    
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            this.parentElement.classList.toggle('active');
        });
    });
    
    emergencyBtn.addEventListener('click', handleEmergency);
    markAttendanceBtn.addEventListener('click', () => handleNavigation('attendance'));
    registerVisitorBtn.addEventListener('click', () => handleNavigation('visitors'));
    roomAllocationForm.addEventListener('submit', handleRoomAllocation);
    saveAttendanceBtn.addEventListener('click', handleSaveAttendance);
    visitorForm.addEventListener('submit', handleVisitorRegistration);
    paymentForm.addEventListener('submit', handlePaymentSubmission);
    
    document.querySelectorAll('.rating input').forEach(star => {
        star.addEventListener('change', function() {
            const labels = this.parentElement.querySelectorAll('label');
            labels.forEach((label, index) => {
                if (index < 5 - this.value) {
                    label.style.color = '#ddd';
                } else {
                    label.style.color = '#f39c12';
                }
            });
        });
    });
}

// Handle hostel type selection
function selectHostelType(type) {
    hostelTypeOptions.forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector(`.${type}-option`).classList.add('selected');
    
    hostelSelection.style.display = 'block';
    hostelNameSelect.innerHTML = '<option value="">Select Hostel</option>';
    hostelData[type].forEach(hostel => {
        const option = document.createElement('option');
        option.value = hostel.name;
        option.textContent = hostel.name;
        hostelNameSelect.appendChild(option);
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const hostelType = document.querySelector('.hostel-option.selected')?.getAttribute('data-type');
    const hostelName = document.getElementById('hostelName').value;
    
    if (!hostelType || !hostelName) {
        showNotification('Please select hostel type and name', 'error');
        return;
    }
    
    if (!email.endsWith('@drngpit.ac.in')) {
        showNotification('Please use your college email ID (@drngpit.ac.in)', 'error');
        return;
    }
    
    const expectedPassword = email.substring(0, 7).toLowerCase();
    if (password !== expectedPassword) {
        showNotification('Invalid password. Password should be first 7 characters of your email ID in lowercase', 'error');
        return;
    }
    
    let user = users.find(u => u.email === email);
    if (!user) {
        const room = email.split('@')[0].substring(2);
        
        user = {
            email: email,
            password: expectedPassword,
            name: email.split('@')[0].toUpperCase(),
            room: room,
            hostelType: hostelType,
            hostelName: hostelName,
            avatar: "",
            theme: "light"
        };
        
        await MongoDBService.createUser(user);
        users = await MongoDBService.getUsers();
    }
    
    if (user.hostelType !== hostelType || user.hostelName !== hostelName) {
        user.hostelType = hostelType;
        user.hostelName = hostelName;
        await MongoDBService.updateUser(user._id, user);
        users = await MongoDBService.getUsers();
    }
    
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    applyUserTheme();
    showApp();
    showNotification(`Welcome back, ${user.name}!`, 'success');
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === 'admin' && password === 'Admin@123') {
        const user = {
            email: 'admin@drngpit.ac.in',
            name: 'Hostel Administrator',
            room: 'Office',
            hostelType: 'admin',
            hostelName: 'Administration',
            avatar: "",
            theme: "light",
            isAdmin: true
        };
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        applyUserTheme();
        showApp();
        adminLoginModal.style.display = 'none';
        showNotification('Welcome, Administrator!', 'success');
    } else {
        showNotification('Invalid admin credentials', 'error');
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLogin();
    showNotification('You have been logged out', 'success');
}

// Apply user's theme preference
function applyUserTheme() {
    if (currentUser && currentUser.theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeSelect.value = 'dark';
        const icon = themeToggle.querySelector('i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        document.body.classList.remove('dark-mode');
        themeSelect.value = 'light';
        const icon = themeToggle.querySelector('i');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Show login page
function showLogin() {
    loginPage.style.display = 'flex';
    appContainer.style.display = 'none';
    loginForm.reset();
    hostelSelection.style.display = 'none';
    hostelTypeOptions.forEach(option => {
        option.classList.remove('selected');
    });
}

// Show main application
async function showApp() {
    loginPage.style.display = 'none';
    appContainer.style.display = 'block';
    
    userDisplayName.textContent = currentUser.name;
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    profilePicture.textContent = currentUser.name.charAt(0).toUpperCase();
    displayNameInput.value = currentUser.name;
    roomNumberInput.value = currentUser.room;
    
    if (currentUser.isAdmin) {
        wardenInfo.textContent = 'Administrator';
        userHostel.textContent = 'Administration';
        userWarden.textContent = 'System Admin';
        manageLeavesTab.style.display = 'block';
        allReportsTab.style.display = 'block';
    } else {
        const hostel = hostelData[currentUser.hostelType].find(h => h.name === currentUser.hostelName);
        wardenInfo.textContent = `Warden: ${hostel.warden}`;
        userHostel.textContent = currentUser.hostelName;
        userWarden.textContent = hostel.warden;
        manageLeavesTab.style.display = 'none';
        allReportsTab.style.display = 'none';
    }
    
    userRoom.textContent = currentUser.room;
    
    if (currentUser.avatar) {
        userAvatar.style.backgroundImage = `url(${currentUser.avatar})`;
        userAvatar.textContent = '';
        profilePicture.style.backgroundImage = `url(${currentUser.avatar})`;
        profilePicture.textContent = '';
    }
    
    await updateStats();
    await renderFeedbackList();
    await renderLeaves();
    await renderStudents();
    await renderReports();
    renderAnnouncements();
    renderRecentActivity();
    
    initializeRoomManagement();
    initializeAttendance();
    initializeVisitors();
    initializePayments();
}

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    
    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        currentUser.theme = 'dark';
        showNotification('Dark mode enabled', 'success');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        currentUser.theme = 'light';
        showNotification('Light mode enabled', 'success');
    }
    
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].theme = currentUser.theme;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    themeSelect.value = currentUser.theme;
}

// Handle theme change from dropdown
function handleThemeChange() {
    if (themeSelect.value === 'dark') {
        if (!document.body.classList.contains('dark-mode')) {
            toggleTheme();
        }
    } else {
        if (document.body.classList.contains('dark-mode')) {
            toggleTheme();
        }
    }
}

// Navigation handling
function handleNavigation(navItem) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-nav="${navItem}"]`).classList.add('active');
    
    document.getElementById(`${navItem}Content`).classList.add('active');
    
    if (navItem === 'mess' || navItem === 'leave' || navItem === 'reports' || 
        navItem === 'rooms' || navItem === 'attendance' || navItem === 'visitors' || navItem === 'payments') {
        const firstTab = document.querySelector(`#${navItem}Content .tab`);
        if (firstTab) {
            const tabId = firstTab.getAttribute('data-tab');
            switchTab(tabId, navItem);
        }
    }
}

// Tab switching functionality
function switchTab(tabId, parentId) {
    const tabs = document.querySelectorAll(`#${parentId}Content .tab`);
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`#${parentId}Content .tab[data-tab="${tabId}"]`).classList.add('active');
    
    const contents = document.querySelectorAll(`#${parentId}Content .tab-content`);
    contents.forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    
    if (parentId === 'rooms' && tabId === 'room-availability') {
        renderRoomAvailability();
    } else if (parentId === 'attendance' && tabId === 'mark-attendance') {
        renderAttendanceStudentList();
    } else if (parentId === 'attendance' && tabId === 'attendance-records') {
        renderAttendanceCalendar();
    }
}

// Handle feedback form submission
async function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const mealType = document.getElementById('mealType').value;
    const foodRating = document.querySelector('input[name="foodRating"]:checked');
    const comments = document.getElementById('comments').value;
    
    if (!mealType || !foodRating) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const feedback = {
        user: currentUser.name,
        email: currentUser.email,
        mealType: mealType,
        foodRating: parseInt(foodRating.value),
        comments: comments,
        date: new Date().toISOString(),
        response: null
    };
    
    await MongoDBService.createFeedback(feedback);
    feedbackData = await MongoDBService.getFeedback();
    
    await updateStats();
    await renderFeedbackList();
    renderRecentActivity();
    
    showNotification('Thank you for your feedback!', 'success');
    feedbackForm.reset();
    
    document.querySelectorAll('.rating label').forEach(label => {
        label.style.color = '#ddd';
    });
}

// Handle leave form submission
async function handleLeaveSubmit(e) {
    e.preventDefault();
    
    const leaveType = document.getElementById('leaveType').value;
    const leaveFrom = document.getElementById('leaveFrom').value;
    const leaveTo = document.getElementById('leaveTo').value;
    const leaveReason = document.getElementById('leaveReason').value;
    
    if (!leaveType || !leaveFrom || !leaveTo || !leaveReason) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const leave = {
        user: currentUser.name,
        email: currentUser.email,
        type: leaveType,
        from: leaveFrom,
        to: leaveTo,
        reason: leaveReason,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    await MongoDBService.createLeave(leave);
    leaveData = await MongoDBService.getLeaves();
    
    await updateStats();
    await renderLeaves();
    renderRecentActivity();
    
    showNotification('Leave application submitted successfully!', 'success');
    leaveForm.reset();
}

// Handle student form submission
async function handleStudentSubmit(e) {
    e.preventDefault();
    
    const studentName = document.getElementById('studentName').value;
    const studentRoll = document.getElementById('studentRoll').value;
    const studentEmail = document.getElementById('studentEmail').value;
    const studentRoom = document.getElementById('studentRoom').value;
    const studentDepartment = document.getElementById('studentDepartment').value;
    const studentPhone = document.getElementById('studentPhone').value;
    
    if (!studentName || !studentRoll || !studentEmail || !studentRoom || !studentDepartment) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (studentData.find(s => s.roll === studentRoll)) {
        showNotification('Student with this roll number already exists', 'error');
        return;
    }
    
    const student = {
        name: studentName,
        roll: studentRoll,
        email: studentEmail,
        room: studentRoom,
        department: studentDepartment,
        phone: studentPhone
    };
    
    await MongoDBService.createStudent(student);
    studentData = await MongoDBService.getStudents();
    
    await updateStats();
    await renderStudents();
    
    showNotification('Student added successfully!', 'success');
    studentForm.reset();
}

// Handle report form submission
async function handleReportSubmit(e) {
    e.preventDefault();
    
    const reportCategory = document.getElementById('reportCategory').value;
    const reportLocation = document.getElementById('reportLocation').value;
    const reportDescription = document.getElementById('reportDescription').value;
    const reportUrgency = document.getElementById('reportUrgency').value;
    
    if (!reportCategory || !reportLocation || !reportDescription || !reportUrgency) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const report = {
        user: currentUser.name,
        email: currentUser.email,
        category: reportCategory,
        location: reportLocation,
        description: reportDescription,
        urgency: reportUrgency,
        status: 'pending',
        date: new Date().toISOString()
    };
    
    await MongoDBService.createReport(report);
    reportData = await MongoDBService.getReports();
    
    await updateStats();
    await renderReports();
    renderRecentActivity();
    
    showNotification('Issue reported successfully!', 'success');
    reportForm.reset();
}

// Handle emergency button click
function handleEmergency() {
    showNotification('Emergency alert sent to warden and security!', 'success');
    
    setTimeout(() => {
        showNotification('Warden has been notified and is on the way', 'success');
    }, 2000);
}

// Handle room allocation
async function handleRoomAllocation(e) {
    e.preventDefault();
    
    const studentId = allocateStudent.value;
    const roomNumber = allocateRoom.value;
    const allocationDate = document.getElementById('allocationDate').value;
    
    if (!studentId || !roomNumber || !allocationDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const student = studentData.find(s => s._id === studentId);
    
    const allocation = {
        studentId: studentId,
        studentName: student.name,
        roomNumber: roomNumber,
        hostelName: currentUser.hostelName,
        allocationDate: allocationDate,
        status: 'occupied'
    };
    
    await MongoDBService.createRoomAllocation(allocation);
    roomAllocations = await MongoDBService.getRoomAllocations();
    
    showNotification('Room allocated successfully!', 'success');
    await renderRoomAllocations();
    renderRoomAvailability();
    await updateStats();
    
    roomAllocationForm.reset();
}

// Handle save attendance
async function handleSaveAttendance() {
    const date = attendanceDate.value;
    const type = attendanceType.value;
    
    if (!date) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    const checkboxes = document.querySelectorAll('.attendance-checkbox:checked');
    const presentCount = checkboxes.length;
    
    for (const checkbox of checkboxes) {
        const studentId = checkbox.getAttribute('data-student-id');
        const studentName = checkbox.getAttribute('data-student-name');
        
        const attendance = {
            studentId: studentId,
            studentName: studentName,
            date: date,
            status: 'present',
            type: type,
            recordedBy: currentUser.name
        };
        
        await MongoDBService.createAttendance(attendance);
    }
    
    attendanceData = await MongoDBService.getAttendance();
    
    showNotification(`Attendance marked for ${presentCount} students`, 'success');
    await updateStats();
}

// Handle visitor registration
async function handleVisitorRegistration(e) {
    e.preventDefault();
    
    const visitorName = document.getElementById('visitorName').value;
    const visitorPhone = document.getElementById('visitorPhone').value;
    const visitorPurpose = document.getElementById('visitorPurpose').value;
    const studentVisitingId = studentVisiting.value;
    const expectedDuration = document.getElementById('expectedDuration').value;
    
    if (!visitorName || !visitorPhone || !visitorPurpose || !studentVisitingId) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const student = studentData.find(s => s._id === studentVisitingId);
    
    const visitor = {
        name: visitorName,
        phone: visitorPhone,
        purpose: visitorPurpose,
        studentVisiting: student.name,
        entryTime: new Date().toISOString(),
        status: 'visiting',
        expectedDuration: expectedDuration
    };
    
    await MongoDBService.createVisitor(visitor);
    visitorData = await MongoDBService.getVisitors();
    
    showNotification('Visitor registered successfully!', 'success');
    await renderVisitorRecords();
    
    visitorForm.reset();
}

// Handle payment submission
async function handlePaymentSubmission(e) {
    e.preventDefault();
    
    const studentId = paymentStudent.value;
    const amount = document.getElementById('paymentAmount').value;
    const paymentType = document.getElementById('paymentType').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const paymentDate = document.getElementById('paymentDate').value;
    
    if (!studentId || !amount || !paymentType || !paymentMethod || !paymentDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    const student = studentData.find(s => s._id === studentId);
    
    const payment = {
        studentId: studentId,
        studentName: student.name,
        amount: parseFloat(amount),
        type: paymentType,
        method: paymentMethod,
        date: paymentDate,
        status: 'paid'
    };
    
    await MongoDBService.createPayment(payment);
    paymentData = await MongoDBService.getPayments();
    
    showNotification('Payment recorded successfully!', 'success');
    await renderPaymentRecords();
    await updateStats();
    
    paymentForm.reset();
}

// Update statistics
async function updateStats() {
    const pendingLeaves = leaveData.filter(leave => leave.status === 'pending').length;
    const totalFeedback = feedbackData.length;
    const totalReports = reportData.length;
    
    const totalRooms = 30;
    const occupiedRooms = roomAllocations.filter(room => room.status === 'occupied').length;
    const roomOccupancy = Math.round((occupiedRooms / totalRooms) * 100);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceData.filter(a => a.date === today && a.status === 'present').length;
    const attendanceRate = studentData.length > 0 ? Math.round((todayAttendance / studentData.length) * 100) : 0;
    
    const paidPayments = paymentData.filter(p => p.status === 'paid').length;
    const feeStatus = paidPayments > 0 ? 'Paid' : 'Pending';
    
    pendingLeavesEl.textContent = pendingLeaves;
    totalFeedbackEl.textContent = totalFeedback;
    totalReportsEl.textContent = totalReports;
    roomOccupancyEl.textContent = `${roomOccupancy}%`;
    todayAttendanceEl.textContent = `${attendanceRate}%`;
    feeStatusEl.textContent = feeStatus;
    
    totalStudentsEl.textContent = studentData.length;
    
    const avgRating = feedbackData.length > 0 
        ? (feedbackData.reduce((sum, feedback) => sum + feedback.foodRating, 0) / feedbackData.length).toFixed(1)
        : '0.0';
    messRatingEl.textContent = `${avgRating}/5`;
    
    roomOccupancyDashboardEl.textContent = `${roomOccupancy}%`;
    attendanceRateEl.textContent = `${attendanceRate}%`;
}

// Render feedback list
async function renderFeedbackList() {
    feedbackList.innerHTML = '';
    
    if (feedbackData.length === 0) {
        feedbackList.innerHTML = '<div class="feedback-item">No feedback submitted yet.</div>';
        return;
    }
    
    feedbackData.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= feedback.foodRating ? '★' : '☆';
        }
        
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-user">${feedback.user}</div>
                <div class="feedback-date">${new Date(feedback.date).toLocaleDateString()}</div>
            </div>
            <div class="feedback-rating">
                <span>${stars}</span>
                <span>${feedback.mealType}</span>
            </div>
            <div class="feedback-message">${feedback.comments}</div>
            ${feedback.response ? `
                <div class="feedback-response">
                    <strong>Warden Response:</strong> ${feedback.response}
                </div>
            ` : ''}
        `;
        
        feedbackList.appendChild(feedbackItem);
    });
}

// Render leaves
async function renderLeaves() {
    myLeavesList.innerHTML = '';
    allLeavesList.innerHTML = '';
    
    const myLeaves = leaveData.filter(leave => leave.email === currentUser.email);
    
    if (myLeaves.length === 0) {
        myLeavesList.innerHTML = '<div class="leave-item">No leave applications found.</div>';
    } else {
        myLeaves.forEach(leave => {
            const leaveItem = document.createElement('div');
            leaveItem.className = 'leave-item';
            
            leaveItem.innerHTML = `
                <div class="leave-header">
                    <div>
                        <strong>${leave.type} Leave</strong>
                        <div>${leave.from} to ${leave.to}</div>
                    </div>
                    <div class="leave-status status-${leave.status}">${leave.status}</div>
                </div>
                <div class="leave-reason">${leave.reason}</div>
                <div class="leave-date">Applied on: ${new Date(leave.date).toLocaleDateString()}</div>
            `;
            
            myLeavesList.appendChild(leaveItem);
        });
    }
    
    if (currentUser.isAdmin) {
        if (leaveData.length === 0) {
            allLeavesList.innerHTML = '<div class="leave-item">No leave applications found.</div>';
        } else {
            leaveData.forEach(leave => {
                const leaveItem = document.createElement('div');
                leaveItem.className = 'leave-item';
                
                leaveItem.innerHTML = `
                    <div class="leave-header">
                        <div>
                            <strong>${leave.user}</strong>
                            <div>${leave.type} Leave: ${leave.from} to ${leave.to}</div>
                        </div>
                        <div class="leave-status status-${leave.status}">${leave.status}</div>
                    </div>
                    <div class="leave-reason">${leave.reason}</div>
                    <div class="leave-actions">
                        ${leave.status === 'pending' ? `
                            <button class="btn btn-success btn-sm" onclick="updateLeaveStatus('${leave._id}', 'approved')">Approve</button>
                            <button class="btn btn-danger btn-sm" onclick="updateLeaveStatus('${leave._id}', 'rejected')">Reject</button>
                        ` : ''}
                    </div>
                `;
                
                allLeavesList.appendChild(leaveItem);
            });
        }
    }
}

// Render students
async function renderStudents() {
    studentList.innerHTML = '';
    
    if (studentData.length === 0) {
        studentList.innerHTML = '<div class="student-item">No students found.</div>';
        return;
    }
    
    studentData.forEach(student => {
        const studentItem = document.createElement('div');
        studentItem.className = 'student-item';
        
        studentItem.innerHTML = `
            <div>
                <strong>${student.name}</strong>
                <div>${student.roll} | ${student.department} | Room: ${student.room}</div>
                <div>${student.email} | ${student.phone}</div>
            </div>
            <div class="student-actions">
                <button class="btn btn-warning btn-sm" onclick="editStudent('${student._id}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent('${student._id}')">Delete</button>
            </div>
        `;
        
        studentList.appendChild(studentItem);
    });
}

// Render reports
async function renderReports() {
    myReportsList.innerHTML = '';
    allReportsList.innerHTML = '';
    
    const myReports = reportData.filter(report => report.email === currentUser.email);
    
    if (myReports.length === 0) {
        myReportsList.innerHTML = '<div class="report-item">No reports found.</div>';
    } else {
        myReports.forEach(report => {
            const reportItem = document.createElement('div');
            reportItem.className = 'report-item';
            
            reportItem.innerHTML = `
                <div class="report-header">
                    <div class="report-category">${report.category}</div>
                    <div class="leave-status status-${report.status}">${report.status}</div>
                </div>
                <div><strong>Location:</strong> ${report.location}</div>
                <div><strong>Urgency:</strong> ${report.urgency}</div>
                <div><strong>Description:</strong> ${report.description}</div>
                <div class="report-date">Reported on: ${new Date(report.date).toLocaleDateString()}</div>
            `;
            
            myReportsList.appendChild(reportItem);
        });
    }
    
    if (currentUser.isAdmin) {
        if (reportData.length === 0) {
            allReportsList.innerHTML = '<div class="report-item">No reports found.</div>';
        } else {
            reportData.forEach(report => {
                const reportItem = document.createElement('div');
                reportItem.className = 'report-item';
                
                reportItem.innerHTML = `
                    <div class="report-header">
                        <div>
                            <strong>${report.user}</strong>
                            <div class="report-category">${report.category}</div>
                        </div>
                        <div class="leave-status status-${report.status}">${report.status}</div>
                    </div>
                    <div><strong>Location:</strong> ${report.location}</div>
                    <div><strong>Urgency:</strong> ${report.urgency}</div>
                    <div><strong>Description:</strong> ${report.description}</div>
                    <div class="report-actions">
                        ${report.status === 'pending' ? `
                            <button class="btn btn-success btn-sm" onclick="updateReportStatus('${report._id}', 'in-progress')">Start Work</button>
                        ` : report.status === 'in-progress' ? `
                            <button class="btn btn-success btn-sm" onclick="updateReportStatus('${report._id}', 'resolved')">Mark Resolved</button>
                        ` : ''}
                    </div>
                `;
                
                allReportsList.appendChild(reportItem);
            });
        }
    }
}

// Render announcements
function renderAnnouncements() {
    announcementsList.innerHTML = '';
    
    announcements.forEach(announcement => {
        const announcementItem = document.createElement('div');
        announcementItem.className = 'feedback-item';
        
        announcementItem.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-user">${announcement.title}</div>
                <div class="feedback-date">${announcement.date}</div>
            </div>
            <div class="feedback-message">${announcement.content}</div>
        `;
        
        announcementsList.appendChild(announcementItem);
    });
}

// Render recent activity
function renderRecentActivity() {
    recentActivity.innerHTML = '';
    
    const activities = [];
    
    feedbackData.slice(0, 3).forEach(feedback => {
        activities.push({
            type: 'feedback',
            user: feedback.user,
            content: `Submitted feedback for ${feedback.mealType}`,
            date: feedback.date
        });
    });
    
    leaveData.slice(0, 3).forEach(leave => {
        activities.push({
            type: 'leave',
            user: leave.user,
            content: `Applied for ${leave.type} leave`,
            date: leave.date
        });
    });
    
    reportData.slice(0, 3).forEach(report => {
        activities.push({
            type: 'report',
            user: report.user,
            content: `Reported ${report.category} issue`,
            date: report.date
        });
    });
    
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    activities.slice(0, 5).forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'feedback-item';
        
        activityItem.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-user">${activity.user}</div>
                <div class="feedback-date">${new Date(activity.date).toLocaleDateString()}</div>
            </div>
            <div class="feedback-message">${activity.content}</div>
        `;
        
        recentActivity.appendChild(activityItem);
    });
}

// Initialize room management
function initializeRoomManagement() {
    allocateStudent.innerHTML = '<option value="">Select Student</option>';
    studentData.forEach(student => {
        const option = document.createElement('option');
        option.value = student._id;
        option.textContent = `${student.name} (${student.roll})`;
        allocateStudent.appendChild(option);
    });
    
    allocateRoom.innerHTML = '<option value="">Select Room</option>';
    const hostel = hostelData[currentUser.hostelType].find(h => h.name === currentUser.hostelName);
    if (hostel) {
        hostel.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room;
            option.textContent = room;
            allocateRoom.appendChild(option);
        });
    }
    
    renderRoomAllocations();
    renderRoomAvailability();
}

// Render room allocations
async function renderRoomAllocations() {
    roomAllocationsList.innerHTML = '';
    
    const filteredAllocations = roomAllocations.filter(
        allocation => allocation.hostelName === currentUser.hostelName
    );
    
    if (filteredAllocations.length === 0) {
        roomAllocationsList.innerHTML = '<div class="student-item">No room allocations found.</div>';
        return;
    }
    
    filteredAllocations.forEach(allocation => {
        const allocationItem = document.createElement('div');
        allocationItem.className = 'student-item';
        
        allocationItem.innerHTML = `
            <div>
                <strong>${allocation.studentName}</strong>
                <div>Room: ${allocation.roomNumber}</div>
                <div>Allocated on: ${new Date(allocation.allocationDate).toLocaleDateString()}</div>
            </div>
            <div class="student-actions">
                <button class="btn btn-danger btn-sm" onclick="vacateRoom('${allocation._id}')">Vacate</button>
            </div>
        `;
        
        roomAllocationsList.appendChild(allocationItem);
    });
}

// Render room availability
function renderRoomAvailability() {
    roomAvailabilityGrid.innerHTML = '';
    
    const hostel = hostelData[currentUser.hostelType].find(h => h.name === currentUser.hostelName);
    if (!hostel) return;
    
    hostel.rooms.forEach(room => {
        const allocation = roomAllocations.find(
            a => a.roomNumber === room && a.hostelName === currentUser.hostelName && a.status === 'occupied'
        );
        
        const roomCard = document.createElement('div');
        roomCard.className = `room-card ${allocation ? 'room-occupied' : 'room-available'}`;
        
        roomCard.innerHTML = `
            <div><strong>Room ${room}</strong></div>
            <div>${allocation ? `Occupied by ${allocation.studentName}` : 'Available'}</div>
            <div class="room-status">${allocation ? 'Occupied' : 'Available'}</div>
        `;
        
        roomAvailabilityGrid.appendChild(roomCard);
    });
}

// Initialize attendance system
function initializeAttendance() {
    attendanceDate.value = new Date().toISOString().split('T')[0];
    renderAttendanceStudentList();
}

// Render attendance student list
function renderAttendanceStudentList() {
    attendanceStudentList.innerHTML = '';
    
    if (studentData.length === 0) {
        attendanceStudentList.innerHTML = '<div class="student-item">No students found.</div>';
        return;
    }
    
    studentData.forEach(student => {
        const studentItem = document.createElement('div');
        studentItem.className = 'student-item';
        
        studentItem.innerHTML = `
            <div>
                <strong>${student.name}</strong>
                <div>${student.roll} | Room: ${student.room}</div>
            </div>
            <div>
                <input type="checkbox" class="attendance-checkbox" 
                       data-student-id="${student._id}" 
                       data-student-name="${student.name}" checked>
                <label>Present</label>
            </div>
        `;
        
        attendanceStudentList.appendChild(studentItem);
    });
}

// Render attendance calendar
function renderAttendanceCalendar() {
    attendanceCalendar.innerHTML = '';
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.style.fontWeight = 'bold';
        attendanceCalendar.appendChild(dayElement);
    });
    
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = i;
        
        if (i === today.getDate()) {
            dayElement.style.border = '2px solid var(--primary)';
        }
        
        if (Math.random() > 0.3) {
            dayElement.classList.add('present');
        } else if (Math.random() > 0.5) {
            dayElement.classList.add('absent');
        }
        
        attendanceCalendar.appendChild(dayElement);
    }
}

// Initialize visitors system
function initializeVisitors() {
    studentVisiting.innerHTML = '<option value="">Select Student</option>';
    studentData.forEach(student => {
        const option = document.createElement('option');
        option.value = student._id;
        option.textContent = `${student.name} (${student.roll})`;
        studentVisiting.appendChild(option);
    });
    
    renderVisitorRecords();
}

// Render visitor records
async function renderVisitorRecords() {
    visitorRecordsList.innerHTML = '';
    
    if (visitorData.length === 0) {
        visitorRecordsList.innerHTML = '<div class="student-item">No visitor records found.</div>';
        return;
    }
    
    visitorData.forEach(visitor => {
        const visitorItem = document.createElement('div');
        visitorItem.className = 'student-item';
        
        visitorItem.innerHTML = `
            <div>
                <strong>${visitor.name}</strong>
                <div>Phone: ${visitor.phone}</div>
                <div>Visiting: ${visitor.studentVisiting}</div>
                <div>Purpose: ${visitor.purpose}</div>
                <div>Entry: ${new Date(visitor.entryTime).toLocaleString()}</div>
                ${visitor.exitTime ? `<div>Exit: ${new Date(visitor.exitTime).toLocaleString()}</div>` : ''}
            </div>
            <div class="student-actions">
                ${visitor.status === 'visiting' ? `
                    <button class="btn btn-success btn-sm" onclick="markVisitorExit('${visitor._id}')">Mark Exit</button>
                ` : ''}
            </div>
        `;
        
        visitorRecordsList.appendChild(visitorItem);
    });
}

// Initialize payments system
function initializePayments() {
    paymentStudent.innerHTML = '<option value="">Select Student</option>';
    studentData.forEach(student => {
        const option = document.createElement('option');
        option.value = student._id;
        option.textContent = `${student.name} (${student.roll})`;
        paymentStudent.appendChild(option);
    });
    
    renderPaymentRecords();
}

// Render payment records
async function renderPaymentRecords() {
    paymentRecordsList.innerHTML = '';
    
    if (paymentData.length === 0) {
        paymentRecordsList.innerHTML = '<div class="student-item">No payment records found.</div>';
        return;
    }
    
    paymentData.forEach(payment => {
        const paymentItem = document.createElement('div');
        paymentItem.className = 'student-item';
        
        paymentItem.innerHTML = `
            <div>
                <strong>${payment.studentName}</strong>
                <div>Amount: ₹${payment.amount}</div>
                <div>Type: ${payment.type}</div>
                <div>Method: ${payment.method}</div>
                <div>Date: ${payment.date}</div>
            </div>
            <div class="student-actions">
                <span class="leave-status status-${payment.status}">${payment.status}</span>
            </div>
        `;
        
        paymentRecordsList.appendChild(paymentItem);
    });
}

// Profile settings
async function saveProfileSettings() {
    const displayName = displayNameInput.value;
    const roomNumber = roomNumberInput.value;
    
    if (!displayName || !roomNumber) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    currentUser.name = displayName;
    currentUser.room = roomNumber;
    
    userDisplayName.textContent = displayName;
    userAvatar.textContent = displayName.charAt(0).toUpperCase();
    profilePicture.textContent = displayName.charAt(0).toUpperCase();
    userRoom.textContent = roomNumber;
    
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showNotification('Profile updated successfully!', 'success');
}

// Upload profile picture
function uploadProfilePicture() {
    const file = profilePictureInput.files[0];
    
    if (!file) {
        showNotification('Please select a file', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const imageUrl = e.target.result;
        
        currentUser.avatar = imageUrl;
        
        userAvatar.style.backgroundImage = `url(${imageUrl})`;
        userAvatar.textContent = '';
        profilePicture.style.backgroundImage = `url(${imageUrl})`;
        profilePicture.textContent = '';
        
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
        }
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Profile picture updated successfully!', 'success');
    };
    
    reader.readAsDataURL(file);
}

// Show notification
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ADMIN FUNCTIONS

// Update leave status
async function updateLeaveStatus(leaveId, status) {
    const leaveIndex = leaveData.findIndex(leave => leave._id === leaveId);
    
    if (leaveIndex !== -1) {
        leaveData[leaveIndex].status = status;
        await MongoDBService.updateLeave(leaveId, { status: status });
        leaveData = await MongoDBService.getLeaves();
        
        await renderLeaves();
        await updateStats();
        
        showNotification(`Leave application ${status}`, 'success');
    }
}

// Update report status
async function updateReportStatus(reportId, status) {
    const reportIndex = reportData.findIndex(report => report._id === reportId);
    
    if (reportIndex !== -1) {
        reportData[reportIndex].status = status;
        await MongoDBService.updateReport(reportId, { status: status });
        reportData = await MongoDBService.getReports();
        
        await renderReports();
        await updateStats();
        
        showNotification(`Report marked as ${status}`, 'success');
    }
}

// Edit student
function editStudent(studentId) {
    const student = studentData.find(s => s._id === studentId);
    
    if (student) {
        document.getElementById('studentName').value = student.name;
        document.getElementById('studentRoll').value = student.roll;
        document.getElementById('studentEmail').value = student.email;
        document.getElementById('studentRoom').value = student.room;
        document.getElementById('studentDepartment').value = student.department;
        document.getElementById('studentPhone').value = student.phone;
        
        showNotification('Student data loaded for editing', 'success');
    }
}

// Delete student
async function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        await MongoDBService.deleteStudent(studentId);
        studentData = await MongoDBService.getStudents();
        
        await renderStudents();
        await updateStats();
        
        showNotification('Student deleted successfully', 'success');
    }
}

// Vacate room
async function vacateRoom(allocationId) {
    if (confirm('Are you sure you want to vacate this room?')) {
        const allocationIndex = roomAllocations.findIndex(a => a._id === allocationId);
        
        if (allocationIndex !== -1) {
            roomAllocations[allocationIndex].status = 'vacated';
            await MongoDBService.updateRoomAllocation(allocationId, { status: 'vacated' });
            roomAllocations = await MongoDBService.getRoomAllocations();
            
            await renderRoomAllocations();
            renderRoomAvailability();
            await updateStats();
            
            showNotification('Room vacated successfully', 'success');
        }
    }
}

// Mark visitor exit
async function markVisitorExit(visitorId) {
    const visitorIndex = visitorData.findIndex(v => v._id === visitorId);
    
    if (visitorIndex !== -1) {
        visitorData[visitorIndex].exitTime = new Date().toISOString();
        visitorData[visitorIndex].status = 'left';
        await MongoDBService.updateVisitor(visitorId, { 
            exitTime: new Date().toISOString(), 
            status: 'left' 
        });
        visitorData = await MongoDBService.getVisitors();
        
        await renderVisitorRecords();
        
        showNotification('Visitor exit recorded', 'success');
    }
}