const mongoose = require("mongoose")

const taskUnlockSchema = new mongoose.Schema(
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
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    unlockedBy: {
      type: String,
      enum: ["completion", "cron", "manual"],
      default: "completion",
    },
  },
  { timestamps: true },
)

// Compound index to ensure one unlock record per user per day per course
taskUnlockSchema.index({ userId: 1, courseId: 1, day: 1 }, { unique: true })

module.exports = mongoose.model("TaskUnlock", taskUnlockSchema)
