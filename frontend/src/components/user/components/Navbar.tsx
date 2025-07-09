"use client"

import type React from "react"
import { useState } from "react"
import { Bell, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "../../../context/authContext"
import { Link, useNavigate } from "react-router-dom"

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/auth/login")
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xl">
              InternPortal
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/user/home"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/user/internships"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Internship
              </Link>
              <Link
                to="/user/profile"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Profile
              </Link>
            </div>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 hover:text-blue-600">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              <Link
                to="/user/home"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <Link
                to="/user/internships"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600"
              >
                Internship
              </Link>
              <Link
                to="/user/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600"
              >
                Profile
              </Link>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <div className="flex items-center space-x-4">
                  <button className="relative p-2 text-gray-600 hover:text-blue-600">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </button>
                  <button onClick={handleLogout} className="p-2 text-gray-600 hover:text-red-600" title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
