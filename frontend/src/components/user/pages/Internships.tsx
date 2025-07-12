"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  MapPin,
  Star,
  Users,
  Award,
  ChevronRight,
  X,
  Calendar,
  BookOpen,
  Target,
  Zap,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle,
  AlertCircle,
  Send,
  RefreshCw,
  GraduationCap,
  Trophy,
} from "lucide-react"
import { useAuth } from "../../../context/authContext"

interface Internship {
  _id: string
  coursename: string
  field: string
  description: string
  duration: string
  status: "Active" | "Inactive"
  image?: string
  createdAt: string
}

interface UserApplication {
  _id: string
  status: "Pending" | "Approved" | "Rejected"
  courseSelection: string
  learningPreference: string
  technicalSkills: string[]
  hasApplication: boolean
  appliedAt?: string
  approvedAt?: string
  adminFeedback?: string
}

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

interface UserProfile {
  _id: string
  name: string
  fathername: string
  mailid: string
  phone: string
  dob: string
  gender: "Male" | "Female" | "Other"
  education: Education[]
  address: Address[]
}

const Internships: React.FC = () => {
  const { user } = useAuth()
  const [internships, setInternships] = useState<Internship[]>([])
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [userApplication, setUserApplication] = useState<UserApplication | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState("All")
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [enrollFormData, setEnrollFormData] = useState({
    courseSelection: "",
    learningPreference: "",
    technicalSkills: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)

  const availableSkills = [
    "JavaScript",
    "Python",
    "Java",
    "React",
    "Node.js",
    "HTML/CSS",
    "SQL",
    "MongoDB",
    "Git",
    "AWS",
    "Docker",
    "Machine Learning",
    "Data Analysis",
    "UI/UX Design",
    "Project Management",
    "Communication",
  ]

  const fetchInternships = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/internships")
      const data = await response.json()
      const activeInternships = data.filter((internship: Internship) => internship.status === "Active")
      setInternships(activeInternships)
    } catch (error) {
      console.error("Error fetching internships:", error)
    }
  }

  // Debug function to check user data directly
  const fetchDebugData = async () => {
    if (!user?.mailid) return

    try {
      console.log("=== FETCHING DEBUG DATA ===")
      const response = await fetch(`http://localhost:5000/debug/user/${encodeURIComponent(user.mailid)}`)
      const data = await response.json()
      console.log("Debug data received:", data)

      // If we have applications in debug data, use the latest one
      if (data.applications && data.applications.length > 0) {
        const latestApp = data.applications[0] // Already sorted by createdAt desc
        console.log("Setting application from debug data:", latestApp)

        const applicationData: UserApplication = {
          _id: latestApp.id,
          status: latestApp.status,
          courseSelection: latestApp.courseSelection,
          learningPreference: latestApp.learningPreference,
          technicalSkills: latestApp.technicalSkills || [],
          hasApplication: true,
          appliedAt: latestApp.createdAt,
          approvedAt: latestApp.approvedAt,
          adminFeedback: latestApp.adminFeedback,
        }

        setUserApplication(applicationData)
      }
    } catch (error) {
      console.error("Error fetching debug data:", error)
    }
  }

  // ENHANCED: Function to fetch user application status with multiple fallbacks
  const fetchUserApplication = async () => {
    if (!user?.id && !user?.mailid) {
      console.log("No user ID or email available")
      return
    }

    try {
      console.log("=== FETCHING APPLICATION STATUS ===")
      console.log("User ID:", user.id)
      console.log("User Email:", user.mailid)
      console.log("User Profile ID:", userProfile?._id)

      let response
      let method = "unknown"
      let success = false

      // Try method 1: Use user.id if available
      if (user.id && !success) {
        try {
          console.log("Trying method 1: user.id")
          response = await fetch(`http://localhost:5000/api/applications/user/${user.id}`)
          method = "user.id"
          console.log("Method 1 response status:", response.status)
          if (response.ok) success = true
        } catch (e) {
          console.log("Method 1 failed:", e)
        }
      }

      // Try method 2: Use userProfile._id if method 1 failed
      if (!success && userProfile?._id) {
        try {
          console.log("Trying method 2: userProfile._id")
          response = await fetch(`http://localhost:5000/api/applications/user/${userProfile._id}`)
          method = "userProfile._id"
          console.log("Method 2 response status:", response.status)
          if (response.ok) success = true
        } catch (e) {
          console.log("Method 2 failed:", e)
        }
      }

      // Try method 3: Use email as backup
      if (!success && user.mailid) {
        try {
          console.log("Trying method 3: email")
          response = await fetch(`http://localhost:5000/api/applications/email/${encodeURIComponent(user.mailid)}`)
          method = "email"
          console.log("Method 3 response status:", response.status)
          if (response.ok) success = true
        } catch (e) {
          console.log("Method 3 failed:", e)
        }
      }

      if (success && response) {
        const data = await response.json()
        console.log("=== APPLICATION DATA RECEIVED ===")
        console.log("Method used:", method)
        console.log("Full response:", data)

        // Check for hasApplication field OR if we have application data directly
        if (data.hasApplication === true || (data.status && data.courseSelection)) {
          const applicationData: UserApplication = {
            _id: data._id || "",
            status: data.status,
            courseSelection: data.courseSelection,
            learningPreference: data.learningPreference,
            technicalSkills: data.technicalSkills || [],
            hasApplication: true,
            appliedAt: data.appliedAt,
            approvedAt: data.approvedAt,
            adminFeedback: data.adminFeedback,
          }

          console.log("✅ Setting application data:", applicationData)
          setUserApplication(applicationData)
        } else {
          console.log("❌ No application found in response")
          setUserApplication(null)
        }
      } else {
        console.log("❌ All fetch methods failed")
        console.log("Final response status:", response?.status)

        // Fallback: Try debug endpoint
        console.log("🔧 Trying debug endpoint as fallback...")
        await fetchDebugData()
      }
    } catch (error) {
      console.error("Error fetching user application:", error)
      // Fallback: Try debug endpoint
      console.log("🔧 Trying debug endpoint due to error...")
      await fetchDebugData()
    }
  }

  const fetchUserProfile = async () => {
    if (!user?.mailid) return

    try {
      const response = await fetch("http://localhost:5000/api/userverification/all-users")
      const allUsers = await response.json()
      const profile = allUsers.find((u: UserProfile) => u.mailid === user.mailid)
      if (profile) {
        setUserProfile(profile)
        console.log("User profile loaded:", profile._id)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  // Refresh application status
  const refreshApplicationStatus = async () => {
    console.log("=== REFRESHING APPLICATION STATUS ===")
    setRefreshing(true)
    await fetchUserApplication()
    setRefreshing(false)
    console.log("=== REFRESH COMPLETE ===")
  }

  useEffect(() => {
    const loadData = async () => {
      console.log("=== INITIAL DATA LOAD ===")
      // Load profile first, then application (since we might need profile._id)
      await fetchInternships()
      await fetchUserProfile()
      // Wait a bit for userProfile to be set, then fetch application
      setTimeout(async () => {
        await fetchUserApplication()
        setLoading(false)
        console.log("=== INITIAL LOAD COMPLETE ===")
      }, 100)
    }
    loadData()
  }, [user])

  // Refetch application when userProfile is loaded
  useEffect(() => {
    if (userProfile && !userApplication) {
      console.log("UserProfile loaded, refetching application...")
      fetchUserApplication()
    }
  }, [userProfile])

  // FIXED: Only match the exact course the user applied for
  const canAccessDashboard = (courseName: string) => {
    console.log("=== DASHBOARD ACCESS CHECK ===")
    console.log("Course Name:", courseName)
    console.log("User Application:", userApplication)

    if (!userApplication) {
      console.log("❌ No user application object")
      return false
    }

    if (!userApplication.hasApplication) {
      console.log("❌ hasApplication is false")
      return false
    }

    console.log("Application Status:", userApplication.status)

    if (userApplication.status !== "Approved") {
      console.log("❌ Application not approved, status:", userApplication.status)
      return false
    }

    // FIXED: Exact course name matching only
    const appliedCourse = userApplication.courseSelection?.trim() || ""
    const checkingCourse = courseName?.trim() || ""

    console.log("Exact Course Match Check:")
    console.log("- Applied for:", `"${appliedCourse}"`)
    console.log("- Checking:", `"${checkingCourse}"`)

    // Only allow exact match (case-insensitive)
    const courseMatches = appliedCourse.toLowerCase() === checkingCourse.toLowerCase()

    console.log("- Exact Match Result:", courseMatches)

    if (courseMatches) {
      console.log("✅ DASHBOARD ACCESS GRANTED!")
    } else {
      console.log("❌ Course doesn't match application exactly")
    }

    return courseMatches
  }

  const handleGoToDashboard = () => {
    console.log("Navigating to dashboard...")
    window.location.href = "/user/daily-tasks"
  }

  const handleSkillToggle = (skill: string) => {
    setEnrollFormData((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.includes(skill)
        ? prev.technicalSkills.filter((s) => s !== skill)
        : [...prev.technicalSkills, skill],
    }))
  }

  const validateEnrollForm = () => {
    if (!enrollFormData.courseSelection) {
      alert("Please select a course")
      return false
    }
    if (!enrollFormData.learningPreference) {
      alert("Please select a learning preference")
      return false
    }
    if (enrollFormData.technicalSkills.length === 0) {
      alert("Please select at least one technical skill")
      return false
    }
    return true
  }

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEnrollForm() || !userProfile) return

    setSubmitting(true)
    try {
      const applicationData = {
        userId: userProfile._id,
        courseSelection: enrollFormData.courseSelection,
        learningPreference: enrollFormData.learningPreference,
        technicalSkills: enrollFormData.technicalSkills,
      }

      console.log("Submitting application:", applicationData)

      const response = await fetch("http://localhost:5000/api/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      if (response.ok) {
        alert("Application submitted successfully! We'll review it and get back to you soon.")
        setShowEnrollForm(false)
        setEnrollFormData({
          courseSelection: "",
          learningPreference: "",
          technicalSkills: [],
        })
        // Refresh application status after submission
        await refreshApplicationStatus()
      } else {
        const errorData = await response.json()
        alert(errorData.message || "Failed to submit application")
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      alert("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredInternships = internships.filter((internship) =>
    filter === "All" ? true : internship.field === filter,
  )

  const uniqueFields = ["All", ...Array.from(new Set(internships.map((i) => i.field)))]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
      },
    },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Dream Internship
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Join thousands of students who've launched their careers with our premium internship programs
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>500+ Companies</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* IMPROVED: Application Status Banner */}
      {userApplication && userApplication.hasApplication && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl shadow-lg ${
              userApplication.status === "Approved"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                : userApplication.status === "Pending"
                  ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200"
                  : "bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200"
            }`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-current rounded-full transform translate-x-16 -translate-y-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full transform -translate-x-12 translate-y-12" />
            </div>

            <div className="relative p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Status Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`p-2 rounded-full ${
                        userApplication.status === "Approved"
                          ? "bg-green-100"
                          : userApplication.status === "Pending"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                      }`}
                    >
                      {userApplication.status === "Approved" ? (
                        <Trophy className="w-6 h-6 text-green-600" />
                      ) : userApplication.status === "Pending" ? (
                        <Clock className="w-6 h-6 text-yellow-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold ${
                          userApplication.status === "Approved"
                            ? "text-green-800"
                            : userApplication.status === "Pending"
                              ? "text-yellow-800"
                              : "text-red-800"
                        }`}
                      >
                        Application Status: {userApplication.status}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <GraduationCap className="w-4 h-4 text-gray-600" />
                        <p className="text-gray-700 font-medium">
                          Course Applied: <span className="font-bold">"{userApplication.courseSelection}"</span>
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={refreshApplicationStatus}
                          disabled={refreshing}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"
                          title="Refresh status"
                        >
                          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="mb-4">
                    <p
                      className={`text-lg leading-relaxed ${
                        userApplication.status === "Approved"
                          ? "text-green-700"
                          : userApplication.status === "Pending"
                            ? "text-yellow-700"
                            : "text-red-700"
                      }`}
                    >
                      {userApplication.status === "Approved"
                        ? "🎉 Congratulations! Your application has been approved. You can now access the dashboard for your enrolled course."
                        : userApplication.status === "Pending"
                          ? "⏳ Your application is under review. We'll notify you once it's processed."
                          : "❌ Your application was not approved. Please contact support for more information."}
                    </p>
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {userApplication.appliedAt && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Applied: {new Date(userApplication.appliedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {userApplication.approvedAt && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Approved: {new Date(userApplication.approvedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Admin Feedback */}
                  {userApplication.adminFeedback && (
                    <div className="mt-4 p-4 bg-white/50 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Admin Feedback:
                      </h4>
                      <p className="text-gray-700">{userApplication.adminFeedback}</p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {userApplication.status === "Approved" && (
                  <div className="ml-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGoToDashboard}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3"
                    >
                      <GraduationCap className="w-6 h-6" />
                      <span>Access Dashboard</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-4 justify-center mb-8"
        >
          {uniqueFields.map((field) => (
            <button
              key={field}
              onClick={() => setFilter(field)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                filter === field
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
              }`}
            >
              {field}
            </button>
          ))}
        </motion.div>

        {/* Internships Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredInternships.map((internship) => (
            <motion.div
              key={internship._id}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group"
              onClick={() => setSelectedInternship(internship)}
            >
              <div className="relative h-48 overflow-hidden">
                {internship.image ? (
                  <img
                    src={`http://localhost:5000/uploads/${internship.image}`}
                    alt={internship.coursename}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {internship.status}
                  </span>
                </div>
                {/* Dashboard Access Indicator - Only for exact course match */}
                {canAccessDashboard(internship.coursename) && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Enrolled</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                    {internship.field}
                  </span>
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{internship.duration} months</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {internship.coursename}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{internship.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">Remote</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredInternships.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">No internships found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later for new opportunities.</p>
          </motion.div>
        )}
      </div>

      {/* Enrollment Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Take the next step and enroll in our comprehensive internship program
          </p>

          {!userApplication || !userApplication.hasApplication ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEnrollForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <Send className="w-6 h-6" />
              <span>Enroll Now</span>
            </motion.button>
          ) : (
            <div className="flex items-center justify-center space-x-2 text-lg">
              {userApplication.status === "Approved" ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-600 font-semibold">You're already enrolled!</span>
                </>
              ) : userApplication.status === "Pending" ? (
                <>
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                  <span className="text-yellow-600 font-semibold">Application submitted - Under review</span>
                </>
              ) : (
                <>
                  <X className="w-6 h-6 text-red-600" />
                  <span className="text-red-600 font-semibold">Application not approved - Contact support</span>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Enrollment Form Modal - With Tailwind Scrollbar */}
      <AnimatePresence>
        {showEnrollForm && userProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEnrollForm(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Internship Enrollment</h2>
                  <button onClick={() => setShowEnrollForm(false)} className="text-gray-400 hover:text-gray-600 p-2">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleEnrollSubmit} className="space-y-6">
                  {/* Course Selection */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Course Selection *</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {internships.map((internship) => (
                        <label
                          key={internship._id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            enrollFormData.courseSelection === internship.coursename
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="courseSelection"
                            value={internship.coursename}
                            checked={enrollFormData.courseSelection === internship.coursename}
                            onChange={(e) =>
                              setEnrollFormData((prev) => ({ ...prev, courseSelection: e.target.value }))
                            }
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                enrollFormData.courseSelection === internship.coursename
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {enrollFormData.courseSelection === internship.coursename && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{internship.coursename}</p>
                              <p className="text-sm text-gray-600">
                                {internship.field} - {internship.duration} months
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Learning Preference */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Preference *</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {["Self-learning", "Guided learning", "Hybrid"].map((preference) => (
                        <label
                          key={preference}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            enrollFormData.learningPreference === preference
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="learningPreference"
                            value={preference}
                            checked={enrollFormData.learningPreference === preference}
                            onChange={(e) =>
                              setEnrollFormData((prev) => ({ ...prev, learningPreference: e.target.value }))
                            }
                            className="sr-only"
                          />
                          <div className="text-center">
                            <div
                              className={`w-6 h-6 rounded-full border-2 mx-auto mb-2 ${
                                enrollFormData.learningPreference === preference
                                  ? "border-purple-500 bg-purple-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {enrollFormData.learningPreference === preference && (
                                <div className="w-3 h-3 bg-white rounded-full mx-auto mt-0.5" />
                              )}
                            </div>
                            <p className="font-semibold text-gray-900">{preference}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Technical Skills */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Technical Skills * (Select all that apply)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {availableSkills.map((skill) => (
                        <label
                          key={skill}
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            enrollFormData.technicalSkills.includes(skill)
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={enrollFormData.technicalSkills.includes(skill)}
                            onChange={() => handleSkillToggle(skill)}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-4 h-4 border-2 rounded ${
                                enrollFormData.technicalSkills.includes(skill)
                                  ? "border-green-500 bg-green-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {enrollFormData.technicalSkills.includes(skill) && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{skill}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowEnrollForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                      <span>{submitting ? "Submitting..." : "Submit Application"}</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Modal - With Tailwind Scrollbar */}
      <AnimatePresence>
        {selectedInternship && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInternship(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* Header Image */}
                <div className="relative h-64 overflow-hidden rounded-t-2xl">
                  {selectedInternship.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${selectedInternship.image}`}
                      alt={selectedInternship.coursename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <button
                    onClick={() => setSelectedInternship(null)}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold mb-2 inline-block">
                      {selectedInternship.field}
                    </span>
                    <h2 className="text-3xl font-bold">{selectedInternship.coursename}</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                      <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                          <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
                          Course Overview
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-lg">{selectedInternship.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-blue-50 p-6 rounded-xl">
                          <div className="flex items-center mb-3">
                            <Clock className="w-6 h-6 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-gray-900">Duration</h4>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">{selectedInternship.duration} Months</p>
                          <p className="text-gray-600 text-sm">Full-time commitment</p>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-xl">
                          <div className="flex items-center mb-3">
                            <MapPin className="w-6 h-6 text-purple-600 mr-2" />
                            <h4 className="font-semibold text-gray-900">Location</h4>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">Remote</p>
                          <p className="text-gray-600 text-sm">Work from anywhere</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Zap className="w-5 h-5 text-green-600 mr-2" />
                          What You'll Gain
                        </h4>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                            Real-world project experience
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                            Industry mentorship and guidance
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                            Professional network expansion
                          </li>
                          <li className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                            Completion certificate
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                      <div className="bg-gray-50 p-6 rounded-xl mb-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                          Quick Info
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Field:</span>
                            <span className="font-semibold">{selectedInternship.field}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="text-green-600 font-semibold">{selectedInternship.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <span className="font-semibold">Remote</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Level:</span>
                            <span className="font-semibold">Beginner</span>
                          </div>
                        </div>
                      </div>

                      {/* FIXED: Dashboard Button - Only exact course match */}
                      {canAccessDashboard(selectedInternship.coursename) ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGoToDashboard}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          <span>Access Dashboard</span>
                          <ArrowRight className="w-5 h-5" />
                        </motion.button>
                      ) : (
                        <div className="w-full bg-gray-300 text-gray-500 py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center space-x-2 cursor-not-allowed">
                          <Lock className="w-5 h-5" />
                          <span>Dashboard Locked</span>
                        </div>
                      )}

                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                          {canAccessDashboard(selectedInternship.coursename)
                            ? "🎉 Access granted! Welcome to your dashboard"
                            : userApplication && userApplication.hasApplication
                              ? userApplication.status === "Pending"
                                ? "⏳ Application under review"
                                : userApplication.status === "Rejected"
                                  ? "❌ Application not approved for this course"
                                  : "📋 Application status: " + userApplication.status
                              : "📝 Submit an application to unlock dashboard access"}
                        </p>
                      </div>
                    </div>
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

export default Internships
