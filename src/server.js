const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const { hashPassword, comparePassword, generateToken, verifyToken } = require('./config/auth');
const { authenticate, requireAdmin } = require('./middleware/auth');
const { validate } = require('./middleware/validation');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('./routes/auth');
const feedbackRoutes = require('./routes/feedback');
const leaveRoutes = require('./routes/leaves');
const studentRoutes = require('./routes/students');
const reportRoutes = require('./routes/reports');
const roomAllocationRoutes = require('./routes/roomAllocations');
const attendanceRoutes = require('./routes/attendance');
const visitorRoutes = require('./routes/visitors');
const paymentRoutes = require('./routes/payments');

// Import models
const User = require('./models/User');

const app = express();

// Middleware - Compression for performance
app.use(compression());

// Security headers - configured to allow inline scripts/styles needed by the frontend
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:", "wss:"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files from public directory (no-cache in dev to prevent stale JS/CSS)
app.use(express.static(path.join(__dirname, '../public'), {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// MongoDB Connection - Import from lib
const { connectToDatabase } = require('./lib/db');

// Add middleware to ensure connection for all routes
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        logger.error('Database connection error:', error);
        // Don't block the request, routes will handle errors
        next();
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api/feedback', feedbackRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/room-allocations', roomAllocationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler for API routes
app.use('/api', notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Serve the main application - THIS MUST BE THE LAST ROUTE
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize sample data (with guard to prevent duplicate race conditions)
let sampleDataInitialized = false;
async function initSampleData() {
    try {
        // Always ensure admin user exists
        let adminUser = await User.findOne({ email: 'admin@drngpit.ac.in' });
        if (!adminUser) {
            adminUser = new User({
                email: 'admin@drngpit.ac.in',
                password: await hashPassword('Admin@123'),
                name: 'Admin',
                room: '001',
                hostelType: 'boys',
                hostelName: 'Marutham Hostel',
                isAdmin: true
            });
            await adminUser.save();
            console.log('Admin user created');
        }

        // Check if sample student data already exists
        const userCount = await User.countDocuments({ isAdmin: false });
        if (userCount === 0) {
            // Create sample users with hashed passwords
            const sampleUsers = [
                {
                    email: '23cb001@drngpit.ac.in',
                    password: await hashPassword('23cb001'),
                    name: '23CB001',
                    room: '101',
                    hostelType: 'boys',
                    hostelName: 'Marutham Hostel'
                },
                {
                    email: '23cb002@drngpit.ac.in',
                    password: await hashPassword('23cb002'),
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

// Initialize data when server starts - only if database is connected
if (require.main === module) {
    // Only initialize sample data when running directly, not in Vercel
    const initializeServer = async () => {
        const PORT = process.env.PORT || 3000;
        
        try {
            // Test database connection first
            await connectToDatabase();
            console.log('Database connected successfully');
            
            // Now initialize sample data
            await initSampleData();
            console.log('Sample data initialized');
        } catch (error) {
            console.error('Failed to initialize database:', error);
            console.log('Server will start anyway, but some features may not work');
        }
        
        // Start server regardless of database status
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    };
    
    initializeServer();
}

// Export for Vercel
module.exports = app;