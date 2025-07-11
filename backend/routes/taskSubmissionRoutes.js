const express = require("express")
const router = express.Router()
const upload = require("../middleware/uploadMiddleware")

const {
  getUserTasks,
  getTodayTask,
  submitTask,
  getSubmissionHistory,
  manualUnlockTask,
  getCronStatus,
} = require("../controllers/taskSubmissionController")

// Get all tasks for a user
router.get("/user/:userId", getUserTasks)

// Get today's task for a user
router.get("/today/:userId", getTodayTask)

// Submit a task (with file upload)
router.post("/submit", upload.single("exerciseFile"), submitTask)

// Get user's submission history
router.get("/history/:userId", getSubmissionHistory)

// Admin routes
router.post("/admin/unlock", manualUnlockTask)
router.get("/admin/cron-status", getCronStatus)

module.exports = router
