// pages/UserApp.tsx
import type React from "react"
import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

// Import your actual page components
import Homepage from "./pages/Intropage/HomePage"
import AvailableDomain from "./pages/Intropage/AvailableDomains"
import WorkFlow from "./pages/Intropage/WorkFlow"
import AboutUs from "./pages/Intropage/AboutUs"
import Internships from "./pages/InternMain" 
import Profile from "./pages/Profile"
import DailyTasks from "./pages/DailytaskMain"

const UserApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Homepage />
              <AvailableDomain />
              <WorkFlow />
              <AboutUs />
              <Footer />
            </>
          }
        />
        <Route
          path="/home"
          element={
            <>
              <Homepage />
              <AvailableDomain />
              <WorkFlow />
              <AboutUs />
              <Footer />
            </>
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/internships" element={<Internships />} />
        <Route path="/daily-tasks" element={<DailyTasks />} />
      </Routes>
    </div>
  )
}

export default UserApp
