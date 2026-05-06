const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Database indexes for performance
leaveSchema.index({ email: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ email: 1, status: 1 });

module.exports = mongoose.model('Leave', leaveSchema);
