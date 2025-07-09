"use client"

import { FiUser, FiLogOut } from "react-icons/fi"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../../context/authContext"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/auth/login")
  }

  return (
    <>
      <nav className="bg-dashboardbg text-white px-6 py-4 flex justify-between items-center shadow-md border-gray-700">
        {/* Panel Logo/Title */}
        <div className="font-bold tracking-wide text-neonPink ml-10 text-3xl">
          Welcome Back, {user?.name || "Admin"}
        </div>

        {/* Right Side: Profile + Logout */}
        <div className="flex items-center gap-4">
          {/* Profile section wrapped in Link */}
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
          >
            <FiUser className="text-xl text-neonBlue" />
            <span className="text-sm font-medium hidden sm:inline">{user?.name || "Admin"}</span>
          </Link>

          {/* Logout Button */}
          <button onClick={handleLogout} title="Logout" className="text-red-400 hover:text-red-500 transition text-xl">
            <FiLogOut />
          </button>
        </div>
      </nav>
      <hr className="border-gray-700" />
    </>
  )
}

export default Navbar
