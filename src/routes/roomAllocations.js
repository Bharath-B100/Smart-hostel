const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const RoomAllocation = require('../models/RoomAllocation');

const router = express.Router();

// Get all room allocations
router.get('/', authenticate, async (req, res) => {
    try {
        const allocations = await RoomAllocation.find().sort({ createdAt: -1 });
        res.json({ success: true, data: allocations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create room allocation
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const allocation = new RoomAllocation(req.body);
        await allocation.save();
        res.json({ success: true, data: allocation });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Update room allocation
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const allocation = await RoomAllocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: allocation });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete room allocation
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await RoomAllocation.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { deletedCount: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
