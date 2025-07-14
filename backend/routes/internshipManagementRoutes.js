const express = require("express")
const router = express.Router()
const upload = require("../middleware/uploadMiddleware") // Your provided upload middleware

const {
  createInternship,
  getAllInternships,
  updateInternship,
  uploadTasks, // Import the new controller function
} = require("../controllers/internshipManagementController")

router.post("/", upload.single("image"), createInternship)
router.get("/", getAllInternships)
router.put("/:id", upload.single("image"), updateInternship) // Use upload.single('image') for general internship updates
router.post("/:id/upload-tasks", upload.single("taskDocument"), uploadTasks) // New route for task document upload

module.exports = router
