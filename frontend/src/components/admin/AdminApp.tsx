"use client"

import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import { Sidebar } from "./Components/Sidebar"
import Navbar from "./Components/Navbar"

// Import your actual components
import Dashboard from "./pages/Dashboard"
import UserVerification from "./pages/UserVerification"
import RegisteredUsers from "./pages/RegisteredUsers"
import InternshipManager from "./pages/InternshipManager"
import ApplicationManager from "./pages/ApplicationManager"
import CertificateManager from "./pages/CertificateManager"
import Settings from "./pages/Settings"

function AdminApp() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex flex-col w-full transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        {/* Navbar always at the top */}
        <Navbar />

        {/* Main content below the Navbar */}
        <main className="bg-dashboardbg text-white min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserVerification />} />
            <Route path="/courses" element={<RegisteredUsers />} />
            <Route path="/internships" element={<InternshipManager />} />
            <Route path="/activities" element={<ApplicationManager />} />
            <Route path="/certificates" element={<CertificateManager />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AdminApp
