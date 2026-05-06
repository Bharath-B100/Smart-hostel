const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    urgency: { type: String, required: true },
    status: { type: String, default: 'pending' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Database indexes for performance
reportSchema.index({ email: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });

module.exports = mongoose.model('Report', reportSchema);
