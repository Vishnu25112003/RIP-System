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
    console.log("New application created:", newApplication._id)

    res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication,
    })
  } catch (error) {
    console.error("Submit application error:", error)
    res.status(500).json({ error: error.message })
  }
}

// FIXED: Get user's application status - return consistent format
exports.getUserApplication = async (req, res) => {
  try {
    const { userId } = req.params
    console.log("=== GET USER APPLICATION ===")
    console.log("Requested userId:", userId)

    // Validate userId format
    if (!userId || userId.length !== 24) {
      console.log("Invalid userId format:", userId)
      return res.status(400).json({
        hasApplication: false,
        status: null,
        courseSelection: null,
        message: "Invalid user ID format",
      })
    }

    // Check if user exists first
    const user = await User.findById(userId)
    if (!user) {
      console.log("User not found for userId:", userId)
      return res.status(404).json({
        hasApplication: false,
        status: null,
        courseSelection: null,
        message: "User not found",
      })
    }

    console.log("User found:", user.name, user.mailid)

    // Find latest application for this user
    const application = await Application.findOne({ userId }).sort({ createdAt: -1 })

    if (!application) {
      console.log("No application found for userId:", userId)
      return res.status(200).json({
        hasApplication: false,
        status: null,
        courseSelection: null,
        message: "No application found",
      })
    }

    console.log("Found application:", {
      id: application._id,
      status: application.status,
      course: application.courseSelection,
    })

    // FIXED: Return consistent format with hasApplication flag
    res.status(200).json({
      hasApplication: true,
      status: application.status,
      courseSelection: application.courseSelection,
      learningPreference: application.learningPreference,
      technicalSkills: application.technicalSkills,
      appliedAt: application.createdAt,
      approvedAt: application.approvedAt,
      adminFeedback: application.adminFeedback,
      _id: application._id,
    })
  } catch (error) {
    console.error("Get user application error:", error)
    res.status(500).json({
      hasApplication: false,
      status: null,
      courseSelection: null,
      error: error.message,
    })
  }
}

// FIXED: Get user application status by email - return consistent format
exports.getUserApplicationByEmail = async (req, res) => {
  try {
    const { email } = req.params
    console.log("=== GET USER APPLICATION BY EMAIL ===")
    console.log("Requested email:", email)

    if (!email) {
      return res.status(400).json({
        hasApplication: false,
        status: null,
        courseSelection: null,
        message: "Email is required",
      })
    }

    // Find user by email
    const user = await User.findOne({ mailid: email })
    if (!user) {
      console.log("User not found for email:", email)
      return res.status(404).json({
        hasApplication: false,
        status: null,
        courseSelection: null,
        message: "User not found",
      })
    }

    console.log("Found user by email:", user._id, user.name)

    // Find latest application for this user
    const application = await Application.findOne({ userId: user._id }).sort({ createdAt: -1 })

    if (!application) {
      console.log("No application found for user:", user._id)
      return res.status(200).json({
        hasApplication: false,
        status: null,
        courseSelection: null,
        message: "No application found",
      })
    }

    console.log("Found application by email:", {
      id: application._id,
      status: application.status,
      course: application.courseSelection,
    })

    // FIXED: Return consistent format with hasApplication flag
    res.status(200).json({
      hasApplication: true,
      status: application.status,
      courseSelection: application.courseSelection,
      learningPreference: application.learningPreference,
      technicalSkills: application.technicalSkills,
      appliedAt: application.createdAt,
      approvedAt: application.approvedAt,
      adminFeedback: application.adminFeedback,
      _id: application._id,
    })
  } catch (error) {
    console.error("Get user application by email error:", error)
    res.status(500).json({
      hasApplication: false,
      status: null,
      courseSelection: null,
      error: error.message,
    })
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
    console.log("Updating application status:", { applicationId, status, adminFeedback })

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

    console.log("Application updated successfully:", {
      id: updatedApplication._id,
      status: updatedApplication.status,
      course: updatedApplication.courseSelection,
    })

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
