const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const Feedback = require('../models/Feedback');

const router = express.Router();

// Get all feedback
router.get('/', authenticate, async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ createdAt: -1 });
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create feedback
router.post('/', authenticate, validate('feedback'), async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update feedback
router.put('/:id', authenticate, async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: feedback });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete feedback
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { deletedCount: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
