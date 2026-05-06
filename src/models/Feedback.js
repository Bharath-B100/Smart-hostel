const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    mealType: { type: String, required: true },
    foodRating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, required: true },
    response: { type: String, default: null },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// Database indexes for performance
feedbackSchema.index({ email: 1 });
feedbackSchema.index({ mealType: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
