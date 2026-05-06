const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    method: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, default: 'paid' }
}, { timestamps: true });

// Database indexes for performance
paymentSchema.index({ studentId: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
