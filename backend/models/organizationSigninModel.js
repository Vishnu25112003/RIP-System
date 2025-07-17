const mongoose = require("mongoose")

const studentSchema = new mongoose.Schema({
  name: { type: String }, // Added name field
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
  // ✅ UPDATED: Enhanced approval fields
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  passwordHash: { type: String },
  generatedPassword: { type: String }, // Store generated password for reference
  courseUnlocked: { type: Boolean, default: false }, // ✅ Course unlock status
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  approvedBy: { type: String },
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

// Indexes for better performance
organizationSchema.index({ status: 1, createdAt: -1 })
organizationSchema.index({ organizerEmail: 1 })
organizationSchema.index({ "students.email": 1 })
organizationSchema.index({ "students.status": 1 })

const Organization = mongoose.model("Organization", organizationSchema)

module.exports = { Organization }
