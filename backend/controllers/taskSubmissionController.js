const TaskSubmission = require("../models/taskSubmissionModel")
const TaskUnlock = require("../models/taskUnlockModel")
const Internship = require("../models/internshipManagementModel")
const { User } = require("../models/userVerificationModel")
const { Application } = require("../models/applicationModel")
const moment = require("moment-timezone")

// Get all tasks for a user (with submission status and unlock status)
exports.getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params
    console.log("=== GET USER TASKS ===")
    console.log("User ID:", userId)

    // Find user's approved application
    const application = await Application.findOne({
      userId: userId,
      status: "Approved",
    }).populate("userId")

    if (!application) {
      return res.status(404).json({
        error: "No approved application found for this user",
      })
    }

    console.log("Found approved application for course:", application.courseSelection)

    // Find the course by name
    const course = await Internship.findOne({
      coursename: application.courseSelection,
      status: "Active",
    })

    if (!course) {
      return res.status(404).json({
        error: "Course not found or inactive",
      })
    }

    console.log("Found course with", course.dailyTasks.length, "tasks")

    // Get user's submissions
    const submissions = await TaskSubmission.find({
      userId: userId,
      courseId: course._id,
    }).sort({ day: 1 })

    // Get user's unlocks
    const unlocks = await TaskUnlock.find({
      userId: userId,
      courseId: course._id,
    }).sort({ day: 1 })

    console.log("Found", submissions.length, "submissions and", unlocks.length, "unlocks")

    // Build task list with updated status logic
    const tasksWithStatus = course.dailyTasks.map((task, index) => {
      const dayNumber = task.day
      const submission = submissions.find((s) => s.day === dayNumber)
      const unlock = unlocks.find((u) => u.day === dayNumber)

      let status = "locked"
      let canAccess = false
      let unlockDate = null

      if (submission) {
        // Task is completed
        status = "completed"
        canAccess = false // Completed tasks can't be resubmitted
      } else {
        // Task is not completed - check if it should be available
        if (dayNumber === 1) {
          // Day 1 is ALWAYS available if not completed
          status = "current"
          canAccess = true
          unlockDate = "Available now"
        } else {
          // For other days, check if it's unlocked by cron job
          if (unlock) {
            status = "current"
            canAccess = true
            unlockDate = moment(unlock.unlockedAt).format("MMM DD, YYYY")
          } else {
            // Check if previous day is completed to show unlock info
            const previousDaySubmission = submissions.find((s) => s.day === dayNumber - 1)
            if (previousDaySubmission) {
              const submissionDate = moment(previousDaySubmission.submittedAt)
              const nextUnlockDate = submissionDate.add(1, "day").startOf("day")
              unlockDate = `Unlocks ${nextUnlockDate.format("MMM DD, YYYY")} at 12:00 AM`
              status = "locked"
              canAccess = false
            } else {
              status = "locked"
              canAccess = false
              unlockDate = "Complete previous tasks first"
            }
          }
        }
      }

      return {
        ...task.toObject(),
        status,
        canAccess,
        isSubmitted: !!submission,
        submissionId: submission?._id,
        unlockDate,
        unlockedBy: unlock?.unlockedBy || null,
      }
    })

    // Find the next available task (first non-completed task)
    const nextAvailableTask = tasksWithStatus.find((task) => task.status === "current")
    const currentDay = nextAvailableTask ? nextAvailableTask.day : tasksWithStatus.length + 1

    res.json({
      course: {
        _id: course._id,
        coursename: course.coursename,
        field: course.field,
        description: course.description,
      },
      tasks: tasksWithStatus,
      currentDay,
      totalSubmissions: submissions.length,
      totalUnlocks: unlocks.length,
    })
  } catch (error) {
    console.error("Error fetching user tasks:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get today's task (if accessible)
exports.getTodayTask = async (req, res) => {
  try {
    const { userId } = req.params
    console.log("=== GET TODAY'S TASK ===")
    console.log("User ID:", userId)

    // Find user's approved application
    const application = await Application.findOne({
      userId: userId,
      status: "Approved",
    })

    if (!application) {
      return res.status(404).json({
        error: "No approved application found",
      })
    }

    // Find the course
    const course = await Internship.findOne({
      coursename: application.courseSelection,
      status: "Active",
    })

    if (!course) {
      return res.status(404).json({
        error: "Course not found",
      })
    }

    // Get user's submissions and unlocks
    const submissions = await TaskSubmission.find({
      userId: userId,
      courseId: course._id,
    }).sort({ day: 1 })

    const unlocks = await TaskUnlock.find({
      userId: userId,
      courseId: course._id,
    }).sort({ day: 1 })

    // Find the next task that should be available
    let nextAvailableDay = null

    // Check Day 1 first (always available if not completed)
    const day1Submission = submissions.find((s) => s.day === 1)
    if (!day1Submission) {
      nextAvailableDay = 1
    } else {
      // Check other days based on unlocks
      for (let day = 2; day <= course.dailyTasks.length; day++) {
        const submission = submissions.find((s) => s.day === day)
        const unlock = unlocks.find((u) => u.day === day)

        if (!submission && unlock) {
          nextAvailableDay = day
          break
        }
      }
    }

    if (!nextAvailableDay) {
      return res.status(400).json({
        error: "No available tasks or all tasks completed",
      })
    }

    const todayTask = course.dailyTasks.find((task) => task.day === nextAvailableDay)

    if (!todayTask) {
      return res.status(404).json({
        error: "Task not found",
      })
    }

    res.json({
      task: todayTask,
      courseId: course._id,
      currentDay: nextAvailableDay,
      canSubmit: true,
    })
  } catch (error) {
    console.error("Error fetching today's task:", error)
    res.status(500).json({ error: error.message })
  }
}

// Submit task (with unlock scheduling)
exports.submitTask = async (req, res) => {
  try {
    const { userId, courseId, day, submissionDescription } = req.body

    console.log("=== SUBMIT TASK ===")
    console.log("Data:", { userId, courseId, day, submissionDescription })
    console.log("File:", req.file)

    if (!req.file) {
      return res.status(400).json({ error: "File upload is required" })
    }

    if (!submissionDescription || submissionDescription.trim().length === 0) {
      return res.status(400).json({ error: "Submission description is required" })
    }

    // Find the course and task
    const course = await Internship.findById(courseId)
    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    const task = course.dailyTasks.find((t) => t.day === Number.parseInt(day))
    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Check if already submitted
    const existingSubmission = await TaskSubmission.findOne({
      userId: userId,
      courseId: courseId,
      day: Number.parseInt(day),
    })

    if (existingSubmission) {
      return res.status(400).json({
        error: "Task already submitted for this day",
      })
    }

    // Validate task availability
    const submissions = await TaskSubmission.find({
      userId: userId,
      courseId: courseId,
    }).sort({ day: 1 })

    const unlocks = await TaskUnlock.find({
      userId: userId,
      courseId: courseId,
    }).sort({ day: 1 })

    const dayNum = Number.parseInt(day)

    // Check if this task is available for submission
    let canSubmit = false

    if (dayNum === 1) {
      // Day 1 is always available if not completed
      canSubmit = true
    } else {
      // Check if this day is unlocked
      const unlock = unlocks.find((u) => u.day === dayNum)
      canSubmit = !!unlock
    }

    if (!canSubmit) {
      return res.status(400).json({
        error: `Day ${dayNum} task is not yet available. Complete previous tasks and wait for unlock.`,
      })
    }

    // Calculate next task unlock date (next day at midnight)
    const nextTaskUnlockDate = moment().add(1, "day").startOf("day").toDate()

    // Create submission
    const submission = new TaskSubmission({
      userId: userId,
      courseId: courseId,
      day: dayNum,
      taskTitle: task.title,
      taskDescription: task.description,
      submissionDescription: submissionDescription.trim(),
      fileUrl: req.file.filename,
      status: "Completed",
      nextTaskUnlockDate: nextTaskUnlockDate,
    })

    await submission.save()

    console.log("Task submitted successfully:", submission._id)
    console.log("Next task will unlock at:", nextTaskUnlockDate)

    res.status(201).json({
      message: "Task submitted successfully!",
      submission: submission,
      nextUnlockDate: nextTaskUnlockDate,
    })
  } catch (error) {
    console.error("Error submitting task:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get user's submission history
exports.getSubmissionHistory = async (req, res) => {
  try {
    const { userId } = req.params

    const submissions = await TaskSubmission.find({ userId }).populate("courseId", "coursename field").sort({ day: 1 })

    const unlocks = await TaskUnlock.find({ userId }).sort({ day: 1 })

    res.json({
      submissions,
      unlocks,
    })
  } catch (error) {
    console.error("Error fetching submission history:", error)
    res.status(500).json({ error: error.message })
  }
}

// Admin function to manually unlock a task
exports.manualUnlockTask = async (req, res) => {
  try {
    const { userId, courseId, day } = req.body

    const cronService = require("../services/cronService")
    const result = await cronService.manualUnlockTask(userId, courseId, day)

    if (result.success) {
      res.json({ message: result.message })
    } else {
      res.status(400).json({ error: result.message })
    }
  } catch (error) {
    console.error("Error in manual unlock:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get cron job status
exports.getCronStatus = async (req, res) => {
  try {
    const cronService = require("../services/cronService")
    const status = cronService.getStatus()
    res.json(status)
  } catch (error) {
    console.error("Error getting cron status:", error)
    res.status(500).json({ error: error.message })
  }
}
