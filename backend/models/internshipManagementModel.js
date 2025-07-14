const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  test: { type: String },
  exercise: { type: String },
})

const internshipSchema = new mongoose.Schema(
  {
    coursename: { type: String, required: true },
    field: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: String, required: true },
    status: { type: String, required: true, enum: ["Active", "Inactive"] },
    dailyTasks: [taskSchema],
    image: { type: String },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Internship", internshipSchema)
