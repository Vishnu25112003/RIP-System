"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Eye,
  Download,
  RefreshCw,
  FileText,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  BarChart3,
  X,
  Calendar,
  User,
} from "lucide-react"

interface TaskSubmission {
  _id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  taskId: string
  taskName: string
  courseName: string
  courseField: string
  submittedAt: string
  dayCompleted: number
  status: string
  additionalDetails: {
    submissionDescription: string
    fileUrl: string
    status: string
    taskDescription: string
  }
}

interface TaskStatistics {
  totalSubmissions: number
  completedTasks: number
  pendingTasks: number
  uniqueUsers: number
  uniqueCourses: number
}

interface CourseSubmission {
  _id: string
  courseName: string
  courseField: string
  submissionCount: number
  completedCount: number
}

const UserActivity: React.FC = () => {
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([])
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null)
  const [courseSubmissions, setCourseSubmissions] = useState<CourseSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All Status")
  const [selectedSubmission, setSelectedSubmission] = useState<TaskSubmission | null>(null)

  // Fetch all data
  const fetchData = async () => {
    try {
      console.log("Fetching admin data...")

      const [submissionsRes, statisticsRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/task-submissions"),
        fetch("http://localhost:5000/api/admin/task-statistics"),
      ])

      console.log("Submissions response status:", submissionsRes.status)
      console.log("Statistics response status:", statisticsRes.status)

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        console.log("Submissions data:", submissionsData)
        setSubmissions(submissionsData.data || [])
      } else {
        console.error("Failed to fetch submissions:", await submissionsRes.text())
      }

      if (statisticsRes.ok) {
        const statisticsData = await statisticsRes.json()
        console.log("Statistics data:", statisticsData)
        setStatistics(statisticsData.statistics)
        setCourseSubmissions(statisticsData.submissionsByCourse || [])
      } else {
        console.error("Failed to fetch statistics:", await statisticsRes.text())
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  // Filter submissions
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.courseName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "All Status" || submission.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["User Name", "Email", "Course", "Task Name", "Day", "Submitted At", "Status"]
    const csvContent = [
      headers.join(","),
      ...filteredSubmissions.map((submission) =>
        [
          `"${submission.userName}"`,
          `"${submission.userEmail}"`,
          `"${submission.courseName}"`,
          `"${submission.taskName}"`,
          submission.dayCompleted,
          `"${new Date(submission.submittedAt).toLocaleString()}"`,
          `"${submission.status}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `task-submissions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      {/* Header Section - Matching your existing design */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">User Activity</h1>
              <p className="text-purple-100">
                {statistics ? `${statistics.totalSubmissions} Total Submissions` : "Loading..."} •{" "}
                {statistics ? `${statistics.completedTasks} Completed` : ""} •{" "}
                {statistics ? `${statistics.pendingTasks} Pending` : ""} •{" "}
                {statistics ? `${statistics.uniqueUsers} Active Users` : ""}
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Submissions</p>
                <p className="text-xl font-bold">{statistics.totalSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-xl font-bold text-green-400">{statistics.completedTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-xl font-bold text-yellow-400">{statistics.pendingTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-xl font-bold text-purple-400">{statistics.uniqueUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Courses</p>
                <p className="text-xl font-bold text-indigo-400">{statistics.uniqueCourses}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section - Matching your existing design */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="All Status">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Table - Matching your existing table design */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  USER INFO
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  TASK DETAILS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  COURSE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  SUBMITTED
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    {submissions.length === 0 ? "No task submissions found" : "No submissions match your search"}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission, index) => (
                  <motion.tr
                    key={submission._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {submission.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{submission.userName}</div>
                          <div className="text-gray-400 text-sm">{submission.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-medium truncate max-w-xs" title={submission.taskName}>
                          {submission.taskName}
                        </div>
                        <div className="text-gray-400 text-sm">Day {submission.dayCompleted}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white">{submission.courseName}</div>
                        <div className="text-gray-400 text-sm">{submission.courseField}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          submission.status === "Completed"
                            ? "bg-green-900 text-green-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSubmission(submission)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSubmission(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Submission Details</h2>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-3 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-400" />
                        User Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">
                          <strong>Name:</strong> {selectedSubmission.userName}
                        </p>
                        <p className="text-gray-300">
                          <strong>Email:</strong> {selectedSubmission.userEmail}
                        </p>
                        <p className="text-gray-300">
                          <strong>Phone:</strong> {selectedSubmission.userPhone}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-3 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-green-400" />
                        Task Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">
                          <strong>Course:</strong> {selectedSubmission.courseName}
                        </p>
                        <p className="text-gray-300">
                          <strong>Field:</strong> {selectedSubmission.courseField}
                        </p>
                        <p className="text-gray-300">
                          <strong>Day:</strong> {selectedSubmission.dayCompleted}
                        </p>
                        <p className="text-gray-300">
                          <strong>Status:</strong>
                          <span
                            className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              selectedSubmission.status === "Completed"
                                ? "bg-green-900 text-green-300"
                                : "bg-yellow-900 text-yellow-300"
                            }`}
                          >
                            {selectedSubmission.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">Task Title</h3>
                    <p className="text-gray-300">{selectedSubmission.taskName}</p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">Task Description</h3>
                    <p className="text-gray-300">{selectedSubmission.additionalDetails.taskDescription}</p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">Submission Description</h3>
                    <p className="text-gray-300">{selectedSubmission.additionalDetails.submissionDescription}</p>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3">Submitted File</h3>
                    <a
                      href={`http://localhost:5000/uploads/${selectedSubmission.additionalDetails.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Submitted File</span>
                    </a>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                      Submission Date
                    </h3>
                    <p className="text-gray-300">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserActivity
