const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    purpose: { type: String, required: true },
    studentVisiting: { type: String, required: true },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date, default: null },
    status: { type: String, default: 'visiting' },
    expectedDuration: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
