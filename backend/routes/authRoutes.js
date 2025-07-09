const express = require("express")
const router = express.Router()
const { loginUser, verifyToken } = require("../controllers/authController")
const { registerUser } = require("../controllers/userVerificationController") // Use existing controller
const verifyTokenMiddleware = require("../middleware/verifyToken")

// Public routes
router.post("/register", registerUser) // Use existing registration logic
router.post("/login", loginUser)
router.post("/verify-token", verifyToken)

// Protected routes (for future use)
router.post("/approve-user", verifyTokenMiddleware, async (req, res) => {
  // This will be used by admin to approve users
  res.json({ message: "Approve user endpoint" })
})

module.exports = router
