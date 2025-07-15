const express = require("express")
const router = express.Router()
const verifyToken = require("../middleware/verifyToken")

const {
  registerOrganization,
  getPendingOrganizations,
  getAllOrganizations,
  approveOrganization,
  rejectOrganization,
  getOrganizationDetails,
} = require("../controllers/organizationSininController")
// Public routes
router.post("/register", registerOrganization)

// Protected admin routes
router.get("/pending", verifyToken, getPendingOrganizations)
router.get("/all", verifyToken, getAllOrganizations)
router.post("/approve/:id", verifyToken, approveOrganization)
router.post("/reject/:id", verifyToken, rejectOrganization)
router.get("/:id", verifyToken, getOrganizationDetails)

module.exports = router
