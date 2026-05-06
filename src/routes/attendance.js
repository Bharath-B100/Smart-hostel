const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const { connectToDatabase } = require('../lib/db');

const router = express.Router();

// Get all attendance records
router.get('/', authenticate, async (req, res) => {
    try {
        await connectToDatabase();
        const attendance = await Attendance.find().sort({ createdAt: -1 });
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create attendance record
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        await connectToDatabase();
        const attendance = new Attendance(req.body);
        await attendance.save();
        res.json({ success: true, data: attendance });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete attendance record
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await connectToDatabase();
        await Attendance.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { deletedCount: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
