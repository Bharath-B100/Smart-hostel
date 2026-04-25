const mongoose = require('mongoose');

const roomAllocationSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    hostelName: { type: String, required: true },
    allocationDate: { type: Date, required: true },
    status: { type: String, default: 'occupied' }
}, { timestamps: true });

module.exports = mongoose.model('RoomAllocation', roomAllocationSchema);
