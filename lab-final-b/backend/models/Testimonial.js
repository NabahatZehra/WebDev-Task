const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    stars: {
        type: String,
        required: true,
        default: '⭐⭐⭐⭐⭐'
    },
    review: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'images.png'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Check if model exists before compiling to prevent OverwriteModelError
module.exports = mongoose.models.Testimonial || mongoose.model('Testimonial', testimonialSchema);