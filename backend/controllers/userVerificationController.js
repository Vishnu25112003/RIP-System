const { User } = require("../models/userVerificationModel")
const { AuthUser } = require("../models/authModel")
const bcrypt = require("bcryptjs")

// Register a new user (auto-approved)
exports.registerUser = async (req, res) => {
  try {
    console.log("Received registration data:", req.body)

    const { name, fathername, mailid, password, gender, phone, dob, education, address } = req.body

    // Validate required fields
    if (!name || !mailid || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" })
    }

    // Validate gender enum
    const validGenders = ["Male", "Female", "Other"]
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({ message: `Gender must be one of: ${validGenders.join(", ")}` })
    }

    const existingUser = await User.findOne({ mailid })
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" })
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in verification collection
    const newUser = new User({
      name,
      fathername: fathername || "Not provided",
      mailid,
      password: hashedPassword,
      gender: gender || "Other",
      phone: phone || "0000000000",
      dob: dob ? new Date(dob) : new Date("2000-01-01"),
      education: education || [],
      address: address || [],
      status: "Active", // Auto-active
      verified: true, // Auto-verified
    })

    await newUser.save()

    // Automatically create entry in AuthUser collection
    const authUser = new AuthUser({
      name: newUser.name,
      mailid: newUser.mailid,
      password: hashedPassword,
      role: "User",
      originalUserId: newUser._id,
    })

    await authUser.save()

    res.status(201).json({
      message: "User registered successfully and can now login",
      user: newUser,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get all users with pending status (legacy - now returns empty for compatibility)
exports.getPendingUsers = async (req, res) => {
  try {
    // Since we auto-approve, return empty array
    res.status(200).json([])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get all users (for admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update user status (legacy - for compatibility)
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body
    const updatedUser = await User.findByIdAndUpdate(userId, { status }, { new: true })
    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Update user status error:", error)
    res.status(500).json({ error: error.message })
  }
}

// View user details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: "User not found" })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update user details
exports.updateUserDetails = async (req, res) => {
  try {
    const { userId } = req.params
    const updateData = req.body

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12)
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
    if (!updatedUser) return res.status(404).json({ message: "User not found" })

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params
    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) return res.status(404).json({ message: "User not found" })

    // Also delete from AuthUser collection if exists
    await AuthUser.findOneAndDelete({ originalUserId: userId })

    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ error: error.message })
  }
}
