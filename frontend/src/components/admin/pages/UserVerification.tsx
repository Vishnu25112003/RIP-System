"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { FaCheck, FaTimes, FaEye } from "react-icons/fa"

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
  education: Education[]
  address: Address[]
  status: "Pending" | "Approved" | "Rejected"
}

const UserVerificationPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/userverification/pending-users")
      if (!res.ok) throw new Error("Failed to fetch users")
      const data = await res.json()
      setUsers(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
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

      fetchPendingUsers()
      setSelectedUser(null)
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`)
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  if (loading) return <div className="text-center p-4">Loading users...</div>
  if (error) return <div className="text-center text-red-500 p-4">Error: {error}</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Verification</h2>

      {/* ✅ Rounded Table */}
      <div className="overflow-x-auto shadow-md rounded-xl border border-gray-300">
        <table className="w-full text-sm text-white bg-cardbg rounded-xl overflow-hidden">
          <thead className="bg-chart-currentclients text-white uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3">Name</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Phone</th>
              <th className="text-center px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, i) => (
                <tr
                  key={user._id}
                  className={`hover:bg-neonpurple transition ${i === users.length - 1 ? "rounded-b-xl" : ""}`}
                >
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.mailid}</td>
                  <td className="px-6 py-4">{user.phone}</td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => updateUserStatus(user._id, "Approved")}
                      className="inline-flex items-center gap-2 border border-green-400 bg-green-100 text-green-800 font-semibold py-1.5 px-4 rounded-xl shadow-sm hover:bg-green-200 transition"
                    >
                      <FaCheck /> Approve
                    </button>
                    <button
                      onClick={() => updateUserStatus(user._id, "Rejected")}
                      className="inline-flex items-center gap-2 border border-red-400 bg-red-100 text-red-800 font-semibold py-1.5 px-4 rounded-xl shadow-sm hover:bg-red-200 transition"
                    >
                      <FaTimes /> Reject
                    </button>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center gap-2 border border-blue-400 bg-blue-100 text-blue-800 font-semibold py-1.5 px-4 rounded-xl shadow-sm hover:bg-blue-200 transition"
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center px-6 py-4">
                  No pending users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Professional Modal Popup */}
      {selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-cardbg w-full max-w-2xl p-6 rounded-2xl shadow-lg relative">
            <button
              className="absolute top-2 right-4 text-gray-500 hover:text-black text-xl font-bold"
              onClick={() => setSelectedUser(null)}
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-4 border-b pb-2">User Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <span className="font-semibold">Name:</span> {selectedUser.name}
                </p>
                <p>
                  <span className="font-semibold">Father's Name:</span> {selectedUser.fathername}
                </p>
                <p>
                  <span className="font-semibold">DOB:</span> {new Date(selectedUser.dob).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Email:</span> {selectedUser.mailid}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {selectedUser.phone}
                </p>
              </div>

              <div className="col-span-2 mt-2">
                <h4 className="text-lg font-semibold mb-1">Education</h4>
                {selectedUser.education.map((edu, idx) => (
                  <div key={idx} className="ml-2 border-l pl-4 mb-2">
                    <p>
                      <strong>Course:</strong> {edu.course}
                    </p>
                    <p>
                      <strong>University:</strong> {edu.university}
                    </p>
                    <p>
                      <strong>Percentage:</strong> {edu.percentage}%
                    </p>
                  </div>
                ))}
              </div>

              <div className="col-span-2">
                <h4 className="text-lg font-semibold mb-1">Address</h4>
                {selectedUser.address.map((addr, idx) => (
                  <div key={idx} className="ml-2 border-l pl-4 mb-2">
                    <p>
                      {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => updateUserStatus(selectedUser._id, "Approved")}
                className="inline-flex items-center gap-2 border border-green-400 bg-green-100 text-green-800 font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-green-200 transition"
              >
                <FaCheck /> Approve
              </button>
              <button
                onClick={() => updateUserStatus(selectedUser._id, "Rejected")}
                className="inline-flex items-center gap-2 border border-red-400 bg-red-100 text-red-800 font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-red-200 transition"
              >
                <FaTimes /> Reject
              </button>
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-4 py-2 rounded-xl shadow-sm transition"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserVerificationPage
