const TaskSubmission = require("../models/taskSubmissionModel")
const UserCourseEnrollment = require("../models/userCourseEnrollmentModel")
const { User } = require("../models/userVerificationModel")
const Internship = require("../models/internshipManagementModel")

// Get all task submissions with user details for admin dashboard
exports.getTaskSubmissions = async (req, res) => {
  try {
    console.log("=== ADMIN: FETCHING ALL TASK SUBMISSIONS ===")

    // First, let's check what collections exist and their actual names
    const submissions = await TaskSubmission.find({})
      .populate({
        path: "userId",
        select: "name mailid phone",
        model: "User",
      })
      .populate({
        path: "courseId",
        select: "coursename field",
        model: "Internship",
      })
      .sort({ submittedAt: -1 })
      .lean()

    console.log(`Found ${submissions.length} task submissions`)

    // Format the response to match your UI needs
    const formattedSubmissions = submissions.map((submission) => ({
      _id: submission._id,
      userId: submission.userId?._id || submission.userId,
      userName: submission.userId?.name || "Unknown User",
      userEmail: submission.userId?.mailid || "No Email",
      userPhone: submission.userId?.phone || "No Phone",
      taskId: submission._id,
      taskName: submission.taskTitle || "Unknown Task",
      courseName: submission.courseId?.coursename || "Unknown Course",
      courseField: submission.courseId?.field || "Unknown Field",
      submittedAt: submission.submittedAt,
      dayCompleted: submission.day,
      status: submission.status,
      additionalDetails: {
        submissionDescription: submission.submissionDescription,
        fileUrl: submission.fileUrl,
        status: submission.status,
        taskDescription: submission.taskDescription,
      },
    }))

    res.json({
      success: true,
      count: formattedSubmissions.length,
      data: formattedSubmissions,
    })
  } catch (error) {
    console.error("Error fetching admin task submissions:", error)
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
}

// Get task submission statistics for admin dashboard
exports.getTaskStatistics = async (req, res) => {
  try {
    console.log("=== ADMIN: FETCHING TASK STATISTICS ===")

    // Get basic counts
    const totalSubmissions = await TaskSubmission.countDocuments()
    const completedTasks = await TaskSubmission.countDocuments({ status: "Completed" })
    const pendingTasks = await TaskSubmission.countDocuments({ status: "Pending" })

    // Get unique users and courses
    const uniqueUserIds = await TaskSubmission.distinct("userId")
    const uniqueCourseIds = await TaskSubmission.distinct("courseId")

    // Get submissions by course
    const submissionsByCourse = await TaskSubmission.aggregate([
      {
        $lookup: {
          from: "internships",
          localField: "courseId",
          foreignField: "_id",
          as: "courseDetails",
        },
      },
      {
        $unwind: {
          path: "$courseDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$courseId",
          courseName: { $first: "$courseDetails.coursename" },
          courseField: { $first: "$courseDetails.field" },
          submissionCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
        },
      },
      {
        $sort: { submissionCount: -1 },
      },
    ])

    const statistics = {
      totalSubmissions,
      completedTasks,
      pendingTasks,
      uniqueUsers: uniqueUserIds.length,
      uniqueCourses: uniqueCourseIds.length,
    }

    res.json({
      success: true,
      statistics,
      submissionsByCourse,
    })
  } catch (error) {
    console.error("Error fetching task statistics:", error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

// Get submissions for a specific user
exports.getUserSubmissions = async (req, res) => {
  try {
    const { userId } = req.params
    console.log(`=== ADMIN: FETCHING SUBMISSIONS FOR USER ${userId} ===`)

    const submissions = await TaskSubmission.find({ userId })
      .populate("userId", "name mailid phone")
      .populate("courseId", "coursename field")
      .sort({ submittedAt: -1 })

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    })
  } catch (error) {
    console.error("Error fetching user submissions:", error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

// Get submissions for a specific course
exports.getCourseSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params
    console.log(`=== ADMIN: FETCHING SUBMISSIONS FOR COURSE ${courseId} ===`)

    const submissions = await TaskSubmission.find({ courseId })
      .populate("userId", "name mailid phone")
      .populate("courseId", "coursename field")
      .sort({ submittedAt: -1 })

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    })
  } catch (error) {
    console.error("Error fetching course submissions:", error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
