const express = require("express")
const router = express.Router()

const {
  getTaskSubmissions,
  getTaskStatistics,
  getUserSubmissions,
  getCourseSubmissions,
} = require("../controllers/userActivityController")

// Get all task submissions with user details
router.get("/task-submissions", getTaskSubmissions)

// Get task statistics
router.get("/task-statistics", getTaskStatistics)

// Get submissions for a specific user
router.get("/user-submissions/:userId", getUserSubmissions)

// Get submissions for a specific course
router.get("/course-submissions/:courseId", getCourseSubmissions)

module.exports = router
