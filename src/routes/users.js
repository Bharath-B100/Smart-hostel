const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const { connectToDatabase } = require('../lib/db');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
    try {
        await connectToDatabase();
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        await connectToDatabase();
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
    try {
        await connectToDatabase();
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
