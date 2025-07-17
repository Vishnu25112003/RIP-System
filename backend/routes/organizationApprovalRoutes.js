
const express = require("express")
const router = express.Router()

const {
  getOrganizationRequests,
  getAllOrganizationRequests,
  getOrganizationStudents,
  approveStudent,
  rejectStudent,
  bulkApproveStudents,
  getOrganizationDetails,
  updateOrganizationStatus,
  debugOrganizations,
} = require("../controllers/organizationApprovalController")

// ✅ Organization management routes
router.get("/requests", getOrganizationRequests) // Get pending requests
router.get("/all-requests", getAllOrganizationRequests) // Get all requests with status filter
router.get("/:orgId/students", getOrganizationStudents) // Get students in organization
router.get("/:orgId/details", getOrganizationDetails) // Get organization details

// ✅ UPDATED: Student approval routes with auto-credential generation
router.post("/student/:studentId/approve", approveStudent) // Auto-approve individual student
router.post("/student/:studentId/reject", rejectStudent) // Reject individual student
router.post("/:orgId/approve-all", bulkApproveStudents) // Bulk approve all students

// ✅ Organization status management
router.put("/:orgId/status", updateOrganizationStatus) // Update organization status

// ✅ Debug endpoint
router.get("/debug/collections", debugOrganizations) // Debug database contents

module.exports = router
