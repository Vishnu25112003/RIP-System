"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaClipboardList,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaBrain,
  FaCalendarAlt,
  FaCode,
  FaCheck,
  FaTimes,
  FaEye,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaUsers,
  FaUserGraduate,
  FaPhone,
  FaIdCard,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBug, // Add debug icon
} from "react-icons/fa"

// Individual Application Interface
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

// Organization Interfaces
interface Student {
  _id: string
  name: string
  email: string
  mobile: string
  registerNumber: string
  courseSelection: string
  status: "Pending" | "Approved" | "Rejected"
  approvedAt?: string
  rejectedAt?: string
}

interface Organization {
  _id: string
  orgName: string
  orgEmail: string
  orgContactPerson: string
  studentCount: number
  submittedAt: string
}

interface OrganizationDetails {
  _id: string
  orgName: string
  orgEmail: string
  orgContactPerson: string
  submittedAt: string
}

const ApplicationManagerMerged: React.FC = () => {
  // View mode state
  const [viewMode, setViewMode] = useState<"individual" | "organization">("individual")

  // Individual Applications State
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [statusFilter, setStatusFilter] = useState("All")
  const [feedbackText, setFeedbackText] = useState("")

  // Organization State
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<OrganizationDetails | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentsLoading, setStudentsLoading] = useState(false)

  // Common State
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Individual Applications Functions
  const fetchApplications = async () => {
    try {
      setLoading(true)
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

  // Organization Functions
  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      console.log("Fetching organizations...")
      const response = await fetch("http://localhost:5000/api/admin/organization/requests")
      if (!response.ok) throw new Error("Failed to fetch organizations")
      const data = await response.json()
      console.log("Organizations fetched:", data)
      setOrganizations(data)
      setLoading(false)
    } catch (err: any) {
      console.error("Error fetching organizations:", err)
      setError(err.message)
      setLoading(false)
    }
  }

  // Debug function to check database contents
  const fetchDebugInfo = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/organization/debug/collections")
      if (response.ok) {
        const data = await response.json()
        setDebugInfo(data)
        console.log("Debug info:", data)
      }
    } catch (err) {
      console.error("Debug fetch error:", err)
    }
  }

  const fetchOrganizationStudents = async (orgId: string) => {
    try {
      setStudentsLoading(true)
      const response = await fetch(`http://localhost:5000/api/admin/organization/${orgId}/students`)
      if (!response.ok) throw new Error("Failed to fetch students")
      const data = await response.json()
      setSelectedOrg(data.organization)
      setStudents(data.students)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setStudentsLoading(false)
    }
  }

  const approveStudent = async (studentId: string) => {
    if (!selectedOrg) return

    try {
      const response = await fetch(`http://localhost:5000/api/admin/organization/student/${studentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: selectedOrg._id }),
      })

      if (!response.ok) throw new Error("Failed to approve student")

      await fetchOrganizationStudents(selectedOrg._id)
      alert("Student approved successfully!")
    } catch (err: any) {
      alert(`Error approving student: ${err.message}`)
    }
  }

  const bulkApproveStudents = async () => {
    if (!selectedOrg) return

    const pendingCount = students.filter((s) => s.status === "Pending" || !s.status).length
    if (pendingCount === 0) {
      alert("No pending students to approve")
      return
    }

    if (!confirm(`Are you sure you want to approve all ${pendingCount} pending students?`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/organization/${selectedOrg._id}/approve-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to bulk approve students")

      const result = await response.json()
      alert(result.message)

      await fetchOrganizationStudents(selectedOrg._id)
    } catch (err: any) {
      alert(`Error in bulk approval: ${err.message}`)
    }
  }

  // Effect to fetch data based on view mode
  useEffect(() => {
    if (viewMode === "individual") {
      fetchApplications()
    } else {
      fetchOrganizations()
      fetchDebugInfo() // Also fetch debug info when switching to organization mode
    }
  }, [viewMode])

  // Utility Functions
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <FaCheckCircle className="text-green-500" />
      case "Rejected":
        return <FaTimesCircle className="text-red-500" />
      default:
        return <FaClock className="text-yellow-500" />
    }
  }

  const filteredApplications = applications.filter((app) =>
    statusFilter === "All" ? true : app.status === statusFilter,
  )

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          // animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Error: {error}</p>
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg text-left text-white">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <FaBug /> Debug Information
            </h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Toggle Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border-b border-gray-700 p-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Application Management</h1>

          <div className="flex items-center gap-4">
            <span className="text-gray-300 text-sm">View Mode:</span>
            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("individual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === "individual" ? "bg-blue-600 text-white shadow-md" : "text-gray-300 hover:text-white"
                }`}
              >
                <FaUser className="text-sm" />
                Individual
              </button>
              <button
                onClick={() => setViewMode("organization")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === "organization" ? "bg-purple-600 text-white shadow-md" : "text-gray-300 hover:text-white"
                }`}
              >
                <FaBuilding className="text-sm" />
                Organization
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        {viewMode === "individual" ? (
          // Individual Applications View (keeping existing code)
          <div className="text-white">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-800 to-purple-700 p-6 rounded-lg shadow mb-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <FaClipboardList className="text-neonpink" /> Individual Applications
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
          </div>
        ) : (
          // Organization View
          <div className="text-white">
            {!selectedOrg ? (
              // Organizations List View
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-800 to-blue-700 p-6 rounded-lg shadow mb-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold flex items-center gap-2">
                      <FaBuilding className="text-neonpink" /> Organization Requests
                    </h2>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{organizations.length} Organizations Found</p>
                      <p className="text-sm opacity-80">
                        {organizations.reduce((sum, org) => sum + org.studentCount, 0)} Total Students
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-x-auto shadow-md rounded-xl border border-gray-700"
                >
                  <table className="w-full text-sm text-white bg-gray-800 rounded-xl overflow-hidden">
                    <thead className="bg-gray-700 text-white uppercase tracking-wider">
                      <tr>
                        <th className="text-left px-6 py-3">Organization</th>
                        <th className="text-left px-6 py-3">Contact Person</th>
                        <th className="text-left px-6 py-3">Email</th>
                        <th className="text-left px-6 py-3">Students</th>
                        <th className="text-left px-6 py-3">Submitted</th>
                        <th className="text-center px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizations.length > 0 ? (
                        organizations.map((org, i) => (
                          <motion.tr
                            key={org._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="hover:bg-gray-700 transition border-b border-gray-600"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                  <FaBuilding />
                                </div>
                                <div>
                                  <div className="font-semibold">{org.orgName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold">{org.orgContactPerson}</td>
                            <td className="px-6 py-4 text-gray-300">{org.orgEmail}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-1 w-fit">
                                <FaUsers className="text-xs" />
                                {org.studentCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {new Date(org.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => fetchOrganizationStudents(org._id)}
                                className="inline-flex items-center gap-1 border border-blue-400 bg-blue-100 text-blue-800 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-blue-200 transition"
                              >
                                <FaEye /> View Students
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center px-6 py-8">
                            <div className="flex flex-col items-center">
                              <FaBuilding className="text-4xl text-gray-500 mb-2" />
                              <p className="text-gray-400">No organization requests found.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </motion.div>
              </>
            ) : (
              // Students List View (keeping existing code)
              <>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-800 to-blue-700 p-6 rounded-lg shadow mb-8"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold flex items-center gap-2">
                        <FaUserGraduate className="text-neonpink" /> {selectedOrg.orgName}
                      </h2>
                      <p className="text-lg opacity-90">Contact: {selectedOrg.orgContactPerson}</p>
                      <p className="text-sm opacity-80">{selectedOrg.orgEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{students.length} Students</p>
                      <p className="text-sm opacity-80">
                        {students.filter((s) => s.status === "Approved").length} Approved •{" "}
                        {students.filter((s) => s.status === "Pending" || !s.status).length} Pending •{" "}
                        {students.filter((s) => s.status === "Rejected").length} Rejected
                      </p>
                    </div>
                  </div>
                </motion.div>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => {
                      setSelectedOrg(null)
                      setStudents([])
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
                  >
                    ← Back to Organizations
                  </button>
                  <button
                    onClick={bulkApproveStudents}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
                  >
                    <FaCheck /> Bulk Approve All
                  </button>
                </div>

                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-x-auto shadow-md rounded-xl border border-gray-700"
                  >
                    <table className="w-full text-sm text-white bg-gray-800 rounded-xl overflow-hidden">
                      <thead className="bg-gray-700 text-white uppercase tracking-wider">
                        <tr>
                          <th className="text-left px-6 py-3">Student</th>
                          <th className="text-left px-6 py-3">Register No</th>
                          <th className="text-left px-6 py-3">Course</th>
                          <th className="text-left px-6 py-3">Status</th>
                          <th className="text-center px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, i) => (
                          <motion.tr
                            key={student._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-gray-700 transition border-b border-gray-600"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-semibold">{student.name}</div>
                                  <div className="text-gray-400 text-sm flex items-center gap-1">
                                    <FaEnvelope className="text-xs" />
                                    {student.email}
                                  </div>
                                  <div className="text-gray-400 text-sm flex items-center gap-1">
                                    <FaPhone className="text-xs" />
                                    {student.mobile}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1 font-mono">
                                <FaIdCard className="text-xs" />
                                {student.registerNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                {student.courseSelection}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${getStatusColor(student.status || "Pending")}`}
                              >
                                {getStatusIcon(student.status || "Pending")}
                                {student.status || "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center space-x-2">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="inline-flex items-center gap-1 border border-blue-400 bg-blue-100 text-blue-800 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-blue-200 transition"
                              >
                                <FaEye /> View
                              </button>
                              {(student.status === "Pending" || !student.status) && (
                                <button
                                  onClick={() => approveStudent(student._id)}
                                  className="inline-flex items-center gap-1 border border-green-400 bg-green-100 text-green-800 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-green-200 transition"
                                >
                                  <FaCheck /> Approve
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>

      {/* Keep existing modals... */}
      {/* Individual Application Details Modal */}
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

      {/* Student Details Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Student Details</h3>
                  <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-white text-2xl">
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-700 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FaUserGraduate className="text-blue-400" />
                      Student Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm">Full Name</label>
                        <p className="text-white font-semibold">{selectedStudent.name}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Register Number</label>
                        <p className="text-white font-semibold font-mono">{selectedStudent.registerNumber}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <p className="text-white font-semibold">{selectedStudent.email}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Mobile</label>
                        <p className="text-white font-semibold">{selectedStudent.mobile}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Course Selection</label>
                        <p className="text-white font-semibold">{selectedStudent.courseSelection}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Status</label>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${getStatusColor(selectedStudent.status)}`}
                        >
                          {getStatusIcon(selectedStudent.status)}
                          {selectedStudent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedStudent.status === "Pending" && (
                    <div className="bg-gray-700 p-6 rounded-xl">
                      <h4 className="text-lg font-semibold mb-4 text-white">Actions</h4>
                      <div className="flex gap-4">
                        <button
                          onClick={() => {
                            approveStudent(selectedStudent._id)
                            setSelectedStudent(null)
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                        >
                          <FaCheck />
                          Approve Student
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedStudent(null)}
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

export default ApplicationManagerMerged
