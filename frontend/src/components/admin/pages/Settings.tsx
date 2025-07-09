"use client"

import type React from "react"

import { useState } from "react"

const Settings = () => {
  const [adminName, setAdminName] = useState("Admin User")
  const [email, setEmail] = useState("admin@example.com")
  const [otpEmail, setOtpEmail] = useState("smtp@example.com")
  const [darkMode, setDarkMode] = useState(true)
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Settings saved!")
  }

  return (
    <div className="max-w-10xl mx-auto text-white p-6 mt-7 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">⚙️ Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Admin Profile */}
        <div>
          <h3 className="text-lg font-medium mb-2">Admin Profile</h3>
          <input
            type="text"
            className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:outline-none"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Admin Name"
          />
          <input
            type="email"
            className="w-full mt-2 px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin Email"
          />
        </div>

        {/* OTP Email Config */}
        <div>
          <h3 className="text-lg font-medium mb-2">Email Configuration</h3>
          <input
            type="email"
            className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:outline-none"
            value={otpEmail}
            onChange={(e) => setOtpEmail(e.target.value)}
            placeholder="Email used for sending OTPs"
          />
        </div>

        {/* Theme Toggle */}
        <div>
          <h3 className="text-lg font-medium mb-2">Preferences</h3>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            <div className="w-11 h-6 bg-gray-600 rounded-full shadow-inner relative">
              <div
                className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform duration-200 ${
                  darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
            <span className="ml-3 text-sm">Dark Mode</span>
          </label>
        </div>

        {/* Change Password */}
        <div>
          <h3 className="text-lg font-medium mb-2">Security</h3>
          <input
            type="password"
            className="w-full px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Change Password"
          />
        </div>

        <div className="text-right">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-medium">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
