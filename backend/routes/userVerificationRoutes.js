const express = require("express");
const router = express.Router();

const {
  registerUser,
  getPendingUsers,
  updateUserStatus,
  getUserDetails
} = require("../controllers/userVerificationController");

router.post("/register", registerUser);
router.get("/pending-users", getPendingUsers);
router.put("/update-status", updateUserStatus);
router.get("/user/:userId", getUserDetails);

module.exports = router;