const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management';

// Connect to MongoDB with error handling
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.log('MongoDB connection error:', error);
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    room: { type: String, required: true },
    hostelType: { type: String, required: true },
    hostelName: { type: String, required: true },
    avatar: { type: String, default: '' },
    theme: { type: String, default: 'light' },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    mealType: { type: String, required: true },
    foodRating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, required: true },
    response: { type: String, default: null },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const leaveSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roll: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    room: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String, default: '' }
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    urgency: { type: String, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const roomAllocationSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    hostelName: { type: String, required: true },
    allocationDate: { type: Date, required: true },
    status: { type: String, default: 'occupied' }
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    recordedBy: { type: String, required: true }
}, { timestamps: true });

const visitorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    purpose: { type: String, required: true },
    studentVisiting: { type: String, required: true },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date, default: null },
    status: { type: String, default: 'visiting' },
    expectedDuration: { type: Number, required: true }
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    method: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, default: 'paid' }
}, { timestamps: true });

// MongoDB Models
const User = mongoose.model('User', userSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Leave = mongoose.model('Leave', leaveSchema);
const Student = mongoose.model('Student', studentSchema);
const Report = mongoose.model('Report', reportSchema);
const RoomAllocation = mongoose.model('RoomAllocation', roomAllocationSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Visitor = mongoose.model('Visitor', visitorSchema);
const Payment = mongoose.model('Payment', paymentSchema);

// API Routes

// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Feedback
app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/feedback', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/feedback/:id', async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Leaves
app.get('/api/leaves', async (req, res) => {
    try {
        const leaves = await Leave.find().sort({ createdAt: -1 });
        res.json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/leaves', async (req, res) => {
    try {
        const leave = new Leave(req.body);
        await leave.save();
        res.json({ success: true, data: leave });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/leaves/:id', async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: leave });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { deletedCount: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Reports
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/reports', async (req, res) => {
    try {
        const report = new Report(req.body);
        await report.save();
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/reports/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Room Allocations
app.get('/api/room-allocations', async (req, res) => {
    try {
        const allocations = await RoomAllocation.find().sort({ createdAt: -1 });
        res.json({ success: true, data: allocations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/room-allocations', async (req, res) => {
    try {
        const allocation = new RoomAllocation(req.body);
        await allocation.save();
        res.json({ success: true, data: allocation });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/room-allocations/:id', async (req, res) => {
    try {
        const allocation = await RoomAllocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: allocation });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Attendance
app.get('/api/attendance', async (req, res) => {
    try {
        const attendance = await Attendance.find().sort({ createdAt: -1 });
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/attendance', async (req, res) => {
    try {
        const attendance = new Attendance(req.body);
        await attendance.save();
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Visitors
app.get('/api/visitors', async (req, res) => {
    try {
        const visitors = await Visitor.find().sort({ createdAt: -1 });
        res.json({ success: true, data: visitors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/visitors', async (req, res) => {
    try {
        const visitor = new Visitor(req.body);
        await visitor.save();
        res.json({ success: true, data: visitor });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/visitors/:id', async (req, res) => {
    try {
        const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: visitor });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Payments
app.get('/api/payments', async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const payment = new Payment(req.body);
        await payment.save();
        res.json({ success: true, data: payment });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running', 
        timestamp: new Date().toISOString() 
    });
});

// Serve the main application - THIS MUST BE THE LAST ROUTE
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize sample data
async function initSampleData() {
    try {
        // Check if sample data already exists
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            // Create sample users
            const sampleUsers = [
                {
                    email: '23cb001@drngpit.ac.in',
                    password: '23cb001',
                    name: '23CB001',
                    room: '101',
                    hostelType: 'boys',
                    hostelName: 'Marutham Hostel'
                },
                {
                    email: '23cb002@drngpit.ac.in',
                    password: '23cb002',
                    name: '23CB002',
                    room: '102',
                    hostelType: 'boys',
                    hostelName: 'Marutham Hostel'
                }
            ];

            for (const userData of sampleUsers) {
                const user = new User(userData);
                await user.save();
            }

            console.log('Sample data initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing sample data:', error);
    }
}

// Initialize data when server starts
initSampleData();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export for Vercel
module.exports = app;