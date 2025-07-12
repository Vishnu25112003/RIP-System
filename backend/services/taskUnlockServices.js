const moment = require("moment-timezone")
const TaskSubmission = require("../models/taskSubmissionModel")
const TaskUnlock = require("../models/taskUnlockModel")
const UserCourseEnrollment = require("../models/userCourseEnrollmentModel")
const Internship = require("../models/internshipManagementModel")
const { Application } = require("../models/applicationModel")

class TaskUnlockService {
  constructor() {
    this.timezone = "Asia/Kolkata"
  }

  // Calculate current day based on registration date
  calculateCurrentDay(registrationDate, timezone = this.timezone) {
    const now = moment().tz(timezone)
    const startDate = moment(registrationDate).tz(timezone).startOf("day")
    const daysSinceRegistration = now.diff(startDate, "days")
    return daysSinceRegistration + 1 // Day 1, Day 2, etc.
  }

  // Get user's enrollment info
  async getUserEnrollment(userId, courseId) {
    let enrollment = await UserCourseEnrollment.findOne({
      userId: userId,
      courseId: courseId,
    })

    // If no enrollment exists, create one from approved application
    if (!enrollment) {
      const application = await Application.findOne({
        userId: userId,
        status: "Approved",
      }).populate("userId")

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

      // Create enrollment record
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

  // Check if a specific day should be unlocked
  async shouldUnlockDay(userId, courseId, day) {
    try {
      const enrollment = await this.getUserEnrollment(userId, courseId)
      const currentDay = this.calculateCurrentDay(enrollment.registrationDate, enrollment.timezone)

      // Day 1 is always available
      if (day === 1) {
        return { shouldUnlock: true, reason: "Day 1 is always available" }
      }

      // Can't unlock future days beyond current day
      if (day > currentDay) {
        return {
          shouldUnlock: false,
          reason: `Day ${day} is not yet available. Current day is ${currentDay}`,
        }
      }

      // Check if previous day is completed
      const previousDaySubmission = await TaskSubmission.findOne({
        userId: userId,
        courseId: courseId,
        day: day - 1,
        status: "Completed",
      })

      if (!previousDaySubmission) {
        return {
          shouldUnlock: false,
          reason: `Complete Day ${day - 1} first`,
        }
      }

      // Check if enough time has passed since previous day completion
      const submissionDate = moment(previousDaySubmission.submittedAt).tz(enrollment.timezone)
      const nextUnlockTime = submissionDate.clone().add(1, "day").startOf("day")
      const now = moment().tz(enrollment.timezone)

      if (now.isBefore(nextUnlockTime)) {
        return {
          shouldUnlock: false,
          reason: `Day ${day} unlocks at ${nextUnlockTime.format("MMM DD, YYYY")} at 12:00 AM`,
        }
      }

      return { shouldUnlock: true, reason: "All conditions met" }
    } catch (error) {
      console.error("Error checking unlock conditions:", error)
      return { shouldUnlock: false, reason: error.message }
    }
  }

  // Get user's current available task
  async getCurrentAvailableTask(userId, courseId) {
    try {
      const enrollment = await this.getUserEnrollment(userId, courseId)
      const course = await Internship.findById(courseId)

      if (!course) {
        throw new Error("Course not found")
      }

      const submissions = await TaskSubmission.find({
        userId: userId,
        courseId: courseId,
      }).sort({ day: 1 })

      const unlocks = await TaskUnlock.find({
        userId: userId,
        courseId: courseId,
      }).sort({ day: 1 })

      // Find the first incomplete task that should be available
      for (let day = 1; day <= course.dailyTasks.length; day++) {
        const submission = submissions.find((s) => s.day === day)

        if (!submission) {
          // Task not completed, check if it should be available
          const unlockCheck = await this.shouldUnlockDay(userId, courseId, day)

          if (unlockCheck.shouldUnlock) {
            // Ensure unlock record exists
            const existingUnlock = unlocks.find((u) => u.day === day)
            if (!existingUnlock && day > 1) {
              await this.createUnlockRecord(userId, courseId, day, "auto")
            }

            const task = course.dailyTasks.find((t) => t.day === day)
            return {
              task: task,
              day: day,
              canSubmit: true,
              currentDay: this.calculateCurrentDay(enrollment.registrationDate, enrollment.timezone),
            }
          } else {
            // This task is not available yet, return info about when it will be
            const task = course.dailyTasks.find((t) => t.day === day)
            return {
              task: task,
              day: day,
              canSubmit: false,
              reason: unlockCheck.reason,
              currentDay: this.calculateCurrentDay(enrollment.registrationDate, enrollment.timezone),
            }
          }
        }
      }

      // All tasks completed
      return {
        task: null,
        day: course.dailyTasks.length + 1,
        canSubmit: false,
        reason: "All tasks completed",
        currentDay: this.calculateCurrentDay(enrollment.registrationDate, enrollment.timezone),
      }
    } catch (error) {
      console.error("Error getting current available task:", error)
      throw error
    }
  }

  // Create unlock record
  async createUnlockRecord(userId, courseId, day, unlockedBy = "auto") {
    try {
      const existingUnlock = await TaskUnlock.findOne({
        userId: userId,
        courseId: courseId,
        day: day,
      })

      if (existingUnlock) {
        return existingUnlock
      }

      const unlock = new TaskUnlock({
        userId: userId,
        courseId: courseId,
        day: day,
        unlockedAt: new Date(),
        unlockedBy: unlockedBy,
      })

      await unlock.save()
      return unlock
    } catch (error) {
      console.error("Error creating unlock record:", error)
      throw error
    }
  }

  // Process midnight unlocks for all users
  async processMidnightUnlocks() {
    try {
      console.log("🌙 Processing midnight task unlocks...")

      const enrollments = await UserCourseEnrollment.find({ status: "Active" })
      let totalUnlocked = 0

      for (const enrollment of enrollments) {
        try {
          const course = await Internship.findById(enrollment.courseId)
          if (!course) continue

          const submissions = await TaskSubmission.find({
            userId: enrollment.userId,
            courseId: enrollment.courseId,
          }).sort({ day: 1 })

          const unlocks = await TaskUnlock.find({
            userId: enrollment.userId,
            courseId: enrollment.courseId,
          }).sort({ day: 1 })

          const currentDay = this.calculateCurrentDay(enrollment.registrationDate, enrollment.timezone)

          // Check each day up to current day
          for (let day = 2; day <= Math.min(currentDay, course.dailyTasks.length); day++) {
            const existingUnlock = unlocks.find((u) => u.day === day)
            if (existingUnlock) continue

            const unlockCheck = await this.shouldUnlockDay(enrollment.userId, enrollment.courseId, day)

            if (unlockCheck.shouldUnlock) {
              await this.createUnlockRecord(enrollment.userId, enrollment.courseId, day, "cron")
              totalUnlocked++
              console.log(`🔓 Unlocked Day ${day} for user ${enrollment.userId}`)
            }
          }
        } catch (userError) {
          console.error(`❌ Error processing user ${enrollment.userId}:`, userError.message)
        }
      }

      console.log(`✅ Midnight unlock completed. ${totalUnlocked} tasks unlocked.`)
      return totalUnlocked
    } catch (error) {
      console.error("❌ Error in midnight unlock process:", error)
      throw error
    }
  }
}

module.exports = new TaskUnlockService()
