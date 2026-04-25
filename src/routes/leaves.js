const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const Leave = require('../models/Leave');

const router = express.Router();

// Get all leaves
router.get('/', authenticate, async (req, res) => {
    try {
        const leaves = await Leave.find().sort({ createdAt: -1 });
        res.json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create leave
router.post('/', authenticate, validate('leave'), async (req, res) => {
    try {
        const leave = new Leave(req.body);
        await leave.save();
        res.json({ success: true, data: leave });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update leave
router.put('/:id', authenticate, async (req, res) => {
    try {
        const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: leave });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete leave
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await Leave.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { deletedCount: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
