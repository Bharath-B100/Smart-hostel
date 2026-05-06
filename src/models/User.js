const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    room: { type: String, required: true },
    hostelType: { type: String, required: true, enum: ['boys'], default: 'boys' },
    hostelName: { type: String, required: true },
    avatar: { type: String, default: '' },
    theme: { type: String, default: 'light', enum: ['light', 'dark'] },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
