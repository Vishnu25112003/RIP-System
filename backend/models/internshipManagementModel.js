const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const internshipSchema = new mongoose.Schema({
    coursename: { type: String, required: true },
    field: { type: String, required: true },
    discription: { type: String, required: true },
    duration: { type: String, required: true }, 
    status: { type: String, required: true, enum: ["Active", "Inactive"] },

    dailyTasks: [taskSchema], 
}, { timestamps: true });

module.exports = mongoose.model("Internship", internshipSchema);
