import type React from "react"
import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

// Import your actual page components
import Homepage from "./pages/HomePage"
import AvailableDomain from "./pages/AvailableDomains"
import WorkFlow from "./pages/WorkFlow"
import AboutUs from "./pages/AboutUs"

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
        <Route path="/profile" element={<div className="p-8">User Profile Page</div>} />
        <Route path="/internships" element={<div className="p-8">User Internships Page</div>} />
      </Routes>
    </div>
  )
}

export default UserApp
