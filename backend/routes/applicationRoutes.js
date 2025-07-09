const express = require("express")
const router = express.Router()

const {
  submitApplication,
  getUserApplication,
  getAllApplications,
  getPendingApplications,
  updateApplicationStatus,
  getApplicationDetails,
} = require("../controllers/applicationController")

// User routes
router.post("/submit", submitApplication)
router.get("/user/:userId", getUserApplication)

// Admin routes
router.get("/all", getAllApplications)
router.get("/pending", getPendingApplications)
router.put("/update-status", updateApplicationStatus)
router.get("/:applicationId", getApplicationDetails)

module.exports = router
