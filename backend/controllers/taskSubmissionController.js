const TaskSubmission = require("../models/taskSubmissionModel")
const TaskUnlock = require("../models/taskUnlockModel")
const Internship = require("../models/internshipManagementModel")
const { User } = require("../models/userVerificationModel")
const { Application } = require("../models/applicationModel")
const UserCourseEnrollment = require("../models/userCourseEnrollmentModel")
const moment = require("moment-timezone")
const taskUnlockService = require("../services/taskUnlockServices") // Declared taskUnlockService

// Helper function to get or create user enrollment
const getUserEnrollment = async (userId, courseId) => {
  let enrollment = await UserCourseEnrollment.findOne({
    userId: userId,
    courseId: courseId,
  })

  if (!enrollment) {
    const application = await Application.findOne({
      userId: userId,
      status: "Approved",
    })

    if (!application) {
      throw new Error("No approved application found")
    }

    const course = await Internship.findOne({
      coursename: application.courseSelection,
      status: "Active",
    })

    if (!course) {
      throw new Error("Course not found")
    }

    enrollment = new UserCourseEnrollment({
      userId: userId,
      courseId: course._id,
      applicationId: application._id,
      registrationDate: application.approvedAt || application.createdAt,
      startDate: application.approvedAt || application.createdAt,
    })

    await enrollment.save()
  }

  return enrollment
}

// Helper function to calculate current day
const calculateCurrentDay = (registrationDate, timezone = "Asia/Kolkata") => {
  const now = moment().tz(timezone)
  const startDate = moment(registrationDate).tz(timezone).startOf("day")
  return now.diff(startDate, "days") + 1
}

// Get all tasks for a user with proper day calculation
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

    // Get or create enrollment
    const enrollment = await getUserEnrollment(userId, course._id)
    const currentDay = calculateCurrentDay(enrollment.registrationDate)

    // Get user's submissions and unlocks
    const submissions = await TaskSubmission.find({
      userId: userId,
      courseId: course._id,
    }).sort({ day: 1 })

    const unlocks = await TaskUnlock.find({
      userId: userId,
      courseId: course._id,
    }).sort({ day: 1 })

    console.log(`User registered on: ${moment(enrollment.registrationDate).format("YYYY-MM-DD")}`)
    console.log(`Current day: ${currentDay}`)
    console.log(`Found ${submissions.length} submissions and ${unlocks.length} unlocks`)

    // Build task list with updated status logic
    const tasksWithStatus = course.dailyTasks.map((task, index) => {
      const dayNumber = task.day
      const submission = submissions.find((s) => s.day === dayNumber)
      const unlock = unlocks.find((u) => u.day === dayNumber)

      let status = "locked"
      let canAccess = false
      let unlockDate = null
      const unlockReason = null

      if (submission) {
        // Task is completed
        status = "completed"
        canAccess = false
        unlockDate = `Completed on ${moment(submission.submittedAt).format("MMM DD, YYYY")}`
      } else {
        // Task is not completed - check availability
        if (dayNumber === 1) {
          // Day 1 is always available
          status = "current"
          canAccess = true
          unlockDate = "Available now"
        } else if (dayNumber <= currentDay) {
          // Within current day range, check unlock conditions
          if (unlock) {
            status = "current"
            canAccess = true
            unlockDate = `Unlocked on ${moment(unlock.unlockedAt).format("MMM DD, YYYY")}`
          } else {
            // Check if should be unlocked
            const previousDaySubmission = submissions.find((s) => s.day === dayNumber - 1)
            if (previousDaySubmission) {
              const submissionDate = moment(previousDaySubmission.submittedAt)
              const nextUnlockDate = submissionDate.clone().add(1, "day").startOf("day")
              const now = moment()

              if (now.isAfter(nextUnlockDate)) {
                // Should be unlocked, create unlock record
                taskUnlockService
                  .createUnlockRecord(userId, course._id, dayNumber, "auto")
                  .then(() => console.log(`Auto-unlocked Day ${dayNumber} for user ${userId}`))
                  .catch((err) => console.error(`Failed to auto-unlock Day ${dayNumber}:`, err))

                status = "current"
                canAccess = true
                unlockDate = "Available now"
              } else {
                status = "locked"
                canAccess = false
                unlockDate = `Unlocks ${nextUnlockDate.format("MMM DD, YYYY")} at 12:00 AM`
              }
            } else {
              status = "locked"
              canAccess = false
              unlockDate = `Complete Day ${dayNumber - 1} first`
            }
          }
        } else {
          // Future day beyond current day
          status = "locked"
          canAccess = false
          const targetDate = moment(enrollment.registrationDate).add(dayNumber - 1, "days")
          unlockDate = `Available from ${targetDate.format("MMM DD, YYYY")}`
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

    // Find the next available task
    const nextAvailableTask = tasksWithStatus.find((task) => task.status === "current")
    const displayCurrentDay = nextAvailableTask ? nextAvailableTask.day : Math.min(currentDay, course.dailyTasks.length)

    res.json({
      course: {
        _id: course._id,
        coursename: course.coursename,
        field: course.field,
        description: course.description,
      },
      tasks: tasksWithStatus,
      currentDay: displayCurrentDay,
      actualCurrentDay: currentDay, // Based on registration date
      registrationDate: enrollment.registrationDate,
      totalSubmissions: submissions.length,
      totalUnlocks: unlocks.length,
    })
  } catch (error) {
    console.error("Error fetching user tasks:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get today's available task
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

    // Get or create enrollment
    const enrollment = await getUserEnrollment(userId, course._id)
    const currentDay = calculateCurrentDay(enrollment.registrationDate)

    // Find the next task that should be available
    let nextAvailableDay = null

    // Check Day 1 first (always available if not completed)
    const day1Submission = submissions.find((s) => s.day === 1)
    if (!day1Submission) {
      nextAvailableDay = 1
    } else {
      // Check other days based on unlocks and current day
      for (let day = 2; day <= Math.min(currentDay, course.dailyTasks.length); day++) {
        const submission = submissions.find((s) => s.day === day)
        const unlock = unlocks.find((u) => u.day === day)

        if (!submission && (unlock || day <= currentDay)) {
          // Check if should be unlocked
          const previousDaySubmission = submissions.find((s) => s.day === day - 1)
          if (previousDaySubmission) {
            const submissionDate = moment(previousDaySubmission.submittedAt)
            const nextUnlockTime = submissionDate.clone().add(1, "day").startOf("day")
            const now = moment()
            if (now.isAfter(nextUnlockTime)) {
              nextAvailableDay = day
              break
            }
          }
        }
      }
    }

    let availableTask = null
    let canSubmit = false
    let reason = null
    let taskDay = null

    if (nextAvailableDay) {
      const task = course.dailyTasks.find((t) => t.day === nextAvailableDay)
      if (task) {
        availableTask = task
        canSubmit = true
        taskDay = nextAvailableDay
      } else {
        reason = "Task not found for the next available day"
      }
    } else {
      reason = "No available tasks"
    }

    if (!availableTask) {
      return res.status(400).json({
        error: reason || "No available tasks",
        currentDay: currentDay,
      })
    }

    res.json({
      task: availableTask,
      courseId: course._id,
      currentDay: currentDay,
      taskDay: taskDay,
      canSubmit: canSubmit,
    })
  } catch (error) {
    console.error("Error fetching today's task:", error)
    res.status(500).json({ error: error.message })
  }
}

// Submit task with proper validation
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

    const dayNum = Number.parseInt(day)

    // Find the course and task
    const course = await Internship.findById(courseId)
    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }

    const task = course.dailyTasks.find((t) => t.day === dayNum)
    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Check if already submitted
    const existingSubmission = await TaskSubmission.findOne({
      userId: userId,
      courseId: courseId,
      day: dayNum,
    })

    if (existingSubmission) {
      return res.status(400).json({
        error: "Task already submitted for this day",
      })
    }

    // Get user's submissions and unlocks
    const submissions = await TaskSubmission.find({
      userId: userId,
      courseId: courseId,
    }).sort({ day: 1 })

    const unlocks = await TaskUnlock.find({
      userId: userId,
      courseId: courseId,
    }).sort({ day: 1 })

    // Get enrollment for validation
    const enrollment = await getUserEnrollment(userId, courseId)
    const currentDay = calculateCurrentDay(enrollment.registrationDate)

    let canSubmit = false

    // Validate task availability
    if (dayNum === 1) {
      canSubmit = true
    } else if (dayNum <= currentDay) {
      // Check if previous day is completed and enough time has passed
      const previousDaySubmission = submissions.find((s) => s.day === dayNum - 1)
      if (previousDaySubmission) {
        const submissionDate = moment(previousDaySubmission.submittedAt)
        const nextUnlockTime = submissionDate.clone().add(1, "day").startOf("day")
        const now = moment()
        canSubmit = now.isAfter(nextUnlockTime)
      }
    } else {
      canSubmit = false
    }

    if (!canSubmit) {
      return res.status(400).json({
        error: "Task is not available for submission yet.",
      })
    }

    // Get enrollment for next unlock calculation
    const nextTaskUnlockDate = moment(enrollment.registrationDate)
      .add(dayNum, "days") // Next day after current task day
      .startOf("day")
      .toDate()

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
    console.log("Next task will be available from:", nextTaskUnlockDate)

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

    const enrollments = await UserCourseEnrollment.find({ userId }).populate("courseId", "coursename field")

    res.json({
      submissions,
      unlocks,
      enrollments,
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

    // Check if already unlocked
    const existingUnlock = await TaskUnlock.findOne({
      userId: userId,
      courseId: courseId,
      day: day,
    })

    if (existingUnlock) {
      return res.status(400).json({ error: "Task already unlocked" })
    }

    // Create unlock record
    const taskUnlock = new TaskUnlock({
      userId: userId,
      courseId: courseId,
      day: day,
      unlockedAt: new Date(),
      unlockedBy: "manual",
    })

    await taskUnlock.save()

    res.json({
      message: "Task unlocked successfully",
      unlock: taskUnlock,
    })
  } catch (error) {
    console.error("Error in manual unlock:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get cron job status
exports.getCronStatus = async (req, res) => {
  try {
    const cronService = require("../services/cronServices")
    const status = cronService.getStatus()
    res.json(status)
  } catch (error) {
    console.error("Error getting cron status:", error)
    res.status(500).json({ error: error.message })
  }
}
