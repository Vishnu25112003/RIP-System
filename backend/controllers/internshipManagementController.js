const Internship = require("../models/internshipManagementModel");

exports.createInternship = async (req, res) => {
  try {
    const { coursename, field, description, duration, status } = req.body;
    const tasks = req.body.tasks ? JSON.parse(req.body.tasks) : [];

    const internship = new Internship({
      coursename,
      field,
      description,
      duration,
      status,
      image: req.file ? req.file.filename : null,
      dailyTasks: tasks,
    });

    await internship.save();
    res.status(201).json(internship);
  } catch (error) {
    console.error("❌ BACKEND ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 });
    res.json(internships);
  } catch (error) {
    res.status(500).json({ error: "Error fetching internships" });
  }
};

exports.updateInternship = async (req, res) => {
  try {
    const { id } = req.params;
    const { coursename, field, description, duration, status } = req.body;
    const tasks = req.body.tasks ? JSON.parse(req.body.tasks) : [];

    const updateData = {
      coursename,
      field,
      description,
      duration,
      status,
      dailyTasks: tasks,
    };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updated = await Internship.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    console.error("Update Error:", error.message);
    res.status(500).json({ error: "Error updating internship" });
  }
};
