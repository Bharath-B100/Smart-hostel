const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    roll: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    room: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String, default: '' }
}, { timestamps: true });

// Database indexes for performance (roll already indexed via unique:true)
studentSchema.index({ email: 1 });
studentSchema.index({ department: 1 });

module.exports = mongoose.model('Student', studentSchema);
