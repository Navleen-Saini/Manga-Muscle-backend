
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true, 
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
    },
    password: { type: String, required: true },
    planId: { type: String, enum: ["basic", "gold", "platinum"], required: true },
    currency: { 
        type: String,
        required: true,
        default: "CAD" },
    planPrice: {type: Number, required: true, min: 0},
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
