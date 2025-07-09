const express = require("express")
const router = express.Router()

const {
  registerUser,
  getPendingUsers,
  getAllUsers,
  updateUserStatus,
  getUserDetails,
  updateUserDetails,
  deleteUser,
} = require("../controllers/userVerificationController")

router.post("/register", registerUser)
router.get("/pending-users", getPendingUsers)
router.get("/all-users", getAllUsers)
router.put("/update-status", updateUserStatus)
router.get("/user/:userId", getUserDetails)
router.put("/user/:userId", updateUserDetails)
router.delete("/user/:userId", deleteUser)

module.exports = router
