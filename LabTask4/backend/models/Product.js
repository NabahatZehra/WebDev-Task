
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Recording', 'Mixing', 'Mastering', 'Production', 'Equipment', 'Services']
    },
    image: {
        type: String,
        default: 'default-product.jpg'
    },
    featured: {
        type: Boolean,
        default: false
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    inStock: {
        type: Boolean,
        default: true
    },
    specifications: {
        type: Map,
        of: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Check if model exists before compiling to prevent OverwriteModelError
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);