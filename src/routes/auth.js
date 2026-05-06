const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const { connectToDatabase } = require('../lib/db');

const router = express.Router();

// Simple in-memory OTP store for demo purposes
// In production, use Redis or a database collection with TTL
const otpStore = {};

// Login
router.post('/login', async (req, res) => {
    try {
        await connectToDatabase();
        const { email, password, isAdmin: isAdminLogin } = req.body;

        console.log('Login attempt:', { email, isAdminLogin });

        // Validate email format for students
        const emailRegex = /^23cb\d{3}@drngpit\.ac\.in$/i;
        if (!isAdminLogin && !emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format. Please use your college email (e.g., 23cb001@drngpit.ac.in)'
            });
        }

        const user = await User.findOne({ email }).select('+password');
        console.log('User found:', !!user);

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

                await newUser.save();

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
                            isAdmin: newUser.isAdmin
                        }
                    }
                });
            }

            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if admin login and user is not admin
        if (isAdminLogin && !user.isAdmin) {
            console.log('Admin login attempted by non-admin user');
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        const { comparePassword, generateToken } = require('../config/auth');
        const isPasswordValid = await comparePassword(password, user.password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
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
                                isAdmin: user.isAdmin
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
                    isAdmin: user.isAdmin
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

        await user.save();

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
                    isAdmin: user.isAdmin
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
router.get('/verify', authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user
        }
    });
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
        
        // Store OTP with 10-minute expiry
        otpStore[email] = {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000
        };
        
        // In a real application, send via nodemailer here.
        // For demo purposes, we log it to console.
        console.log(`\n================================`);
        console.log(`[DEMO] OTP for ${email}: ${otp}`);
        console.log(`================================\n`);
        
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
        
        const storedData = otpStore[email];
        
        if (!storedData) {
            return res.status(400).json({ success: false, error: 'No OTP requested for this email' });
        }
        
        if (Date.now() > storedData.expiresAt) {
            delete otpStore[email];
            return res.status(400).json({ success: false, error: 'OTP has expired' });
        }
        
        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, error: 'Invalid OTP' });
        }
        
        // OTP is valid, update password
        const { hashPassword } = require('../config/auth');
        const hashedPassword = await hashPassword(newPassword);
        
        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        
        // Clear OTP after successful reset
        delete otpStore[email];
        
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
