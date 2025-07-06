const express = require("express");
const router = express.Router();
const controller = require("../controllers/internshipManagementController");

router.post("/", controller.createInternship);
router.get("/", controller.getInternships);
router.get("/:id", controller.getInternshipById);
router.put("/:id", controller.updateInternship);
router.delete("/:id", controller.deleteInternship);

module.exports = router;
