const mongoose = require("mongoose")

const userCourseEnrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    registrationDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Paused", "Completed", "Dropped"],
      default: "Active",
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
  },
  { timestamps: true },
)

// Compound index to ensure one enrollment per user per course
userCourseEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true })

module.exports = mongoose.model("UserCourseEnrollment", userCourseEnrollmentSchema)
