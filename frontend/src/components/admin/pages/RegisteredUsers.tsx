"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaUsers,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserGraduate,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaVenus,
  FaMars,
  FaGenderless,
} from "react-icons/fa"

interface Education {
  course: string
  university: string
  percentage: number
}

interface Address {
  address: string
  city: string
  state: string
  pincode: number
}

interface User {
  _id: string
  name: string
  fathername: string
  mailid: string
  phone: string
  dob: string
  gender: "Male" | "Female" | "Other"
  education: Education[]
  address: Address[]
  status: "Pending" | "Approved" | "Rejected"
  createdAt: string
}

const RegisteredUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const fetchAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/userverification/all-users")
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return

    try {
      const res = await fetch(`http://localhost:5000/api/userverification/user/${userId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete user")

      fetchAllUsers()
      setSelectedUser(null)
    } catch (err: any) {
      alert(`Error deleting user: ${err.message}`)
    }
  }

  const updateUserStatus = async (userId: string, newStatus: "Approved" | "Rejected") => {
    try {
      const res = await fetch("http://localhost:5000/api/userverification/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update user status")

      fetchAllUsers()
      setSelectedUser(null)
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`)
    }
  }

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mailid.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getGenderIcon = (gender: string) => {
    switch (gender) {
      case "Male":
        return <FaMars className="text-blue-500" />
      case "Female":
        return <FaVenus className="text-pink-500" />
      default:
        return <FaGenderless className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "text-green-600 bg-green-100"
      case "Rejected":
        return "text-red-600 bg-red-100"
      default:
        return "text-yellow-600 bg-yellow-100"
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )

  if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-800 to-purple-700 p-6 rounded-lg shadow mb-8"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <FaUsers className="text-neonpink" /> Registered Users
          </h2>
          <div className="text-right">
            <p className="text-lg font-semibold">{users.length} Total Users</p>
            <p className="text-sm opacity-80">
              {users.filter((u) => u.status === "Approved").length} Approved •
              {users.filter((u) => u.status === "Pending").length} Pending •
              {users.filter((u) => u.status === "Rejected").length} Rejected
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col md:flex-row gap-4"
      >
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto shadow-md rounded-xl border border-gray-700"
      >
        <table className="w-full text-sm text-white bg-gray-800 rounded-xl overflow-hidden">
          <thead className="bg-gray-700 text-white uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3">User Info</th>
              <th className="text-left px-6 py-3">Contact</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Registered</th>
              <th className="text-center px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="hover:bg-gray-700 transition border-b border-gray-600"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {user.name}
                          {getGenderIcon(user.gender)}
                        </div>
                        <div className="text-gray-400 text-sm">{user.fathername}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <FaEnvelope className="text-gray-400" />
                        {user.mailid}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaPhone className="text-gray-400" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center gap-1 border border-blue-400 bg-blue-100 text-blue-800 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-blue-200 transition"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => setEditingUser(user)}
                      className="inline-flex items-center gap-1 border border-yellow-400 bg-yellow-100 text-yellow-800 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-yellow-200 transition"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="inline-flex items-center gap-1 border border-red-400 bg-red-100 text-red-800 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-red-200 transition"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center px-6 py-8">
                  <div className="flex flex-col items-center">
                    <FaUsers className="text-4xl text-gray-500 mb-2" />
                    <p className="text-gray-400">No users found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* View User Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">User Details</h3>
                  <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white text-2xl">
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="bg-gray-700 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaUserGraduate className="text-blue-400" />
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm">Full Name</label>
                        <p className="text-white font-semibold">{selectedUser.name}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Father's Name</label>
                        <p className="text-white font-semibold">{selectedUser.fathername}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Gender</label>
                        <p className="text-white font-semibold flex items-center gap-2">
                          {getGenderIcon(selectedUser.gender)}
                          {selectedUser.gender}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Date of Birth</label>
                        <p className="text-white font-semibold">{new Date(selectedUser.dob).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gray-700 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaPhone className="text-green-400" />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <p className="text-white font-semibold">{selectedUser.mailid}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Phone</label>
                        <p className="text-white font-semibold">{selectedUser.phone}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Status</label>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedUser.status)}`}
                        >
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="bg-gray-700 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaUserGraduate className="text-purple-400" />
                      Education
                    </h4>
                    {selectedUser.education.length > 0 ? (
                      selectedUser.education.map((edu, idx) => (
                        <div key={idx} className="mb-4 p-3 bg-gray-600 rounded-lg">
                          <p className="font-semibold text-white">{edu.course}</p>
                          <p className="text-gray-300">{edu.university}</p>
                          <p className="text-blue-400">{edu.percentage}%</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No education information provided</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="bg-gray-700 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-red-400" />
                      Address
                    </h4>
                    {selectedUser.address.length > 0 ? (
                      selectedUser.address.map((addr, idx) => (
                        <div key={idx} className="mb-4 p-3 bg-gray-600 rounded-lg">
                          <p className="text-white">{addr.address}</p>
                          <p className="text-gray-300">
                            {addr.city}, {addr.state}
                          </p>
                          <p className="text-blue-400">PIN: {addr.pincode}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No address information provided</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  {selectedUser.status === "Pending" && (
                    <>
                      <button
                        onClick={() => updateUserStatus(selectedUser._id, "Approved")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Approve User
                      </button>
                      <button
                        onClick={() => updateUserStatus(selectedUser._id, "Rejected")}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Reject User
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RegisteredUsers
