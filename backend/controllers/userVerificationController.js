const { User } = require("../models/userVerificationModel")
const bcrypt = require("bcryptjs")

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    console.log("Received registration data:", req.body) // Debug log

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

    const newUser = new User({
      name,
      fathername: fathername || "Not provided",
      mailid,
      password: hashedPassword,
      gender: gender || "Other", // Use provided gender or default to "Other"
      phone: phone || "0000000000",
      dob: dob ? new Date(dob) : new Date("2000-01-01"),
      education: education || [],
      address: address || [],
      status: "Pending", // Ensure status is set to Pending
    })

    console.log("Creating user with data:", {
      name: newUser.name,
      gender: newUser.gender,
      status: newUser.status,
    }) // Debug log

    await newUser.save()
    res.status(201).json({ message: "User registered successfully", user: newUser })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: error.message })
  }
}

// Get all users with pending status
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: "Pending" })
    res.status(200).json(users)
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

// Approve or reject user
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body
    const updatedUser = await User.findByIdAndUpdate(userId, { status }, { new: true })

    // If user is approved, also create entry in AuthUser collection
    if (status === "Approved") {
      const { AuthUser } = require("../models/authModel")

      // Check if user already exists in auth collection
      const existingAuthUser = await AuthUser.findOne({ mailid: updatedUser.mailid })
      if (!existingAuthUser) {
        const authUser = new AuthUser({
          name: updatedUser.name,
          mailid: updatedUser.mailid,
          password: updatedUser.password, // Already hashed
          role: "User",
          originalUserId: updatedUser._id,
        })
        await authUser.save()
        console.log("Created AuthUser for approved user:", updatedUser.mailid)
      }
    }

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
    const { AuthUser } = require("../models/authModel")
    await AuthUser.findOneAndDelete({ originalUserId: userId })

    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ error: error.message })
  }
}
