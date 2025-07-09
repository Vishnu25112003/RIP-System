import type React from "react"
import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

// Import your actual page components
import Homepage from "./pages/HomePage"
import AvailableDomain from "./pages/AvailableDomains"
import WorkFlow from "./pages/WorkFlow"
import AboutUs from "./pages/AboutUs"
import Internships from "./pages/Internships"
// Add this import
import Profile from "./pages/Profile"

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
        {/* Add this route */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/internships" element={<Internships />} />
      </Routes>
    </div>
  )
}

export default UserApp
