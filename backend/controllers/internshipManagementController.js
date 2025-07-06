const Internship = require("../models/internshipManagementModel");

// Create internship
exports.createInternship = async (req, res) => {
  try {
    const internship = new Internship(req.body);
    await internship.save();
    res.status(201).json({ message: "Internship created", internship });
  } catch (err) {
    res.status(500).json({ message: "Error creating internship", error: err });
  }
};

// Get all internships
exports.getInternships = async (req, res) => {
  try {
    const internships = await Internship.find();
    res.status(200).json(internships);
  } catch (err) {
    res.status(500).json({ message: "Error fetching internships" });
  }
};

// Get single internship
exports.getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Not found" });
    res.status(200).json(internship);
  } catch (err) {
    res.status(500).json({ message: "Error fetching internship" });
  }
};

// Update internship
exports.updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Updated", internship });
  } catch (err) {
    res.status(500).json({ message: "Error updating" });
  }
};

// Delete internship
exports.deleteInternship = async (req, res) => {
  try {
    await Internship.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting" });
  }
};
