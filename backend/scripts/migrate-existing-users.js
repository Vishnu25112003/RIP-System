const mongoose = require("mongoose")
const { Application } = require("../models/applicationModel")
const UserCourseEnrollment = require("../models/userCourseEnrollmentModel")
const Internship = require("../models/internshipManagementModel")

async function migrateExistingUsers() {
  try {
    console.log("🔄 Starting migration of existing users...")

    // Find all approved applications that don't have enrollment records
    const approvedApplications = await Application.find({ status: "Approved" })

    let migratedCount = 0

    for (const application of approvedApplications) {
      try {
        // Find the course
        const course = await Internship.findOne({
          coursename: application.courseSelection,
          status: "Active",
        })

        if (!course) {
          console.log(`❌ Course not found: ${application.courseSelection}`)
          continue
        }

        // Check if enrollment already exists
        const existingEnrollment = await UserCourseEnrollment.findOne({
          userId: application.userId,
          courseId: course._id,
        })

        if (existingEnrollment) {
          console.log(`✅ Enrollment already exists for user ${application.userId}`)
          continue
        }

        // Create enrollment record
        const enrollment = new UserCourseEnrollment({
          userId: application.userId,
          courseId: course._id,
          applicationId: application._id,
          registrationDate: application.approvedAt || application.createdAt,
          startDate: application.approvedAt || application.createdAt,
          status: "Active",
          timezone: "Asia/Kolkata",
        })

        await enrollment.save()
        migratedCount++

        console.log(`✅ Created enrollment for user ${application.userId} in course ${course.coursename}`)
      } catch (userError) {
        console.error(`❌ Error migrating user ${application.userId}:`, userError.message)
      }
    }

    console.log(`🎉 Migration completed! ${migratedCount} users migrated.`)
  } catch (error) {
    console.error("❌ Migration failed:", error)
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const connectDB = require("../config/db")

  connectDB().then(() => {
    migrateExistingUsers()
      .then(() => {
        process.exit(0)
      })
      .catch((error) => {
        console.error("Migration error:", error)
        process.exit(1)
      })
  })
}

module.exports = migrateExistingUsers
