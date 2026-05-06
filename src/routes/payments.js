const express = require('express');
const { validate } = require('../middleware/validation');
const { authenticate, requireAdmin } = require('../middleware/auth');
const Payment = require('../models/Payment');
const { connectToDatabase } = require('../lib/db');

const router = express.Router();

// Get all payments
router.get('/', authenticate, async (req, res) => {
    try {
        await connectToDatabase();
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create payment
router.post('/', authenticate, requireAdmin, validate('payment'), async (req, res) => {
    try {
        await connectToDatabase();
        const payment = new Payment(req.body);
        await payment.save();
        res.json({ success: true, data: payment });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Delete payment
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        await connectToDatabase();
        await Payment.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: { deletedCount: 1 } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
