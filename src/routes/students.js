const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate, requireAdmin } = require('../middleware/auth');
const Student = require('../models/Student');

const router = express.Router();

// Get all students
router.get('/', authenticate, async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create student
router.post('/', authenticate, requireAdmin, validate('student'), async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update student
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete student
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { deletedCount: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
