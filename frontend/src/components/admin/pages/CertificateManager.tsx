"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, CheckCircle, Clock, Search, Eye, Download, RefreshCw, User, BookOpen, X, FileText } from "lucide-react"

interface Certificate {
  _id: string
  userId: string
  userName: string
  userEmail: string
  courseId: string
  courseName: string
  completionDate: string
  certificateUrl: string
  status: "Generated" | "Pending" | "Issued" | "Revoked"
}

interface CertificateStatistics {
  totalCertificates: number
  generated: number
  pending: number
  issued: number
  revoked: number
}

const AdminCertificateManagement: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [statistics, setStatistics] = useState<CertificateStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All Status")
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  // Mock data for demonstration
  const mockCertificates: Certificate[] = [
    {
      _id: "cert1",
      userId: "user1",
      userName: "Yogesh Kumar",
      userEmail: "yogesh@example.com",
      courseId: "course1",
      courseName: "Full Stack Web Development",
      completionDate: "2025-06-15T10:00:00Z",
      certificateUrl: "/placeholder.svg?height=600&width=800", // Placeholder image
      status: "Issued",
    },
    {
      _id: "cert2",
      userId: "user2",
      userName: "Manoj Singh",
      userEmail: "manoj@example.com",
      courseId: "course2",
      courseName: "Data Science & AI",
      completionDate: "2025-07-01T14:30:00Z",
      certificateUrl: "/placeholder.svg?height=600&width=800",
      status: "Generated",
    },
    {
      _id: "cert3",
      userId: "user3",
      userName: "Udaya Kiran",
      userEmail: "udaya@example.com",
      courseId: "course1",
      courseName: "Full Stack Web Development",
      completionDate: "2025-07-05T09:15:00Z",
      certificateUrl: "/placeholder.svg?height=600&width=800",
      status: "Pending",
    },
    {
      _id: "cert4",
      userId: "user4",
      userName: "Vishnu M",
      userEmail: "vishnu@example.com",
      courseId: "course3",
      courseName: "Cloud Computing Fundamentals",
      completionDate: "2025-06-20T11:45:00Z",
      certificateUrl: "/placeholder.svg?height=600&width=800",
      status: "Issued",
    },
    {
      _id: "cert5",
      userId: "user5",
      userName: "Priya Sharma",
      userEmail: "priya@example.com",
      courseId: "course2",
      courseName: "Data Science & AI",
      completionDate: "2025-07-10T16:00:00Z",
      certificateUrl: "/placeholder.svg?height=600&width=800",
      status: "Generated",
    },
  ]

  const fetchData = async () => {
    setLoading(true)
    setRefreshing(true)
    // In a real application, you would fetch data from your backend API here.
    // For now, we use mock data.
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API call

    const calculatedStats: CertificateStatistics = {
      totalCertificates: mockCertificates.length,
      generated: mockCertificates.filter((c) => c.status === "Generated").length,
      pending: mockCertificates.filter((c) => c.status === "Pending").length,
      issued: mockCertificates.filter((c) => c.status === "Issued").length,
      revoked: mockCertificates.filter((c) => c.status === "Revoked").length,
    }

    setCertificates(mockCertificates)
    setStatistics(calculatedStats)
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = () => {
    fetchData()
  }

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "All Status" || cert.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Certificate["status"]) => {
    switch (status) {
      case "Issued":
        return "bg-green-900 text-green-300"
      case "Generated":
        return "bg-blue-900 text-blue-300"
      case "Pending":
        return "bg-yellow-900 text-yellow-300"
      case "Revoked":
        return "bg-red-900 text-red-300"
      default:
        return "bg-gray-700 text-gray-300"
    }
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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Certificate Management</h1>
              <p className="text-purple-100">
                {statistics ? `${statistics.totalCertificates} Total Certificates` : "Loading..."} •{" "}
                {statistics ? `${statistics.issued} Issued` : ""} •{" "}
                {statistics ? `${statistics.generated} Generated` : ""} •{" "}
                {statistics ? `${statistics.pending} Pending` : ""}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Certificates</p>
                <p className="text-xl font-bold">{statistics.totalCertificates}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Issued</p>
                <p className="text-xl font-bold text-green-400">{statistics.issued}</p>
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
                <p className="text-xl font-bold text-yellow-400">{statistics.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <X className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Revoked</p>
                <p className="text-xl font-bold text-red-400">{statistics.revoked}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by user name, email, or course..."
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
              <option value="Issued">Issued</option>
              <option value="Generated">Generated</option>
              <option value="Pending">Pending</option>
              <option value="Revoked">Revoked</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => alert("Export CSV functionality would go here!")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  USER INFO
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  COURSE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  COMPLETION DATE
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    {certificates.length === 0 ? "No certificates found" : "No certificates match your search"}
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert, index) => (
                  <motion.tr
                    key={cert._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {cert.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{cert.userName}</div>
                          <div className="text-gray-400 text-sm">{cert.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{cert.courseName}</div>
                      <div className="text-gray-400 text-sm">ID: {cert.courseId}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {new Date(cert.completionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          cert.status,
                        )}`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCertificate(cert)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </motion.button>
                        {cert.status === "Generated" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => alert(`Issuing certificate for ${cert.userName}`)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center space-x-1 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Issue</span>
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Detail Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Certificate Details</h2>
                  <button
                    onClick={() => setSelectedCertificate(null)}
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
                          <strong>Name:</strong> {selectedCertificate.userName}
                        </p>
                        <p className="text-gray-300">
                          <strong>Email:</strong> {selectedCertificate.userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-3 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-green-400" />
                        Course Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-300">
                          <strong>Course:</strong> {selectedCertificate.courseName}
                        </p>
                        <p className="text-gray-300">
                          <strong>Completion:</strong>{" "}
                          {new Date(selectedCertificate.completionDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-300">
                          <strong>Status:</strong>
                          <span
                            className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(
                              selectedCertificate.status,
                            )}`}
                          >
                            {selectedCertificate.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <h3 className="font-semibold text-white mb-3 flex items-center justify-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-400" />
                      Certificate Preview
                    </h3>
                    {selectedCertificate.certificateUrl ? (
                      <img
                        src={selectedCertificate.certificateUrl || "/placeholder.svg"}
                        alt={`Certificate for ${selectedCertificate.userName}`}
                        className="w-full h-auto rounded-lg border border-gray-600 mt-4"
                      />
                    ) : (
                      <div className="text-gray-400 py-8">No preview available</div>
                    )}
                    <a
                      href={selectedCertificate.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Certificate</span>
                    </a>
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

export default AdminCertificateManagement
