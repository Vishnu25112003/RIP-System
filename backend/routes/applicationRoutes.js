const express = require("express")
const router = express.Router()

// Import all controller functions from applicationController
const {
  submitApplication,
  getUserApplication,
  getUserApplicationByEmail,
  getAllApplications,
  getPendingApplications,
  updateApplicationStatus,
  getApplicationDetails,
} = require("../controllers/applicationController")

// User routes - FIXED: Correct route paths
router.post("/submit", submitApplication)
router.get("/user/:userId", getUserApplication) // This should work
router.get("/email/:email", getUserApplicationByEmail) // Backup method

// Admin routes
router.get("/all", getAllApplications)
router.get("/pending", getPendingApplications)
router.put("/update-status", updateApplicationStatus)
router.get("/:applicationId", getApplicationDetails)

module.exports = router
