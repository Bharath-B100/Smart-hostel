const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate, requireAdmin } = require('../middleware/auth');
const Visitor = require('../models/Visitor');

const router = express.Router();

// Get all visitors
router.get('/', authenticate, async (req, res) => {
    try {
        const visitors = await Visitor.find().sort({ createdAt: -1 });
        res.json({ success: true, data: visitors });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create visitor
router.post('/', authenticate, validate('visitor'), async (req, res) => {
    try {
        const visitor = new Visitor(req.body);
        await visitor.save();
        res.json({ success: true, data: visitor });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update visitor
router.put('/:id', authenticate, async (req, res) => {
    try {
        const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: visitor });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete visitor
router.delete('/:id', authenticate, async (req, res) => {
    try {
        await Visitor.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { deletedCount: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
