const mongoose = require("mongoose")

const authUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mailid: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    status: {
      type: String,
      enum: ["Approved"],
      default: "Approved",
    },
    originalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
)

const AuthUser = mongoose.model("AuthUser", authUserSchema)

module.exports = { AuthUser }
