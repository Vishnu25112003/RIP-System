const mongoose = require("mongoose")

const taskSubmissionSchema = new mongoose.Schema(
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
    day: {
      type: Number,
      required: true,
    },
    taskTitle: {
      type: String,
      required: true,
    },
    taskDescription: {
      type: String,
      required: true,
    },
    submissionDescription: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Completed", "Pending"],
      default: "Completed",
    },
    // New field to track when next task should unlock
    nextTaskUnlockDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

// Compound index to ensure one submission per user per day per course
taskSubmissionSchema.index({ userId: 1, courseId: 1, day: 1 }, { unique: true })

module.exports = mongoose.model("TaskSubmission", taskSubmissionSchema)
