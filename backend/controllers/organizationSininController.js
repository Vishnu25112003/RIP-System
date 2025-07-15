const { Organization } = require("../models/organizationSigninModel")
const { User } = require("../models/userVerificationModel")
const { AuthUser } = require("../models/authModel")
const Internship = require("../models/internshipManagementModel")
const bcrypt = require("bcryptjs")

// Register organization with multiple students
exports.registerOrganization = async (req, res) => {
  try {
    console.log("Organization registration data:", req.body)

    const { name, organizerName, organizerEmail, organizerPhone, preferredMode, assignedCourse, students } = req.body

    // Validate required fields
    if (!name || !organizerName || !organizerEmail || !organizerPhone || !preferredMode) {
      return res.status(400).json({
        message: "Organization name, organizer details, and preferred mode are required",
      })
    }

    // Validate students array
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "At least one student is required" })
    }

    // Validate course assignment based on preferred mode
    if (preferredMode === "organizer" && !assignedCourse) {
      return res.status(400).json({ message: "Course selection is required for organizer preferred mode" })
    }

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ organizerEmail })
    if (existingOrg) {
      return res.status(400).json({ message: "Organization with this organizer email already exists" })
    }

    // Validate course exists if organizer preferred
    if (preferredMode === "organizer") {
      const course = await Internship.findById(assignedCourse)
      if (!course) {
        return res.status(400).json({ message: "Selected course not found" })
      }
    }

    // Validate student courses if student preferred
    if (preferredMode === "student") {
      for (const student of students) {
        if (!student.courseId) {
          return res.status(400).json({ message: "Course selection is required for all students" })
        }
        const course = await Internship.findById(student.courseId)
        if (!course) {
          return res.status(400).json({ message: `Course not found for student ${student.registerNo}` })
        }
      }
    }

    // Check for duplicate student emails within the organization
    const studentEmails = students.map((s) => s.email.toLowerCase())
    const uniqueEmails = new Set(studentEmails)
    if (uniqueEmails.size !== studentEmails.length) {
      return res.status(400).json({ message: "Duplicate student emails found within organization" })
    }

    // Check if any student email already exists in the system
    for (const student of students) {
      const existingUser = await User.findOne({ mailid: student.email.toLowerCase() })
      if (existingUser) {
        return res.status(400).json({
          message: `Student with email ${student.email} already exists in the system`,
        })
      }
    }

    // Create organization record
    const organization = new Organization({
      name,
      organizerName,
      organizerEmail: organizerEmail.toLowerCase(),
      organizerPhone,
      preferredMode,
      assignedCourse: preferredMode === "organizer" ? assignedCourse : undefined,
      students: students.map((student) => ({
        registerNo: student.registerNo,
        email: student.email.toLowerCase(),
        phone: student.phone,
        courseId: preferredMode === "student" ? student.courseId : undefined,
      })),
    })

    await organization.save()

    // Populate course information for response
    await organization.populate([
      { path: "assignedCourse", select: "coursename field" },
      { path: "students.courseId", select: "coursename field" },
    ])

    res.status(201).json({
      message: "Organization registered successfully! Awaiting admin approval.",
      organization: {
        id: organization._id,
        name: organization.name,
        organizerName: organization.organizerName,
        organizerEmail: organization.organizerEmail,
        preferredMode: organization.preferredMode,
        studentsCount: organization.students.length,
        status: organization.status,
        createdAt: organization.createdAt,
      },
    })
  } catch (error) {
    console.error("Organization registration error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get pending organizations for admin approval
exports.getPendingOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({ status: "Pending" })
      .populate("assignedCourse", "coursename field")
      .populate("students.courseId", "coursename field")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "Pending organizations fetched successfully",
      data: organizations,
    })
  } catch (error) {
    console.error("Error fetching pending organizations:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get all organizations (for admin)
exports.getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate("assignedCourse", "coursename field")
      .populate("students.courseId", "coursename field")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "Organizations fetched successfully",
      data: organizations,
    })
  } catch (error) {
    console.error("Error fetching organizations:", error)
    res.status(500).json({ error: error.message })
  }
}

// Approve organization and create user accounts
exports.approveOrganization = async (req, res) => {
  try {
    const { id } = req.params
    const { adminFeedback } = req.body

    const organization = await Organization.findById(id).populate("assignedCourse").populate("students.courseId")

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" })
    }

    if (organization.status !== "Pending") {
      return res.status(400).json({ message: "Organization is not in pending status" })
    }

    // Create user accounts for all students
    const createdUsers = []
    const defaultPassword = "student123" // You might want to generate random passwords
    const hashedPassword = await bcrypt.hash(defaultPassword, 12)

    for (const student of organization.students) {
      // Determine course for this student
      const courseId =
        organization.preferredMode === "organizer" ? organization.assignedCourse._id : student.courseId._id

      const courseName =
        organization.preferredMode === "organizer"
          ? organization.assignedCourse.coursename
          : student.courseId.coursename

      // Create user in verification collection
      const newUser = new User({
        name: `Student ${student.registerNo}`, // You might want to collect actual names
        fathername: "Not provided",
        mailid: student.email,
        password: hashedPassword,
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
        status: "Active",
        verified: true,
      })

      await newUser.save()

      // Create auth user
      const authUser = new AuthUser({
        name: newUser.name,
        mailid: newUser.mailid,
        password: hashedPassword,
        role: "User",
        originalUserId: newUser._id,
      })

      await authUser.save()

      createdUsers.push({
        userId: newUser._id,
        email: student.email,
        registerNo: student.registerNo,
        course: courseName,
      })
    }

    // Update organization status
    organization.status = "Approved"
    organization.adminFeedback = adminFeedback || "Organization approved successfully"
    organization.approvedAt = new Date()
    organization.approvedBy = req.user?.name || "Admin"

    await organization.save()

    res.status(200).json({
      message: "Organization approved successfully",
      organization: {
        id: organization._id,
        name: organization.name,
        status: organization.status,
        approvedAt: organization.approvedAt,
      },
      createdUsers: createdUsers,
      defaultPassword: defaultPassword, // In production, send this via email
    })
  } catch (error) {
    console.error("Error approving organization:", error)
    res.status(500).json({ error: error.message })
  }
}

// Reject organization
exports.rejectOrganization = async (req, res) => {
  try {
    const { id } = req.params
    const { adminFeedback } = req.body

    const organization = await Organization.findById(id)

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" })
    }

    if (organization.status !== "Pending") {
      return res.status(400).json({ message: "Organization is not in pending status" })
    }

    organization.status = "Rejected"
    organization.adminFeedback = adminFeedback || "Organization registration rejected"
    organization.approvedBy = req.user?.name || "Admin"

    await organization.save()

    res.status(200).json({
      message: "Organization rejected successfully",
      organization: {
        id: organization._id,
        name: organization.name,
        status: organization.status,
        adminFeedback: organization.adminFeedback,
      },
    })
  } catch (error) {
    console.error("Error rejecting organization:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get organization details
exports.getOrganizationDetails = async (req, res) => {
  try {
    const { id } = req.params

    const organization = await Organization.findById(id)
      .populate("assignedCourse", "coursename field description")
      .populate("students.courseId", "coursename field description")

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" })
    }

    res.status(200).json({
      message: "Organization details fetched successfully",
      data: organization,
    })
  } catch (error) {
    console.error("Error fetching organization details:", error)
    res.status(500).json({ error: error.message })
  }
}
