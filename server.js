
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

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
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    mealType: { type: String, required: true },
    foodRating: { type: Number, required: true, min: 1, max: 5 },
    menuRating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    response: { type: String, default: null },
    respondedAt: { type: Date, default: null }
});

const leaveSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
    date: { type: Date, default: Date.now },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null }
});

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roll: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    room: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String, default: '' },
    date: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    urgency: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'] },
    status: { type: String, default: 'pending', enum: ['pending', 'in-progress', 'resolved'] },
    date: { type: Date, default: Date.now },
    resolvedBy: { type: String, default: null },
    resolvedAt: { type: Date, default: null }
});

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'info', enum: ['info', 'warning', 'important'] },
    date: { type: String, required: true },
    createdBy: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now }
});

// MongoDB Models
const User = mongoose.model('User', userSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Leave = mongoose.model('Leave', leaveSchema);
const Student = mongoose.model('Student', studentSchema);
const Report = mongoose.model('Report', reportSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);

// API Routes

// Users Routes
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ success: false, error: 'User with this email already exists' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Feedback Routes
app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ date: -1 });
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/feedback', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.status(201).json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/feedback/:id', async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!feedback) {
            return res.status(404).json({ success: false, error: 'Feedback not found' });
        }
        
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/feedback/:id', async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        
        if (!feedback) {
            return res.status(404).json({ success: false, error: 'Feedback not found' });
        }
        
        res.json({ success: true, message: 'Feedback deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Leave Routes - CORRECTED version
app.get('/api/leaves', async (req, res) => {
    try {
        const leaves = await Leave.find().sort({ date: -1 });
        res.json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/leaves', async (req, res) => {
    try {
        const leave = new Leave(req.body);
        await leave.save();
        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// CORRECTED PUT route - fix the parameter name
app.put('/api/leaves/:id', async (req, res) => {
    try {
        const updates = req.body;
        const leaveId = req.params.id; // This was the main issue
        
        console.log('Updating leave:', leaveId, 'with:', updates);
        
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(leaveId)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid leave ID format' 
            });
        }
        
        // If status is being updated to approved/rejected, add approval info
        if (updates.status === 'approved' || updates.status === 'rejected') {
            updates.approvedBy = 'Admin';
            updates.approvedAt = new Date();
        }
        
        const leave = await Leave.findByIdAndUpdate(
            leaveId,
            updates,
            { new: true, runValidators: true }
        );
        
        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }
        
        console.log('Leave updated successfully:', leave);
        res.json({ success: true, data: leave });
    } catch (error) {
        console.error('Error updating leave:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid leave ID format' 
            });
        }
        
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/leaves/:id', async (req, res) => {
    try {
        const leave = await Leave.findByIdAndDelete(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ success: false, error: 'Leave not found' });
        }
        
        res.json({ success: true, message: 'Leave deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Student Routes
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ date: -1 });
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({ success: true, data: student });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ success: false, error: 'Student with this roll number or email already exists' });
        } else {
            res.status(500).json({ success: false, error: error.message });
        }
    }
});

app.put('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Report Routes
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find().sort({ date: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/reports', async (req, res) => {
    try {
        const report = new Report(req.body);
        await report.save();
        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/reports/:id', async (req, res) => {
    try {
        const updates = req.body;
        
        // If status is being updated to resolved, add resolution info
        if (updates.status === 'resolved') {
            updates.resolvedBy = 'Admin';
            updates.resolvedAt = new Date();
        }
        
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );
        
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }
        
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/reports/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        
        if (!report) {
            return res.status(404).json({ success: false, error: 'Report not found' });
        }
        
        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Announcement Routes
app.get('/api/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json({ success: true, data: announcements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/announcements', async (req, res) => {
    try {
        const announcement = new Announcement(req.body);
        await announcement.save();
        res.status(201).json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Dashboard Stats Route
app.get('/api/stats', async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalFeedback = await Feedback.countDocuments();
        const totalLeaves = await Leave.countDocuments();
        const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'pending' });
        
        // Calculate average ratings
        const feedbackStats = await Feedback.aggregate([
            {
                $group: {
                    _id: null,
                    avgFoodRating: { $avg: '$foodRating' },
                    avgMenuRating: { $avg: '$menuRating' }
                }
            }
        ]);
        
        const avgFoodRating = feedbackStats.length > 0 ? feedbackStats[0].avgFoodRating : 0;
        const avgMenuRating = feedbackStats.length > 0 ? feedbackStats[0].avgMenuRating : 0;
        const overallRating = ((avgFoodRating + avgMenuRating) / 2).toFixed(1);
        
        res.json({
            success: true,
            data: {
                totalStudents,
                totalFeedback,
                totalLeaves,
                pendingLeaves,
                totalReports,
                pendingReports,
                overallRating
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Initialize sample data
app.post('/api/init-data', async (req, res) => {
    try {
        // Create sample announcements
        const sampleAnnouncements = [
            {
                title: "Power Cut Notice",
                content: "There will be no power supply this Saturday from 10 AM to 4 PM for maintenance work.",
                date: "2023-10-28",
                type: "info"
            },
            {
                title: "Water Supply Interruption",
                content: "Water supply will be interrupted on Friday from 10 AM to 12 PM for pipeline repairs.",
                date: "2023-10-27",
                type: "warning"
            },
            {
                title: "Hostel Fee Payment",
                content: "Last date for hostel fee payment is 30th October. Late payment will incur a fine.",
                date: "2023-10-25",
                type: "important"
            }
        ];
        
        await Announcement.deleteMany({});
        await Announcement.insertMany(sampleAnnouncements);
        
        res.json({ success: true, message: 'Sample data initialized successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Default route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Smart Hostel Management System API',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            feedback: '/api/feedback',
            leaves: '/api/leaves',
            students: '/api/students',
            reports: '/api/reports',
            announcements: '/api/announcements',
            stats: '/api/stats'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});