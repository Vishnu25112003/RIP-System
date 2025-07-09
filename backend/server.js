const express = require("express")
const dotenv = require("dotenv")
const connectDB = require("./config/db.js")
const cors = require("cors")
const path = require("path")
const fs = require("fs")

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

// Routes
const userVerificationRoutes = require("./routes/userVerificationRoutes")
const internshipRoutes = require("./routes/internshipManagementRoutes")
const authRoutes = require("./routes/authRoutes") // ✅ Add auth routes

app.use("/api/userverification", userVerificationRoutes)
app.use("/api/internships", internshipRoutes)
app.use("/api/auth", authRoutes) // ✅ Add auth routes

// Health check/test route
app.get("/", (req, res) => {
  res.send("API is running...")
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

module.exports = app
