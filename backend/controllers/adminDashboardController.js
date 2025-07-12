const { User } = require("../models/userVerificationModel")
const { AuthUser } = require("../models/authModel")
const Internship = require("../models/internshipManagementModel")
const { Application } = require("../models/applicationModel")
const TaskSubmission = require("../models/taskSubmissionModel")
const UserCourseEnrollment = require("../models/userCourseEnrollmentModel")
const moment = require("moment-timezone")

// Get overall dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    console.log("=== ADMIN: FETCHING DASHBOARD STATS ===")

    const totalRegisteredUsers = await User.countDocuments()
    const totalAuthUsers = await AuthUser.countDocuments() // Users who can log in
    const activeInternships = await Internship.countDocuments({ status: "Active" })
    const totalApplications = await Application.countDocuments()
    const pendingApplications = await Application.countDocuments({ status: "Pending" })
    const approvedApplications = await Application.countDocuments({ status: "Approved" })
    const totalTaskSubmissions = await TaskSubmission.countDocuments()
    const totalEnrollments = await UserCourseEnrollment.countDocuments()

    // For "Certificates Issued", assuming it's tied to completed courses.
    // This would ideally come from a dedicated 'Certificate' collection if you had one.
    // For now, we'll use a placeholder or infer from completed tasks/enrollments.
    // Let's assume a simple count of users who have completed all tasks in at least one course.
    // This is a complex aggregation, so for simplicity, we'll use a mock or a basic count.
    // For now, let's just count unique users with 'Completed' status in TaskSubmission.
    const usersWithCompletedTasks = await TaskSubmission.distinct("userId", { status: "Completed" })
    const certificatesIssued = usersWithCompletedTasks.length // Placeholder logic

    res.json({
      success: true,
      stats: {
        totalRegisteredUsers,
        totalAuthUsers,
        activeInternships,
        totalApplications,
        pendingApplications,
        approvedApplications,
        totalTaskSubmissions,
        totalEnrollments,
        certificatesIssued,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get latest registered users
exports.getLatestUsers = async (req, res) => {
  try {
    console.log("=== ADMIN: FETCHING LATEST USERS ===")
    const users = await User.find().sort({ createdAt: -1 }).limit(5).select("name mailid status")
    res.json({ success: true, data: users })
  } catch (error) {
    console.error("Error fetching latest users:", error)
    res.status(500).json({ success: false, error: error.message })
  }
}

// Get weekly activity (e.g., new registrations or task submissions)
exports.getWeeklyActivity = async (req, res) => {
  try {
    console.log("=== ADMIN: FETCHING WEEKLY ACTIVITY ===")
    const timezone = "Asia/Kolkata" // Or fetch from config/env

    const endDate = moment().tz(timezone).endOf("day")
    const startDate = moment().tz(timezone).subtract(6, "days").startOf("day") // Last 7 days including today

    const activityData = []
    for (let i = 0; i < 7; i++) {
      const day = moment(startDate).add(i, "days")
      const dayStart = day.startOf("day").toDate()
      const dayEnd = day.endOf("day").toDate()

      // Count new user registrations for the day
      const newUsersCount = await User.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd },
      })

      // Count task submissions for the day
      const taskSubmissionsCount = await TaskSubmission.countDocuments({
        submittedAt: { $gte: dayStart, $lte: dayEnd },
      })

      activityData.push({
        date: day.format("ddd"), // e.g., "Mon", "Tue"
        newUsers: newUsersCount,
        taskSubmissions: taskSubmissionsCount,
      })
    }

    res.json({ success: true, data: activityData })
  } catch (error) {
    console.error("Error fetching weekly activity:", error)
    res.status(500).json({ success: false, error: error.message })
  }
}