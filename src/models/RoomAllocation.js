const mongoose = require('mongoose');

const roomAllocationSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    hostelName: { type: String, required: true },
    allocationDate: { type: Date, required: true },
    status: { type: String, default: 'occupied' }
}, { timestamps: true });

// Database indexes for performance
roomAllocationSchema.index({ studentId: 1 });
roomAllocationSchema.index({ roomNumber: 1, hostelName: 1 });
roomAllocationSchema.index({ status: 1 });

module.exports = mongoose.model('RoomAllocation', roomAllocationSchema);
