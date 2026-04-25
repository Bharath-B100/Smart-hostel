// MongoDB Configuration
const MONGODB_CONFIG = {
    API_URL: window.location.origin + '/api'
    // This will automatically work for both localhost and production
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

            // Add JWT token if available
            const token = localStorage.getItem('authToken');
            if (token) {
                options.headers['Authorization'] = `Bearer ${token}`;
            }

            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${MONGODB_CONFIG.API_URL}/${endpoint}`, options);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
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
        const result = await this.makeAPIRequest(`users/${userId}`, 'PUT', updates);
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
        const result = await this.makeAPIRequest(`feedback/${feedbackId}`, 'PUT', updates);
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
        const result = await this.makeAPIRequest(`leaves/${leaveId}`, 'PUT', updates);
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
        const result = await this.makeAPIRequest(`students/${studentId}`, 'PUT', updates);
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
        const result = await this.makeAPIRequest(`reports/${reportId}`, 'PUT', updates);
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
    
    static async updateRoomAllocation(allocationId, updates) {
        const result = await this.makeAPIRequest(`room-allocations/${allocationId}`, 'PUT', updates);
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
    
    static async updateVisitor(visitorId, updates) {
        const result = await this.makeAPIRequest(`visitors/${visitorId}`, 'PUT', updates);
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
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelector('.nav-links');
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

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;

    return strength;
}

function updatePasswordStrengthIndicator(password) {
    const strength = checkPasswordStrength(password);
    const bars = document.querySelectorAll('.password-strength-bar');
    const text = document.getElementById('password-strength-text');

    bars.forEach((bar, index) => {
        bar.classList.remove('weak', 'medium', 'strong');
        if (index < strength) {
            if (strength === 1) bar.classList.add('weak');
            else if (strength === 2) bar.classList.add('medium');
            else if (strength >= 3) bar.classList.add('strong');
        }
    });

    if (text) {
        if (password.length === 0) {
            text.textContent = '';
        } else if (strength === 1) {
            text.textContent = 'Weak password';
        } else if (strength === 2) {
            text.textContent = 'Medium password';
        } else if (strength >= 3) {
            text.textContent = 'Strong password';
        } else {
            text.textContent = 'Very weak password';
        }
    }
}

// Load saved theme from localStorage
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
        if (themeSelect) {
            themeSelect.value = 'dark';
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSavedTheme();

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
        showNotification('Failed to load initial data. Using local storage fallback.', 'warning');
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

    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrengthIndicator(this.value);
        });
    }

    showAdminLogin.addEventListener('click', () => adminLoginModal.style.display = 'flex');
    closeAdminModal.addEventListener('click', () => adminLoginModal.style.display = 'none');
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    logoutBtn.addEventListener('click', handleLogout);
    logoutSettingsBtn.addEventListener('click', handleLogout);
    themeToggle.addEventListener('click', toggleTheme);
    themeSelect.addEventListener('change', handleThemeChange);

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            navLinks.classList.toggle('mobile-active');
            mobileMenuToggle.setAttribute('aria-expanded', navLinks.classList.contains('mobile-active'));
        });
    }

    // Scroll to top button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // User dropdown toggle
    const userDropdownToggle = document.getElementById('userDropdownToggle');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    if (userDropdownToggle && userDropdownMenu) {
        userDropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userDropdownToggle.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }

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

    // Student form validation
    const studentEmailInput = document.getElementById('studentEmail');
    const studentPhoneInput = document.getElementById('studentPhone');
    const studentRollInput = document.getElementById('studentRoll');

    if (studentEmailInput) {
        studentEmailInput.addEventListener('input', function() {
            if (this.value) {
                setFieldValidation(this, validateCollegeEmail(this.value), 'Please enter a valid college email (@drngpit.ac.in)');
            } else {
                clearFieldValidation(this);
            }
        });
    }

    if (studentPhoneInput) {
        studentPhoneInput.addEventListener('input', function() {
            if (this.value) {
                setFieldValidation(this, validatePhone(this.value), 'Please enter a valid 10-digit phone number');
            } else {
                clearFieldValidation(this);
            }
        });
    }

    if (studentRollInput) {
        studentRollInput.addEventListener('input', function() {
            if (this.value) {
                setFieldValidation(this, validateRollNumber(this.value), 'Please enter a valid roll number (e.g., 23CB001)');
            } else {
                clearFieldValidation(this);
            }
        });
    }
    reportForm.addEventListener('submit', handleReportSubmit);
    saveProfileBtn.addEventListener('click', saveProfileSettings);
    uploadPictureBtn.addEventListener('click', uploadProfilePicture);

    // Search functionality
    const searchStudentList = document.getElementById('searchStudentList');
    if (searchStudentList) {
        searchStudentList.addEventListener('input', handleStudentSearch);
    }

    const searchReports = document.getElementById('searchReports');
    if (searchReports) {
        searchReports.addEventListener('input', handleReportSearch);
    }

    const searchStudent = document.getElementById('searchStudent');
    if (searchStudent) {
        searchStudent.addEventListener('input', handleLeaveSearch);
    }
    
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
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    if (!email.endsWith('@drngpit.ac.in')) {
        showNotification('Please use your college email ID (@drngpit.ac.in)', 'error');
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    try {
        const response = await fetch(`${MONGODB_CONFIG.API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, isAdmin: false })
        });

        const result = await response.json();

        console.log('Login response:', result);

        if (result.success) {
            // Store JWT token
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('currentUser', JSON.stringify(result.data.user));

            currentUser = result.data.user;
            showApp();
            showNotification('Login successful!', 'success');
        } else {
            console.error('Login error:', result.error);
            showNotification(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

// Handle admin login
async function handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const submitBtn = adminLoginForm.querySelector('button[type="submit"]');

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    try {
        const response = await fetch(`${MONGODB_CONFIG.API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: username, password, isAdmin: true })
        });

        const result = await response.json();

        if (result.success) {
            // Store JWT token
            localStorage.setItem('authToken', result.data.token);
            localStorage.setItem('currentUser', JSON.stringify(result.data.user));

            currentUser = result.data.user;
            adminLoginModal.style.display = 'none';
            showApp();
            showNotification('Admin login successful!', 'success');
        } else {
            showNotification(result.error || 'Admin login failed', 'error');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showNotification('Admin login failed. Please try again.', 'error');
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login as Admin';
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
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

// Show/hide navigation based on user role
function setupRoleBasedNavigation() {
    if (!currentUser) return;

    const isAdmin = currentUser.isAdmin;
    const navLinks = document.querySelectorAll('.nav-links li');

    navLinks.forEach(li => {
        const link = li.querySelector('a');
        const navItem = link.getAttribute('data-nav');

        // Admin-only features
        const adminOnlyFeatures = ['students', 'rooms', 'attendance', 'payments'];

        if (adminOnlyFeatures.includes(navItem) && !isAdmin) {
            li.style.display = 'none';
        } else {
            li.style.display = 'block';
        }
    });

    // Add admin badge to header if admin
    if (isAdmin) {
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName) {
            userDisplayName.innerHTML = `${currentUser.name} <span class="admin-badge">Admin</span>`;
        }
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

    // Setup role-based navigation
    setupRoleBasedNavigation();

    if (currentUser.isAdmin) {
        wardenInfo.textContent = 'Administrator';
        userHostel.textContent = 'Administration';
        userWarden.textContent = 'System Admin';
        manageLeavesTab.style.display = 'block';
        allReportsTab.style.display = 'block';
    } else {
        const hostel = hostelData[currentUser.hostelType]?.find(h => h.name === currentUser.hostelName);
        if (hostel) {
            wardenInfo.textContent = `Warden: ${hostel.warden}`;
            userHostel.textContent = currentUser.hostelName;
            userWarden.textContent = hostel.warden;
        } else {
            wardenInfo.textContent = 'Warden: Not assigned';
            userHostel.textContent = 'Not assigned';
            userWarden.textContent = 'Not assigned';
        }
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
}

// Theme toggle functionality
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    currentUser.theme = isDark ? 'dark' : 'light';
    showNotification(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'success');

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
    const submitBtn = feedbackForm.querySelector('button[type="submit"]');

    if (!mealType || !foodRating) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const feedback = {
        user: currentUser.name,
        email: currentUser.email,
        mealType: mealType,
        foodRating: parseInt(foodRating.value),
        comments: comments,
        date: new Date().toISOString(),
        response: null
    };

    try {
        await MongoDBService.createFeedback(feedback);
        feedbackData = await MongoDBService.getFeedback();

        await updateStats();
        await renderFeedbackList();
        renderRecentActivity();

        showNotification('Thank you for your feedback!', 'success');
        feedbackForm.reset();
        clearFormValidation(feedbackForm);

        document.querySelectorAll('.rating label').forEach(label => {
            label.style.color = '#ddd';
        });
    } catch (error) {
        showNotification('Failed to submit feedback. Please try again.', 'error');
        console.error('Feedback submission error:', error);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Handle leave form submission
async function handleLeaveSubmit(e) {
    e.preventDefault();

    const leaveType = document.getElementById('leaveType').value;
    const leaveFrom = document.getElementById('leaveFrom').value;
    const leaveTo = document.getElementById('leaveTo').value;
    const leaveReason = document.getElementById('leaveReason').value;
    const submitBtn = leaveForm.querySelector('button[type="submit"]');

    if (!leaveType || !leaveFrom || !leaveTo || !leaveReason) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Validate dates - prevent past dates
    const today = new Date().toISOString().split('T')[0];
    if (leaveFrom < today) {
        showNotification('Leave start date cannot be in the past', 'error');
        return;
    }

    if (leaveTo < leaveFrom) {
        showNotification('Leave end date cannot be before start date', 'error');
        return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

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

    try {
        await MongoDBService.createLeave(leave);
        leaveData = await MongoDBService.getLeaves();

        await updateStats();
        await renderLeaves();
        renderRecentActivity();

        showNotification('Leave application submitted successfully!', 'success');
        leaveForm.reset();
        clearFormValidation(leaveForm);
    } catch (error) {
        showNotification('Failed to submit leave application. Please try again.', 'error');
        console.error('Leave submission error:', error);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
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
    const submitBtn = studentForm.querySelector('button[type="submit"]');

    if (!studentName || !studentRoll || !studentEmail || !studentRoom || !studentDepartment) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (studentData.find(s => s.roll === studentRoll)) {
        showNotification('Student with this roll number already exists', 'error');
        return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const student = {
        name: studentName,
        roll: studentRoll,
        email: studentEmail,
        room: studentRoom,
        department: studentDepartment,
        phone: studentPhone
    };

    try {
        await MongoDBService.createStudent(student);
        studentData = await MongoDBService.getStudents();

        await updateStats();
        await renderStudents();

        showNotification('Student added successfully!', 'success');
        studentForm.reset();
        clearFormValidation(studentForm);
    } catch (error) {
        showNotification('Failed to add student. Please try again.', 'error');
        console.error('Student submission error:', error);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Handle report form submission
async function handleReportSubmit(e) {
    e.preventDefault();

    const reportCategory = document.getElementById('reportCategory').value;
    const reportLocation = document.getElementById('reportLocation').value;
    const reportDescription = document.getElementById('reportDescription').value;
    const reportUrgency = document.getElementById('reportUrgency').value;
    const submitBtn = reportForm.querySelector('button[type="submit"]');

    if (!reportCategory || !reportLocation || !reportDescription || !reportUrgency) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

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

    try {
        await MongoDBService.createReport(report);
        reportData = await MongoDBService.getReports();

        await updateStats();
        await renderReports();
        renderRecentActivity();

        showNotification('Issue reported successfully!', 'success');
        reportForm.reset();
        clearFormValidation(reportForm);
    } catch (error) {
        showNotification('Failed to report issue. Please try again.', 'error');
        console.error('Report submission error:', error);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
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

    // Check if room is already occupied
    const existingAllocation = roomAllocations.find(
        a => a.roomNumber === roomNumber &&
        a.hostelName === currentUser.hostelName &&
        a.status === 'occupied'
    );

    if (existingAllocation) {
        showNotification('This room is already occupied by another student', 'error');
        return;
    }

    // Check if student already has a room allocation
    const studentExistingAllocation = roomAllocations.find(
        a => a.studentId === studentId &&
        a.status === 'occupied'
    );

    if (studentExistingAllocation) {
        showNotification('This student already has a room allocation', 'error');
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
    
    let totalRooms = 0;
    if (currentUser.hostelType && hostelData[currentUser.hostelType]) {
        const hostel = hostelData[currentUser.hostelType].find(h => h.name === currentUser.hostelName);
        if (hostel) {
            totalRooms = hostel.rooms.length;
        }
    }
    if (totalRooms === 0) totalRooms = 30; // Fallback to hardcoded value

    const occupiedRooms = roomAllocations.filter(room => room.status === 'occupied').length;
    const roomOccupancy = Math.round((occupiedRooms / totalRooms) * 100);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceData.filter(a => {
        const attendanceDate = new Date(a.date).toISOString().split('T')[0];
        return attendanceDate === today && a.status === 'present';
    }).length;
    const attendanceRate = studentData.length > 0 ? Math.round((todayAttendance / studentData.length) * 100) : 0;
    
    // Calculate fee status based on current user's payments
    let feeStatus = 'Pending';
    if (!currentUser.isAdmin && paymentData.length > 0) {
        const userPayments = paymentData.filter(p => p.studentId === currentUser._id || p.studentName === currentUser.name);
        if (userPayments.length > 0) {
            const totalPaid = userPayments.reduce((sum, p) => sum + p.amount, 0);
            const expectedFee = 50000; // Example expected annual fee
            if (totalPaid >= expectedFee) {
                feeStatus = 'Paid';
            } else {
                feeStatus = `Partial (₹${totalPaid}/${expectedFee})`;
            }
        }
    }
    
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
        feedbackList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-comment-slash"></i>
                </div>
                <div class="empty-state-title">No Feedback Yet</div>
                <div class="empty-state-description">Be the first to share your thoughts about the mess food!</div>
                <div class="empty-state-action">
                    <button class="btn btn-primary" onclick="handleNavigation('mess')">
                        <i class="fas fa-plus"></i> Submit Feedback
                    </button>
                </div>
            </div>
        `;
        return;
    }

    feedbackData.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <span class="feedback-user">${feedback.user}</span>
                <span class="feedback-date">${new Date(feedback.date).toLocaleDateString()}</span>
            </div>
            <div class="feedback-content">
                <p><strong>Meal:</strong> ${feedback.mealType}</p>
                <p><strong>Rating:</strong> ${'★'.repeat(feedback.foodRating)}${'☆'.repeat(5 - feedback.foodRating)}</p>
                <p><strong>Comments:</strong> ${feedback.comments || 'No comments'}</p>
                ${feedback.response ? `<p class="feedback-response"><strong>Response:</strong> ${feedback.response}</p>` : ''}
            </div>
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
        myLeavesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-calendar-times"></i>
                </div>
                <div class="empty-state-title">No Leave Applications</div>
                <div class="empty-state-description">You haven't applied for any leave yet.</div>
                <div class="empty-state-action">
                    <button class="btn btn-primary" onclick="handleNavigation('leave')">
                        <i class="fas fa-plus"></i> Apply for Leave
                    </button>
                </div>
            </div>
        `;
    }
    
    if (myLeaves.length > 0) {
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
            allLeavesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div class="empty-state-title">No Leave Applications</div>
                    <div class="empty-state-description">No students have applied for leave yet.</div>
                </div>
            `;
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
        studentList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div class="empty-state-title">No Students</div>
                <div class="empty-state-description">No students have been added to the system yet.</div>
                <div class="empty-state-action">
                    <button class="btn btn-primary" onclick="document.getElementById('studentName').focus()">
                        <i class="fas fa-plus"></i> Add First Student
                    </button>
                </div>
            </div>
        `;
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
        myReportsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="empty-state-title">No Reports</div>
                <div class="empty-state-description">You haven't reported any issues yet.</div>
                <div class="empty-state-action">
                    <button class="btn btn-primary" onclick="handleNavigation('reports')">
                        <i class="fas fa-plus"></i> Report an Issue
                    </button>
                </div>
            </div>
        `;
    }
    
    if (myReports.length > 0) {
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
        if (allReportsList.children.length === 0) {
            allReportsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <div class="empty-state-title">No Reports</div>
                    <div class="empty-state-description">No issues have been reported yet.</div>
                </div>
            `;
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

    if (roomAllocations.length === 0) {
        roomAllocationsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-door-open"></i>
                </div>
                <div class="empty-state-title">No Room Allocations</div>
                <div class="empty-state-description">No rooms have been allocated to students yet.</div>
                <div class="empty-state-action">
                    <button class="btn btn-primary" onclick="document.getElementById('allocateStudent').focus()">
                        <i class="fas fa-plus"></i> Allocate First Room
                    </button>
                </div>
            </div>
        `;
        return;
    }

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

        // Check actual attendance data for this day
        const currentDate = new Date(today.getFullYear(), today.getMonth(), i);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Get attendance records for this day
        const dayAttendance = attendanceData.filter(a => {
            const attendanceDate = new Date(a.date).toISOString().split('T')[0];
            return attendanceDate === dateStr;
        });

        if (dayAttendance.length > 0) {
            // Calculate present/absent ratio for the day
            const presentCount = dayAttendance.filter(a => a.status === 'present').length;
            const totalCount = dayAttendance.length;

            if (presentCount / totalCount > 0.5) {
                dayElement.classList.add('present');
            } else {
                dayElement.classList.add('absent');
            }
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
        visitorRecordsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-user-clock"></i>
                </div>
                <div class="empty-state-title">No Visitor Records</div>
                <div class="empty-state-description">No visitors have been registered yet.</div>
                <div class="empty-state-action">
                    <button class="btn btn-primary" onclick="document.getElementById('visitorName').focus()">
                        <i class="fas fa-plus"></i> Register First Visitor
                    </button>
                </div>
            </div>
        `;
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

// Render payment records
async function renderPaymentRecords() {
    paymentRecordsList.innerHTML = '';

    if (paymentData.length === 0) {
        paymentRecordsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-receipt"></i>
                </div>
                <div class="empty-state-title">No Payment Records</div>
                <div class="empty-state-description">No payments have been recorded yet.</div>
                <div class="empty-state-action">
                    <button class="btn btn-primary" onclick="document.getElementById('paymentAmount').focus()">
                        <i class="fas fa-plus"></i> Record First Payment
                    </button>
                </div>
            </div>
        `;
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

// Pagination state
let currentPage = 1;
const itemsPerPage = 10;

// Render pagination controls
function renderPagination(totalItems, containerId, renderCallback) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById(containerId);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let paginationHTML = `
        <div class="pagination">
            <button onclick="changePage(${currentPage - 1}, '${containerId}')" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            <span class="pagination-info">Page ${currentPage} of ${totalPages} (${totalItems} items)</span>
            <button onclick="changePage(${currentPage + 1}, '${containerId}')" ${currentPage === totalPages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    container.innerHTML = paginationHTML;
}

// Change page function
window.changePage = function(newPage, containerId) {
    currentPage = newPage;
    // Re-render the appropriate list based on containerId
    if (containerId === 'studentPagination') {
        renderStudents();
    } else if (containerId === 'leavePagination') {
        renderLeaves();
    } else if (containerId === 'reportPagination') {
        renderReports();
    }
};

// Field validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateCollegeEmail(email) {
    const collegeEmailRegex = /^[^\s@]+@drngpit\.ac\.in$/i;
    return collegeEmailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

function validateRollNumber(roll) {
    const rollRegex = /^[0-9]{2}[A-Z]{2}[0-9]{3}$/i;
    return rollRegex.test(roll);
}

function setFieldValidation(input, isValid, message) {
    const validationMsg = input.parentElement.querySelector('.validation-message');
    
    if (isValid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        if (validationMsg) {
            validationMsg.classList.remove('show');
        }
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        if (validationMsg) {
            validationMsg.textContent = message;
            validationMsg.classList.add('show');
        }
    }
}

function clearFieldValidation(input) {
    input.classList.remove('invalid', 'valid');
    const validationMsg = input.parentElement.querySelector('.validation-message');
    if (validationMsg) {
        validationMsg.classList.remove('show');
    }
}

function clearFormValidation(form) {
    const inputs = form.querySelectorAll('.form-control');
    inputs.forEach(input => clearFieldValidation(input));
}

// Show notification
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Search handler functions
function handleStudentSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const studentItems = document.querySelectorAll('#studentList .student-item');

    studentItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function handleReportSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const reportItems = document.querySelectorAll('#allReportsList .report-item');

    reportItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function handleLeaveSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const leaveItems = document.querySelectorAll('#allLeavesList .leave-item');

    leaveItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
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
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        return;
    }

    const studentIndex = studentData.findIndex(s => s._id === studentId);

    if (studentIndex !== -1) {
        await MongoDBService.deleteStudent(studentId);
        studentData = await MongoDBService.getStudents();

        await updateStats();
        await renderStudents();

        showNotification('Student deleted successfully!', 'success');
    }
}

// Vacate room
async function vacateRoom(allocationId) {
    if (!confirm('Are you sure you want to vacate this room? This action cannot be undone.')) {
        return;
    }

    const allocationIndex = roomAllocations.findIndex(a => a._id === allocationId);

    if (allocationIndex !== -1) {
        roomAllocations[allocationIndex].status = 'vacated';
        await MongoDBService.updateRoomAllocation(allocationId, { status: 'vacated' });
        roomAllocations = await MongoDBService.getRoomAllocations();

        await renderRoomAllocations();
        renderRoomAvailability();
        await updateStats();

        showNotification('Room vacated successfully!', 'success');
    }
}

// Mark visitor exit
async function markVisitorExit(visitorId) {
    if (!confirm('Are you sure you want to mark this visitor as exited?')) {
        return;
    }

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

// Make functions globally available for onclick events
window.updateLeaveStatus = updateLeaveStatus;
window.updateReportStatus = updateReportStatus;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.vacateRoom = vacateRoom;
window.markVisitorExit = markVisitorExit;