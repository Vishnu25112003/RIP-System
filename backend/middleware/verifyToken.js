const jwt = require("jsonwebtoken")
const { AuthUser } = require("../models/authModel")

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Special case for admin
    if (decoded.userId === "admin") {
      req.user = {
        id: "admin",
        role: "Admin",
        name: "Admin",
        mailid: "admin@gmail.com",
      }
      return next()
    }

    // Regular user verification
    const user = await AuthUser.findById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    req.user = {
      id: user._id,
      role: user.role,
      name: user.name,
      mailid: user.mailid,
    }

    next()
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
}

module.exports = verifyToken
