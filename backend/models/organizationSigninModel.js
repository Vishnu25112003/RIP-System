const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
  registerNo: { type: String, required: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Invalid email format"],
  },
  phone: { type: String, required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: function () {
      return this.parent().preferredMode === "student"
    },
  },
})

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    organizerName: { type: String, required: true },
    organizerEmail: {
      type: String,
      required: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    organizerPhone: { type: String, required: true },
    preferredMode: {
      type: String,
      enum: ["organizer", "student"],
      required: true,
    },
    assignedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: function () {
        return this.preferredMode === "organizer"
      },
    },
    students: [studentSchema],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    adminFeedback: { type: String, default: "" },
    approvedAt: { type: Date },
    approvedBy: { type: String },
  },
  { timestamps: true },
)

// Index for faster queries
organizationSchema.index({ status: 1, createdAt: -1 })
organizationSchema.index({ organizerEmail: 1 })

const Organization = mongoose.model("Organization", organizationSchema)

module.exports = { Organization }
