const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const {
  createInternship,
  getAllInternships,
  updateInternship,
} = require("../controllers/internshipManagementController");

router.post("/", upload.single("image"), createInternship);
router.get("/", getAllInternships);
router.put("/:id", upload.single("image"), updateInternship);

module.exports = router;
