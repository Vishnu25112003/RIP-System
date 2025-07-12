const cron = require("node-cron")
const moment = require("moment-timezone")
const TaskSubmission = require("../models/taskSubmissionModel")
const TaskUnlock = require("../models/taskUnlockModel")
const Internship = require("../models/internshipManagementModel")
const { Application } = require("../models/applicationModel")
const UserCourseEnrollment = require("../models/userCourseEnrollmentModel")

class CronService {
  constructor() {
    this.timezone = "Asia/Kolkata"
    this.isRunning = false
  }

  // Initialize all cron jobs
  init() {
    console.log("🕐 Initializing Cron Jobs...")
    this.startMidnightTaskUnlocker()
    this.isRunning = true
    console.log("✅ Cron Jobs Started Successfully")
  }

  // Main cron job that runs at midnight (12:00 AM) every day
  startMidnightTaskUnlocker() {
    // Run at 12:00 AM every day
    cron.schedule(
      "0 0 * * *",
      async () => {
        console.log("🌙 Midnight Task Unlocker Running...")
        await this.unlockNextDayTasks()
      },
      {
        scheduled: true,
        timezone: this.timezone,
      },
    )

    // Also run every 5 minutes for testing (remove in production)
    // cron.schedule('*/5 * * * *', async () => {
    //   console.log('🔄 Testing Task Unlocker...');
    //   await this.unlockNextDayTasks();
    // });

    console.log("⏰ Midnight Task Unlocker scheduled for 12:00 AM daily")
  }

  // Main logic to unlock next day tasks
  async unlockNextDayTasks() {
    try {
      const now = moment().tz(this.timezone)
      const today = now.format("YYYY-MM-DD")

      console.log(`🔍 Checking for tasks to unlock on ${today}...`)

      // Find all approved applications
      const applications = await Application.find({ status: "Approved" }).populate("userId")

      let totalUnlocked = 0

      for (const application of applications) {
        try {
          const userId = application.userId._id
          const courseName = application.courseSelection

          // Find the course
          const course = await Internship.findOne({
            coursename: courseName,
            status: "Active",
          })

          if (!course) {
            console.log(`❌ Course not found: ${courseName}`)
            continue
          }

          // Get or create enrollment
          let enrollment = await UserCourseEnrollment.findOne({
            userId: userId,
            courseId: course._id,
          })

          if (!enrollment) {
            // Create enrollment from application
            enrollment = new UserCourseEnrollment({
              userId: userId,
              courseId: course._id,
              applicationId: application._id,
              registrationDate: application.approvedAt || application.createdAt,
              startDate: application.approvedAt || application.createdAt,
            })
            await enrollment.save()
          }

          // Calculate current day based on registration
          const registrationDate = moment(enrollment.registrationDate).tz(this.timezone).startOf("day")
          const currentDay = now.diff(registrationDate, "days") + 1

          // Get user's submissions and unlocks
          const submissions = await TaskSubmission.find({
            userId: userId,
            courseId: course._id,
          }).sort({ day: 1 })

          const unlocks = await TaskUnlock.find({
            userId: userId,
            courseId: course._id,
          }).sort({ day: 1 })

          // Check each day up to current day for unlocking
          for (let day = 2; day <= Math.min(currentDay, course.dailyTasks.length); day++) {
            // Skip if already unlocked
            const existingUnlock = unlocks.find((u) => u.day === day)
            if (existingUnlock) continue

            // Check if previous day is completed
            const previousDaySubmission = submissions.find((s) => s.day === day - 1)
            if (!previousDaySubmission) continue

            // Check if enough time has passed since previous day completion
            const submissionDate = moment(previousDaySubmission.submittedAt).tz(this.timezone)
            const nextUnlockTime = submissionDate.clone().add(1, "day").startOf("day")

            if (now.isAfter(nextUnlockTime)) {
              // Create unlock record
              const taskUnlock = new TaskUnlock({
                userId: userId,
                courseId: course._id,
                day: day,
                unlockedAt: now.toDate(),
                unlockedBy: "cron",
              })

              await taskUnlock.save()
              totalUnlocked++

              console.log(`🔓 Unlocked Day ${day} for user ${userId} (Course: ${course.coursename})`)
            }
          }
        } catch (userError) {
          console.error(`❌ Error processing user ${application.userId.name}:`, userError.message)
        }
      }

      console.log(`✅ Midnight Task Unlocker completed. ${totalUnlocked} tasks unlocked.`)
      return totalUnlocked
    } catch (error) {
      console.error("❌ Error in midnight task unlocker:", error)
    }
  }

  // Get cron job status
  getStatus() {
    return {
      isRunning: this.isRunning,
      timezone: this.timezone,
      nextMidnightRun: moment().tz(this.timezone).add(1, "day").startOf("day").format(),
      currentTime: moment().tz(this.timezone).format(),
    }
  }

  // Stop all cron jobs
  stop() {
    cron.getTasks().forEach((task) => {
      task.stop()
    })
    this.isRunning = false
    console.log("🛑 All cron jobs stopped")
  }
}

module.exports = new CronService()
