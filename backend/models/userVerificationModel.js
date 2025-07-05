// models/User.js
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema({
    course: { type: String, required: true },
    university: { type: String, required: true },
    percentage: { type: Number, required: true },
});

const addressSchema = new mongoose.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fathername: { type: String, required: true },
    mailid: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, "Invalid email format"]
    },
    password: { type: String, required: true },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Other"]
    },
    phone: { type: String, required: true },
    dob: { type: Date, required: true },
    education: [educationSchema],
    address: [addressSchema],
    verified: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected"], 
        default: "Pending" 
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = { User };