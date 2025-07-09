const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User details (copied from user profile for reference)
    userDetails: {
      name: { type: String, required: true },
      fathername: { type: String, required: true },
      mailid: { type: String, required: true },
      phone: { type: String, required: true },
      dob: { type: Date, required: true },
      gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
      education: [
        {
          course: { type: String, required: true },
          university: { type: String, required: true },
          percentage: { type: Number, required: true },
        },
      ],
      address: [
        {
          address: { type: String, required: true },
          city: { type: String, required: true },
          state: { type: String, required: true },
          pincode: { type: Number, required: true },
        },
      ],
    },

    // New application fields
    courseSelection: {
      type: String,
      required: true,
    },
    learningPreference: {
      type: String,
      enum: ["Self-learning", "Guided learning", "Hybrid"],
      required: true,
    },
    technicalSkills: [
      {
        type: String,
        required: true,
      },
    ],

    // Application status
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // Admin feedback
    adminFeedback: {
      type: String,
      default: "",
    },

    // Approval date
    approvedAt: {
      type: Date,
    },

    // Rejected date
    rejectedAt: {
      type: Date,
    },
  },
  { timestamps: true },
)

const Application = mongoose.model("Application", applicationSchema)

module.exports = { Application }
