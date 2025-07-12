const express = require("express")
const router = express.Router()
const { getDashboardStats, getLatestUsers, getWeeklyActivity } = require("../controllers/adminDashboardController")

// Test route for the dashboard router itself
router.get("/", (req, res) => {
  res.json({ message: "Admin Dashboard base route is working!" })
})

// Dashboard statistics
router.get("/stats", getDashboardStats)

// Latest registered users
router.get("/latest-users", getLatestUsers)

// Weekly activity data for graphs
router.get("/weekly-activity", getWeeklyActivity)

module.exports = router
