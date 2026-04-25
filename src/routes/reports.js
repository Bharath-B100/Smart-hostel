const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const Report = require('../models/Report');

const router = express.Router();

// Get all reports
router.get('/', authenticate, async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create report
router.post('/', authenticate, validate('report'), async (req, res) => {
    try {
        const report = new Report(req.body);
        await report.save();
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update report
router.put('/:id', authenticate, async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete report
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await Report.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { deletedCount: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
