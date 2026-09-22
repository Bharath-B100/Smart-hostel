const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const OTP = require('../models/OTP');
const { connectToDatabase } = require('../lib/db');
const logger = require('../config/logger');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
    try {
        await connectToDatabase();
        const { email, password, isAdmin: isAdminLogin } = req.body;
        logger.info('Login attempt:', { email, isAdminLogin });

        // Validate email format for students
        const emailRegex = /^(\d{2})(it|cb|cs|sc|bm)\d{3}@drngpit\.ac\.in$/i;
        if (!isAdminLogin && !emailRegex.test(email)) {
            // Check if the domain is correct but the format is wrong
            if (email.toLowerCase().endsWith('@drngpit.ac.in')) {
                const yearMatch = email.match(/^(\d{2})/);
                if (yearMatch) {
                    const year = parseInt(yearMatch[1], 10);
                    if (year < 23) {
                        return res.status(400).json({
                            success: false,
                            error: 'You are not a current student'
                        });
                    }
                }
            }
            return res.status(400).json({
                success: false,
                error: 'Invalid email format. Please use your college email (e.g., 23cb001@drngpit.ac.in)'
            });
        }


        const user = await User.findOne({ email }).select('+password').populate('studentProfile');
        logger.info('User found:', !!user);

        if (!user) {
            // Auto-create user if email format is valid
            if (!isAdminLogin && emailRegex.test(email)) {
                const expectedPassword = email.substring(0, 7).toLowerCase();
                
                if (password !== expectedPassword) {
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid password. Password should be first 7 characters of your email ID in lowercase'
                    });
                }

                // Extract room number from email (e.g., 23cb001 -> 001)
                const room = email.substring(2, 5).padStart(3, '0');
                
                const { hashPassword, generateToken } = require('../config/auth');
                const hashedPassword = await hashPassword(expectedPassword);

                const newUser = new User({
                    email,
                    password: hashedPassword,
                    name: email.split('@')[0].toUpperCase(),
                    room,
                    hostelType: 'boys',
                    hostelName: 'Marutham Hostel'
                });

                // Try to link existing student record
                const studentRecord = await Student.findOne({ email });
                if (studentRecord) {
                    newUser.studentProfile = studentRecord._id;
                }

                await newUser.save();

                if (studentRecord) {
                    newUser.studentProfile = studentRecord;
                }

                const token = generateToken(newUser._id, email, newUser.isAdmin);

                return res.json({
                    success: true,
                    data: {
                        token,
                        user: {
                            id: newUser._id,
                            email: newUser.email,
                            name: newUser.name,
                            room: newUser.room,
                            hostelType: newUser.hostelType,
                            hostelName: newUser.hostelName,
                            avatar: newUser.avatar,
                            theme: newUser.theme,
                            isAdmin: newUser.isAdmin,
                            studentProfile: newUser.studentProfile
                        }
                    }
                });
            }

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        if (isAdminLogin && !user.isAdmin) {
            logger.info('Admin login attempted by non-admin user');
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const { comparePassword, generateToken } = require('../config/auth');
        const isPasswordValid = await comparePassword(password, user.password);
        logger.info('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            // Check and link student record if it exists but isn't linked yet
            if (user && !user.studentProfile && !user.isAdmin) {
                const studentRecord = await Student.findOne({ email });
                if (studentRecord) {
                    user.studentProfile = studentRecord._id;
                    await user.save();
                    user.studentProfile = studentRecord;
                }
            }

            // For students, also check if password matches expected format
            if (!isAdminLogin && emailRegex.test(email)) {
                const expectedPassword = email.substring(0, 7).toLowerCase();
                if (password === expectedPassword) {
                    // Password matches expected format but not hashed password
                    // Update user's password with hashed version
                    const { hashPassword } = require('../config/auth');
                    user.password = await hashPassword(expectedPassword);
                    await user.save();
                    
                    const token = generateToken(user._id, user.email, user.isAdmin);

                    return res.json({
                        success: true,
                        data: {
                            token,
                            user: {
                                id: user._id,
                                email: user.email,
                                name: user.name,
                                room: user.room,
                                hostelType: user.hostelType,
                                hostelName: user.hostelName,
                                avatar: user.avatar,
                                theme: user.theme,
                                isAdmin: user.isAdmin,
                                studentProfile: user.studentProfile
                            }
                        }
                    });
                }
            }
            return res.status(401).json({
                success: false,
                error: 'Invalid password'
            });
        }

        // Check and link student record if it exists but isn't linked yet for regular successful login
        if (user && !user.studentProfile && !user.isAdmin) {
            const studentRecord = await Student.findOne({ email });
            if (studentRecord) {
                user.studentProfile = studentRecord._id;
                await user.save();
                user.studentProfile = studentRecord;
            }
        }

        const token = generateToken(user._id, user.email, user.isAdmin);

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    room: user.room,
                    hostelType: user.hostelType,
                    hostelName: user.hostelName,
                    avatar: user.avatar,
                    theme: user.theme,
                    isAdmin: user.isAdmin,
                    studentProfile: user.studentProfile
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Register
router.post('/register', validate('register'), async (req, res) => {
    try {
        await connectToDatabase();
        const { email, password, name, room, hostelType, hostelName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists'
            });
        }

        // Hash password
        const { hashPassword, generateToken } = require('../config/auth');
        const hashedPassword = await hashPassword(password);

        const user = new User({
            email,
            password: hashedPassword,
            name,
            room,
            hostelType,
            hostelName
        });

        // Try to link existing student record
        const studentRecord = await Student.findOne({ email });
        if (studentRecord) {
            user.studentProfile = studentRecord._id;
        }

        await user.save();
        if (studentRecord) {
            user.studentProfile = studentRecord;
        }

        const token = generateToken(user._id, user.email, user.isAdmin);

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    room: user.room,
                    hostelType: user.hostelType,
                    hostelName: user.hostelName,
                    isAdmin: user.isAdmin,
                    studentProfile: user.studentProfile
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Verify token
router.get('/verify', authenticate, async (req, res) => {
    try {
        await connectToDatabase();
        const user = await User.findById(req.user.userId).populate('studentProfile');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    room: user.room,
                    hostelType: user.hostelType,
                    hostelName: user.hostelName,
                    avatar: user.avatar,
                    theme: user.theme,
                    isAdmin: user.isAdmin,
                    studentProfile: user.studentProfile
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update own profile (name, room) — any authenticated user
router.put('/profile', authenticate, async (req, res) => {
    try {
        await connectToDatabase();
        const { name, room } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { name, room },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Forgot Password - Generate OTP
router.post('/forgot-password', async (req, res) => {
    try {
        await connectToDatabase();
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: 'Email not registered' });
        }
        
        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Store OTP in database (upsert: update if exists, otherwise create)
        await OTP.findOneAndUpdate(
            { email },
            { 
                otp, 
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) 
            },
            { upsert: true, new: true }
        );
        
        // In a real application, send via nodemailer here.
        // For demo purposes, we log it to console.
        logger.info(`\n================================\n[DEMO] OTP for ${email}: ${otp}\n================================\n`);
        
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Reset Password - Verify OTP & Update
router.post('/reset-password', async (req, res) => {
    try {
        await connectToDatabase();
        const { email, otp, newPassword } = req.body;
        
        const storedData = await OTP.findOne({ email });
        
        if (!storedData) {
            return res.status(400).json({ success: false, error: 'No OTP requested for this email' });
        }
        
        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid OTP' });
        }
        
        // OTP is valid, update password
        const { hashPassword } = require('../config/auth');
        const hashedPassword = await hashPassword(newPassword);
        
        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        
        // Clear OTP after successful reset
        await OTP.deleteOne({ email });
        
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
