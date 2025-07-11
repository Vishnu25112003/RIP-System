const cron = require("node-cron")
const moment = require("moment-timezone")
const TaskSubmission = require("../models/taskSubmissionModel")
const TaskUnlock = require("../models/taskUnlockModel")
const Internship = require("../models/internshipManagementModel")
const { Application } = require("../models/applicationModel")

class CronService {
  constructor() {
    this.timezone = "Asia/Kolkata" // Change to your timezone
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

    // Also run every minute for testing (remove in production)
    // cron.schedule('* * * * *', async () => {
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

          // Check if user has completed a task yesterday that should unlock today
          const unlockedCount = await this.processUserTaskUnlocks(userId, course, submissions, unlocks, now)

          totalUnlocked += unlockedCount
        } catch (userError) {
          console.error(`❌ Error processing user ${application.userId.name}:`, userError.message)
        }
      }

      console.log(`✅ Midnight Task Unlocker completed. ${totalUnlocked} tasks unlocked.`)
    } catch (error) {
      console.error("❌ Error in midnight task unlocker:", error)
    }
  }

  // Process task unlocks for a specific user
  async processUserTaskUnlocks(userId, course, submissions, unlocks, now) {
    let unlockedCount = 0

    try {
      // Day 1 is always unlocked by default, so start checking from Day 2
      for (let day = 2; day <= course.dailyTasks.length; day++) {
        // Check if this day is already unlocked
        const existingUnlock = unlocks.find((u) => u.day === day)
        if (existingUnlock) {
          continue // Already unlocked
        }

        // Check if previous day is completed
        const previousDaySubmission = submissions.find((s) => s.day === day - 1)
        if (!previousDaySubmission) {
          break // Previous day not completed, stop checking further days
        }

        // Check if previous day was completed yesterday or earlier
        const submissionDate = moment(previousDaySubmission.submittedAt).tz(this.timezone)
        const daysSinceSubmission = now.diff(submissionDate, "days")

        // If the task was submitted yesterday or earlier, unlock the next day
        if (daysSinceSubmission >= 1) {
          // Create unlock record
          const taskUnlock = new TaskUnlock({
            userId: userId,
            courseId: course._id,
            day: day,
            unlockedAt: now.toDate(),
            unlockedBy: "cron",
          })

          await taskUnlock.save()
          unlockedCount++

          console.log(`🔓 Unlocked Day ${day} for user ${userId} (Course: ${course.coursename})`)
        }
      }
    } catch (error) {
      console.error(`❌ Error processing unlocks for user ${userId}:`, error.message)
    }

    return unlockedCount
  }

  // Manual function to unlock a specific task (for admin use)
  async manualUnlockTask(userId, courseId, day) {
    try {
      // Check if already unlocked
      const existingUnlock = await TaskUnlock.findOne({
        userId: userId,
        courseId: courseId,
        day: day,
      })

      if (existingUnlock) {
        return { success: false, message: "Task already unlocked" }
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

      console.log(`🔓 Manually unlocked Day ${day} for user ${userId}`)
      return { success: true, message: "Task unlocked successfully" }
    } catch (error) {
      console.error("❌ Error in manual unlock:", error)
      return { success: false, message: error.message }
    }
  }

  // Get cron job status
  getStatus() {
    return {
      isRunning: this.isRunning,
      timezone: this.timezone,
      nextMidnightRun: moment().tz(this.timezone).add(1, "day").startOf("day").format(),
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
