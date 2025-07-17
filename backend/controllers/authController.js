const { AuthUser } = require("../models/authModel")
const { User } = require("../models/userVerificationModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "30d" })
}

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { mailid, password } = req.body

    // Special case for admin login
    if (mailid === "admin@gmail.com" && password === "admin123") {
      const token = generateToken("admin", "Admin")
      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: {
          id: "admin",
          name: "Admin",
          mailid: "admin@gmail.com",
          role: "Admin",
        },
      })
    }

    // Check if user exists in auth collection
    const authUser = await AuthUser.findOne({ mailid })
    if (!authUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, authUser.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(authUser._id, authUser.role)

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: authUser._id,
        name: authUser.name,
        mailid: authUser.mailid,
        role: authUser.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Verify token
exports.verifyToken = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.userId === "admin") {
      return res.status(200).json({
        user: {
          id: "admin",
          name: "Admin",
          mailid: "admin@gmail.com",
          role: "Admin",
        },
      })
    }

    const user = await AuthUser.findById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        mailid: user.mailid,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}
