const { Organization } = require("../models/organizationSigninModel")
const { User } = require("../models/userVerificationModel")
const { AuthUser } = require("../models/authModel")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const { generatePassword, sendApprovalEmail, sendApprovalSMS } = require("../utils/notificationUtils")

// Get all pending organization requests
exports.getOrganizationRequests = async (req, res) => {
  try {
    console.log("Fetching organization requests...")

    const organizations = await Organization.find({ status: "Pending" })
      .populate("assignedCourse", "coursename field")
      .populate("students.courseId", "coursename field")
      .sort({ createdAt: -1 })

    console.log(`Found ${organizations.length} pending organizations`)

    const formattedOrgs = organizations.map((org) => ({
      _id: org._id,
      orgName: org.name,
      orgEmail: org.organizerEmail,
      orgContactPerson: org.organizerName,
      studentCount: org.students ? org.students.length : 0,
      submittedAt: org.createdAt,
    }))

    res.status(200).json(formattedOrgs)
  } catch (error) {
    console.error("Get organization requests error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get students under a specific organization
exports.getOrganizationStudents = async (req, res) => {
  try {
    const { orgId } = req.params
    console.log("Fetching students for organization:", orgId)

    const organization = await Organization.findById(orgId)
      .populate("assignedCourse", "coursename field")
      .populate("students.courseId", "coursename field")

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" })
    }

    const transformedStudents = organization.students.map((student) => {
      let courseSelection = "Not assigned"
      if (organization.preferredMode === "organizer" && organization.assignedCourse) {
        courseSelection = organization.assignedCourse.coursename
      } else if (organization.preferredMode === "student" && student.courseId) {
        courseSelection = student.courseId.coursename
      }

      return {
        _id: student._id,
        name: student.name || `Student ${student.registerNo}`,
        email: student.email,
        mobile: student.phone,
        registerNumber: student.registerNo,
        courseSelection: courseSelection,
        status: student.status || "Pending",
        approvedAt: student.approvedAt,
        rejectedAt: student.rejectedAt,
        approvedBy: student.approvedBy,
        courseUnlocked: student.courseUnlocked || false,
      }
    })

    const orgDetails = {
      _id: organization._id,
      orgName: organization.name,
      orgEmail: organization.organizerEmail,
      orgContactPerson: organization.organizerName,
      submittedAt: organization.createdAt,
    }

    console.log(`Found ${transformedStudents.length} students for organization`)
    res.status(200).json({
      organization: orgDetails,
      students: transformedStudents,
    })
  } catch (error) {
    console.error("Get organization students error:", error)
    res.status(500).json({ error: error.message })
  }
}

// ✅ FIXED: Auto-approve individual student with credential generation (EMAIL ONLY)
exports.approveStudent = async (req, res) => {
  try {
    const { studentId } = req.params
    const { orgId } = req.body

    console.log("🚀 Auto-approving student:", studentId, "in organization:", orgId)

    const organization = await Organization.findById(orgId)
      .populate("assignedCourse", "coursename field")
      .populate("students.courseId", "coursename field")

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" })
    }

    const student = organization.students.id(studentId)
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    if (student.status === "Approved") {
      return res.status(400).json({ message: "Student is already approved" })
    }

    // 🔐 Step 1: Generate credentials using the specified formula
    const studentName = student.name || `Student ${student.registerNo}`
    const firstName = studentName.split(" ")[0].toLowerCase()
    const last3Digits = student.registerNo.slice(-3)
    const generatedPassword = `${firstName}${last3Digits}`

    console.log(`🔑 Generated password for ${studentName}: ${generatedPassword}`)

    // Hash the password
    const passwordHash = await bcrypt.hash(generatedPassword, 10)

    // Determine course for this student
    let courseId,
      courseName = "Not assigned"
    if (organization.preferredMode === "organizer" && organization.assignedCourse) {
      courseId = organization.assignedCourse._id
      courseName = organization.assignedCourse.coursename
    } else if (organization.preferredMode === "student" && student.courseId) {
      courseId = student.courseId._id
      courseName = student.courseId.coursename
    }

    // 📝 Step 2: Update student status in organization FIRST
    student.status = "Approved"
    student.passwordHash = passwordHash
    student.generatedPassword = generatedPassword
    student.approvedAt = new Date()
    student.approvedBy = req.user?.name || "Admin"
    student.courseUnlocked = true

    await organization.save()
    console.log(`✅ Student status updated in organization`)

    // 📝 Step 3: Create/Update user account (non-blocking)
    try {
      let userAccount = await User.findOne({ mailid: student.email })

      if (!userAccount) {
        userAccount = new User({
          name: studentName,
          fathername: "Not provided",
          mailid: student.email,
          password: passwordHash,
          gender: "Other",
          phone: student.phone,
          dob: new Date("2000-01-01"),
          education: [
            {
              course: courseName,
              university: organization.name,
              percentage: 0,
            },
          ],
          address: [
            {
              address: "Not specified",
              city: "Not specified",
              state: "Not specified",
              pincode: 0,
            },
          ],
          status: "approved",
          verified: true,
          courseUnlocked: true,
        })

        await userAccount.save()
        console.log(`✅ Created user account for ${student.email}`)
      } else {
        userAccount.password = passwordHash
        userAccount.status = "approved"
        userAccount.courseUnlocked = true
        await userAccount.save()
        console.log(`✅ Updated existing user account for ${student.email}`)
      }

      // Create/Update auth user
      let authUser = await AuthUser.findOne({ mailid: student.email })

      if (!authUser) {
        authUser = new AuthUser({
          name: userAccount.name,
          mailid: userAccount.mailid,
          password: passwordHash,
          role: "User",
          originalUserId: userAccount._id,
          status: "approved",
          courseUnlocked: true,
        })
        await authUser.save()
        console.log(`✅ Created auth user for ${student.email}`)
      } else {
        authUser.password = passwordHash
        authUser.status = "approved"
        authUser.courseUnlocked = true
        await authUser.save()
        console.log(`✅ Updated auth user for ${student.email}`)
      }
    } catch (userError) {
      console.error("⚠️ User account creation failed (non-critical):", userError.message)
      // Continue with approval even if user creation fails
    }

    // 📧 Step 4: Send approval email ONLY (no SMS)
    try {
      await sendApprovalEmail(student.email, studentName, generatedPassword, courseName, organization.name)
      console.log(`✅ Approval email sent to ${student.email}`)
    } catch (emailError) {
      console.error("⚠️ Email notification failed:", emailError.message)
      // Don't fail the approval if email fails
    }

    // 📝 Step 5: Return success response
    console.log(`✅ Student approved successfully: ${studentName} (${student.email})`)

    res.status(200).json({
      success: true,
      message: "Student approved successfully! Login credentials have been sent via email.",
      student: {
        _id: student._id,
        name: studentName,
        email: student.email,
        status: student.status,
        approvedAt: student.approvedAt,
        course: courseName,
        courseUnlocked: true,
        loginCredentials: {
          loginId: student.email,
          password: generatedPassword,
        },
      },
    })
  } catch (error) {
    console.error("❌ Approve student error:", error)
    res.status(500).json({
      success: false,
      error: "Failed to approve student",
      details: error.message,
    })
  }
}

// ✅ UPDATED: Bulk approve all students with auto-credential generation
exports.bulkApproveStudents = async (req, res) => {
  try {
    const { orgId } = req.params

    console.log("🚀 Bulk auto-approving students for organization:", orgId)

    const organization = await Organization.findById(orgId)
      .populate("assignedCourse", "coursename field")
      .populate("students.courseId", "coursename field")

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" })
    }

    const approvedStudents = []
    const failedStudents = []
    const pendingStudents = organization.students.filter((student) => student.status === "Pending" || !student.status)

    console.log(`📊 Processing ${pendingStudents.length} pending students...`)

    for (const student of pendingStudents) {
      try {
        // Generate credentials using the specified formula
        const studentName = student.name || `Student ${student.registerNo}`
        const firstName = studentName.split(" ")[0].toLowerCase()
        const last3Digits = student.registerNo.slice(-3)
        const generatedPassword = `${firstName}${last3Digits}`

        const passwordHash = await bcrypt.hash(generatedPassword, 10)

        // Determine course
        let courseId, courseName
        if (organization.preferredMode === "organizer" && organization.assignedCourse) {
          courseId = organization.assignedCourse._id
          courseName = organization.assignedCourse.coursename
        } else if (organization.preferredMode === "student" && student.courseId) {
          courseId = student.courseId._id
          courseName = student.courseId.coursename
        }

        // Create/Update user account
        let userAccount = await User.findOne({ mailid: student.email })

        if (!userAccount) {
          userAccount = new User({
            name: studentName,
            fathername: "Not provided",
            mailid: student.email,
            password: passwordHash,
            gender: "Other",
            phone: student.phone,
            dob: new Date("2000-01-01"),
            education: [
              {
                course: courseName || "Not assigned",
                university: organization.name,
                percentage: 0,
              },
            ],
            address: [
              {
                address: "Not specified",
                city: "Not specified",
                state: "Not specified",
                pincode: 0,
              },
            ],
            status: "approved",
            verified: true,
            courseUnlocked: true,
          })
          await userAccount.save()
        } else {
          userAccount.password = passwordHash
          userAccount.status = "approved"
          userAccount.courseUnlocked = true
          await userAccount.save()
        }

        // Create/Update auth user
        let authUser = await AuthUser.findOne({ mailid: student.email })

        if (!authUser) {
          authUser = new AuthUser({
            name: userAccount.name,
            mailid: userAccount.mailid,
            password: passwordHash,
            role: "User",
            originalUserId: userAccount._id,
            status: "approved",
            courseUnlocked: true,
          })
          await authUser.save()
        } else {
          authUser.password = passwordHash
          authUser.status = "approved"
          authUser.courseUnlocked = true
          await authUser.save()
        }

        // Update student in organization
        student.status = "Approved"
        student.passwordHash = passwordHash
        student.generatedPassword = generatedPassword
        student.approvedAt = new Date()
        student.approvedBy = req.user?.name || "Admin"
        student.courseUnlocked = true

        // Send EMAIL notification only
        try {
          await sendApprovalEmail(
            student.email,
            studentName,
            generatedPassword,
            courseName || "Not assigned",
            organization.name,
          )
          console.log(`✅ Email sent to ${student.email}`)
        } catch (notificationError) {
          console.error(`⚠️ Email failed for ${student.email}:`, notificationError)
          // Continue even if email fails
        }

        approvedStudents.push({
          _id: student._id,
          name: studentName,
          email: student.email,
          course: courseName,
          loginCredentials: {
            loginId: student.email,
            password: generatedPassword,
          },
          courseUnlocked: true,
        })

        console.log(`✅ Approved: ${studentName} (${student.email})`)
      } catch (error) {
        console.error(`❌ Failed to approve student ${student.registerNo}:`, error)
        failedStudents.push({
          _id: student._id,
          name: student.name || `Student ${student.registerNo}`,
          email: student.email,
          error: error.message,
        })
      }
    }

    await organization.save()

    console.log(`🎉 Bulk approval completed: ${approvedStudents.length} approved, ${failedStudents.length} failed`)

    res.status(200).json({
      success: true,
      message: `🎉 Bulk approval completed! ${approvedStudents.length} students approved successfully.`,
      summary: {
        totalProcessed: pendingStudents.length,
        approved: approvedStudents.length,
        failed: failedStudents.length,
      },
      approvedStudents,
      failedStudents,
    })
  } catch (error) {
    console.error("❌ Bulk approve error:", error)
    res.status(500).json({
      error: "Bulk approval failed",
      details: error.message,
    })
  }
}

// Reject individual student
exports.rejectStudent = async (req, res) => {
  try {
    const { studentId } = req.params
    const { orgId, rejectionReason } = req.body

    const organization = await Organization.findById(orgId)
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" })
    }

    const student = organization.students.id(studentId)
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    student.status = "Rejected"
    student.rejectedAt = new Date()
    student.rejectionReason = rejectionReason || "Application rejected by admin"
    student.approvedBy = req.user?.name || "Admin"

    await organization.save()

    res.status(200).json({
      message: "Student rejected successfully",
      student: {
        _id: student._id,
        name: student.name || `Student ${student.registerNo}`,
        email: student.email,
        status: student.status,
        rejectedAt: student.rejectedAt,
      },
    })
  } catch (error) {
    console.error("Reject student error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get organization details
exports.getOrganizationDetails = async (req, res) => {
  try {
    const { orgId } = req.params

    const organization = await Organization.findById(orgId)
      .populate("assignedCourse", "coursename field description")
      .populate("students.courseId", "coursename field description")

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" })
    }

    res.status(200).json(organization)
  } catch (error) {
    console.error("Get organization details error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get all organization requests (including approved and rejected)
exports.getAllOrganizationRequests = async (req, res) => {
  try {
    const { status } = req.query

    const filter = {}
    if (status && status !== "All") {
      filter.status = status
    }

    const organizations = await Organization.find(filter)
      .populate("assignedCourse", "coursename field")
      .populate("students.courseId", "coursename field")
      .sort({ createdAt: -1 })

    const formattedOrgs = organizations.map((org) => ({
      _id: org._id,
      orgName: org.name,
      orgEmail: org.organizerEmail,
      orgContactPerson: org.organizerName,
      studentCount: org.students.length,
      submittedAt: org.createdAt,
      status: org.status,
      processedAt: org.approvedAt,
    }))

    res.status(200).json(formattedOrgs)
  } catch (error) {
    console.error("Get all organization requests error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Update organization status
exports.updateOrganizationStatus = async (req, res) => {
  try {
    const { orgId } = req.params
    const { status, adminFeedback } = req.body

    const organization = await Organization.findById(orgId)
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" })
    }

    organization.status = status
    organization.approvedAt = new Date()
    if (adminFeedback) {
      organization.adminFeedback = adminFeedback
    }

    await organization.save()

    res.status(200).json({
      message: `Organization ${status.toLowerCase()} successfully`,
      organization: {
        _id: organization._id,
        orgName: organization.name,
        status: organization.status,
        processedAt: organization.approvedAt,
      },
    })
  } catch (error) {
    console.error("Update organization status error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Debug endpoint
exports.debugOrganizations = async (req, res) => {
  try {
    const db = mongoose.connection.db
    const organizations = await Organization.find({}).limit(5)
    const collections = await db.listCollections().toArray()

    res.status(200).json({
      message: "Debug information",
      collections: collections.map((c) => c.name),
      organizationCount: organizations.length,
      sampleData: organizations,
    })
  } catch (error) {
    console.error("Debug error:", error)
    res.status(500).json({ error: error.message })
  }
}
