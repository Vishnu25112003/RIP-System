const express = require("express")
const dotenv = require("dotenv")
const connectDB = require("./config/db.js")
const cors = require("cors")
const path = require("path")
const fs = require("fs")

// Initialize cron service
const cronService = require("./services/cronServices")

dotenv.config()
connectDB()

const app = express()

const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir)
  console.log("'uploads' folder created.")
}

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
)

app.use(express.json())

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Import routes
const userVerificationRoutes = require("./routes/userVerificationRoutes")
const internshipRoutes = require("./routes/internshipManagementRoutes")
const authRoutes = require("./routes/authRoutes")
const applicationRoutes = require("./routes/applicationRoutes")
const taskRoutes = require("./routes/taskSubmissionRoutes")
const userActivityRoutes = require("./routes/userActivityRoutes")
const adminDashboardRoutes = require("./routes/adminDashboardRoutes")
const organizationRoutes = require("./routes/organizationSigninRoutes") 
const organizationApprovalRoutes = require("./routes/organizationApprovalRoutes")

// Register routes
app.use("/api/userverification", userVerificationRoutes)
app.use("/api/internships", internshipRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/applications", applicationRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/admin", userActivityRoutes)
app.use("/api/admin/dashboard", adminDashboardRoutes)
app.use("/api/organization", organizationRoutes) 
app.use("/api/admin/organization", organizationApprovalRoutes)

// Health check/test route
app.get("/", (req, res) => {
  res.send("API is running...")
})

// Test route to verify server is working
app.get("/test", (req, res) => {
  res.json({
    message: "Server is working!",
    timestamp: new Date().toISOString(),
  })
})

// Test route for admin endpoints
app.get("/api/admin/test", (req, res) => {
  res.json({
    message: "Admin routes are working!",
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      "/api/admin/task-submissions",
      "/api/admin/task-statistics",
      "/api/admin/user-submissions/:userId",
      "/api/admin/course-submissions/:courseId",
    ],
  })
})

// DEBUGGING: List all registered routes
app.get("/debug/routes", (req, res) => {
  const routes = []
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      })
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: middleware.regexp.source.replace("\\/?(?=\\/|$)", "") + handler.route.path,
            methods: Object.keys(handler.route.methods),
          })
        }
      })
    }
  })
  res.json({ routes })
})

// DEBUGGING: Check specific user application data
app.get("/debug/user/:email", async (req, res) => {
  try {
    const { User } = require("./models/userVerificationModel")
    const { Application } = require("./models/applicationModel")

    const { email } = req.params
    console.log("=== DEBUG USER DATA ===")
    console.log("Email:", email)

    // Find user
    const user = await User.findOne({ mailid: email })
    console.log("User found:", user ? { id: user._id, name: user.name, email: user.mailid } : "NOT FOUND")

    if (!user) {
      return res.json({ error: "User not found", email })
    }

    // Find applications
    const applications = await Application.find({ userId: user._id }).sort({ createdAt: -1 })
    console.log("Applications found:", applications.length)

    applications.forEach((app, index) => {
      console.log(`Application ${index + 1}:`, {
        id: app._id,
        status: app.status,
        course: app.courseSelection,
        createdAt: app.createdAt,
        approvedAt: app.approvedAt,
      })
    })

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.mailid,
      },
      applications: applications.map((app) => ({
        id: app._id,
        status: app.status,
        courseSelection: app.courseSelection,
        learningPreference: app.learningPreference,
        technicalSkills: app.technicalSkills,
        createdAt: app.createdAt,
        approvedAt: app.approvedAt,
        adminFeedback: app.adminFeedback,
      })),
    })
  } catch (error) {
    console.error("Debug error:", error)
    res.status(500).json({ error: error.message })
  }
})

// Initialize cron jobs after server setup
const initializeCronJobs = () => {
  try {
    cronService.init()
  } catch (error) {
    console.error("❌ Failed to initialize cron jobs:", error)
  }
}

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Admin API available at http://localhost:${PORT}/api/admin/`)
  console.log(`Test admin endpoint: http://localhost:${PORT}/api/admin/test`)

  // Initialize cron jobs after server starts
  setTimeout(() => {
    initializeCronJobs()
  }, 2000)
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...")
  cronService.stop()
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server...")
  cronService.stop()
  process.exit(0)
})

module.exports = app
