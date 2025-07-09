const { User } = require("../models/userVerificationModel")
const bcrypt = require("bcryptjs")

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, fathername, mailid, password, gender, phone, dob, education, address } = req.body

    const existingUser = await User.findOne({ mailid })
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" })
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = new User({
      name,
      fathername,
      mailid,
      password: hashedPassword, // Store hashed password
      gender,
      phone,
      dob,
      education,
      address,
    })

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
      }
    }

    res.status(200).json(updatedUser)
  } catch (error) {
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
