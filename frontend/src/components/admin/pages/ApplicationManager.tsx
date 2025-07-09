"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaClipboardList,
  FaCheck,
  FaTimes,
  FaEye,
  FaUser,
  FaEnvelope,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaBrain,
  FaCode,
  FaCalendarAlt,
} from "react-icons/fa"

interface Application {
  _id: string
  userId: {
    _id: string
    name: string
    mailid: string
  }
  userDetails: {
    name: string
    fathername: string
    mailid: string
    phone: string
    dob: string
    gender: string
    education: Array<{
      course: string
      university: string
      percentage: number
    }>
    address: Array<{
      address: string
      city: string
      state: string
      pincode: number
    }>
  }
  courseSelection: string
  learningPreference: string
  technicalSkills: string[]
  status: "Pending" | "Approved" | "Rejected"
  adminFeedback: string
  createdAt: string
}

const ApplicationManager: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [feedbackText, setFeedbackText] = useState("")

  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/applications/all")
      if (!res.ok) throw new Error("Failed to fetch applications")
      const data = await res.json()
      setApplications(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: "Approved" | "Rejected") => {
    try {
      const res = await fetch("http://localhost:5000/api/applications/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          adminFeedback: feedbackText,
        }),
      })

      if (!res.ok) throw new Error("Failed to update application status")

      fetchApplications()
      setSelectedApplication(null)
      setFeedbackText("")
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const filteredApplications = applications.filter((app) =>
    statusFilter === "All" ? true : app.status === statusFilter,
  )

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
        //   animate={{ rotate: 360 }}
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
            <FaClipboardList className="text-neonpink" /> Application Manager
          </h2>
          <div className="text-right">
            <p className="text-lg font-semibold">{applications.length} Total Applications</p>
            <p className="text-sm opacity-80">
              {applications.filter((a) => a.status === "Approved").length} Approved •{" "}
              {applications.filter((a) => a.status === "Pending").length} Pending •{" "}
              {applications.filter((a) => a.status === "Rejected").length} Rejected
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Applications</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </motion.div>

      {/* Applications Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto shadow-md rounded-xl border border-gray-700"
      >
        <table className="w-full text-sm text-white bg-gray-800 rounded-xl overflow-hidden">
          <thead className="bg-gray-700 text-white uppercase tracking-wider">
            <tr>
              <th className="text-left px-6 py-3">Applicant</th>
              <th className="text-left px-6 py-3">Course</th>
              <th className="text-left px-6 py-3">Learning Style</th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="text-left px-6 py-3">Applied Date</th>
              <th className="text-center px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application, i) => (
                <motion.tr
                  key={application._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="hover:bg-gray-700 transition border-b border-gray-600"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {application.userDetails.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{application.userDetails.name}</div>
                        <div className="text-gray-400 text-sm">{application.userDetails.mailid}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{application.courseSelection}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {application.learningPreference}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(application.status)}`}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="inline-flex items-center gap-1 border border-blue-400 bg-blue-100 text-blue-800 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-blue-200 transition"
                    >
                      <FaEye /> View
                    </button>
                    {application.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(application._id, "Approved")}
                          className="inline-flex items-center gap-1 border border-green-400 bg-green-100 text-green-800 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-green-200 transition"
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application._id, "Rejected")}
                          className="inline-flex items-center gap-1 border border-red-400 bg-red-100 text-red-800 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-red-200 transition"
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center px-6 py-8">
                  <div className="flex flex-col items-center">
                    <FaClipboardList className="text-4xl text-gray-500 mb-2" />
                    <p className="text-gray-400">No applications found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Application Details Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedApplication(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Application Details</h3>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="bg-gray-700 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaUser className="text-blue-400" />
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm">Full Name</label>
                        <p className="text-white font-semibold">{selectedApplication.userDetails.name}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Father's Name</label>
                        <p className="text-white font-semibold">{selectedApplication.userDetails.fathername}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Gender</label>
                        <p className="text-white font-semibold">{selectedApplication.userDetails.gender}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Date of Birth</label>
                        <p className="text-white font-semibold">
                          {new Date(selectedApplication.userDetails.dob).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-700 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaEnvelope className="text-green-400" />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <p className="text-white font-semibold">{selectedApplication.userDetails.mailid}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Phone</label>
                        <p className="text-white font-semibold">{selectedApplication.userDetails.phone}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Application Status</label>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedApplication.status)}`}
                        >
                          {selectedApplication.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="bg-gray-700 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaGraduationCap className="text-purple-400" />
                      Education
                    </h4>
                    {selectedApplication.userDetails.education.length > 0 ? (
                      selectedApplication.userDetails.education.map((edu, idx) => (
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
                    {selectedApplication.userDetails.address.length > 0 ? (
                      selectedApplication.userDetails.address.map((addr, idx) => (
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

                  {/* Application Details */}
                  <div className="bg-gray-700 p-6 rounded-xl lg:col-span-2">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaClipboardList className="text-yellow-400" />
                      Application Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-gray-400 text-sm flex items-center gap-2">
                          <FaGraduationCap />
                          Course Selection
                        </label>
                        <p className="text-white font-semibold text-lg">{selectedApplication.courseSelection}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm flex items-center gap-2">
                          <FaBrain />
                          Learning Preference
                        </label>
                        <p className="text-white font-semibold text-lg">{selectedApplication.learningPreference}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm flex items-center gap-2">
                          <FaCalendarAlt />
                          Applied Date
                        </label>
                        <p className="text-white font-semibold text-lg">
                          {new Date(selectedApplication.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="text-gray-400 text-sm flex items-center gap-2 mb-3">
                        <FaCode />
                        Technical Skills
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.technicalSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedApplication.status === "Pending" && (
                  <div className="mt-8 p-6 bg-gray-700 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 text-white">Admin Actions</h4>
                    <div className="mb-4">
                      <label className="block text-gray-400 text-sm mb-2">Admin Feedback (Optional)</label>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Add feedback for the applicant..."
                        className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication._id, "Approved")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <FaCheck />
                        Approve Application
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(selectedApplication._id, "Rejected")}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <FaTimes />
                        Reject Application
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition"
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

export default ApplicationManager
