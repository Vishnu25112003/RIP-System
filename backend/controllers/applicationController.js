const { Application } = require("../models/applicationModel")
const { User } = require("../models/userVerificationModel")

// Submit application
exports.submitApplication = async (req, res) => {
  try {
    const { userId, courseSelection, learningPreference, technicalSkills } = req.body

    // Check if user already has a pending or approved application
    const existingApplication = await Application.findOne({
      userId,
      status: { $in: ["Pending", "Approved"] },
    })

    if (existingApplication) {
      return res.status(400).json({
        message: "You already have a pending or approved application",
      })
    }

    // Get user details
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Create new application
    const newApplication = new Application({
      userId,
      userDetails: {
        name: user.name,
        fathername: user.fathername,
        mailid: user.mailid,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        education: user.education,
        address: user.address,
      },
      courseSelection,
      learningPreference,
      technicalSkills,
    })

    await newApplication.save()

    res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication,
    })
  } catch (error) {
    console.error("Submit application error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get user's application status
exports.getUserApplication = async (req, res) => {
  try {
    const { userId } = req.params

    const application = await Application.findOne({ userId }).sort({ createdAt: -1 })

    if (!application) {
      return res.status(404).json({ message: "No application found" })
    }

    res.status(200).json(application)
  } catch (error) {
    console.error("Get user application error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get all applications (for admin)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 }).populate("userId", "name mailid")

    res.status(200).json(applications)
  } catch (error) {
    console.error("Get all applications error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get pending applications (for admin)
exports.getPendingApplications = async (req, res) => {
  try {
    const applications = await Application.find({ status: "Pending" })
      .sort({ createdAt: -1 })
      .populate("userId", "name mailid")

    res.status(200).json(applications)
  } catch (error) {
    console.error("Get pending applications error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Update application status (for admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status, adminFeedback } = req.body

    const updateData = {
      status,
      adminFeedback: adminFeedback || "",
    }

    if (status === "Approved") {
      updateData.approvedAt = new Date()
    } else if (status === "Rejected") {
      updateData.rejectedAt = new Date()
    }

    const updatedApplication = await Application.findByIdAndUpdate(applicationId, updateData, { new: true })

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found" })
    }

    // Update user's hasApprovedApplication status
    if (status === "Approved") {
      await User.findByIdAndUpdate(updatedApplication.userId, {
        hasApprovedApplication: true,
      })
    }

    res.status(200).json({
      message: "Application status updated successfully",
      application: updatedApplication,
    })
  } catch (error) {
    console.error("Update application status error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get application details (for admin)
exports.getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params

    const application = await Application.findById(applicationId).populate("userId", "name mailid")

    if (!application) {
      return res.status(404).json({ message: "Application not found" })
    }

    res.status(200).json(application)
  } catch (error) {
    console.error("Get application details error:", error)
    res.status(500).json({ error: error.message })
  }
}
