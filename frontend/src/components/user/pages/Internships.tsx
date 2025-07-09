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
  User,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Send,
  Edit3,
  Save,
  Plus,
  Trash2,
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
  const [filter, setFilter] = useState("All")
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<UserProfile | null>(null)
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

  const fetchUserApplication = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`http://localhost:5000/api/applications/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserApplication(data)
        console.log("User application:", data) // Debug log
      }
    } catch (error) {
      console.error("Error fetching user application:", error)
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
        setEditData(profile)
        console.log("User profile:", profile) // Debug log
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchInternships(), fetchUserApplication(), fetchUserProfile()])
      setLoading(false)
    }
    loadData()
  }, [user])

  // Check if user can access dashboard for a specific course
  const canAccessDashboard = (courseName: string) => {
    console.log("Checking dashboard access for:", courseName)
    console.log("User application:", userApplication)

    if (!userApplication) {
      console.log("No user application found")
      return false
    }

    if (userApplication.status !== "Approved") {
      console.log("Application not approved, status:", userApplication.status)
      return false
    }

    // Check if the course matches (case-insensitive comparison)
    const courseMatches = userApplication.courseSelection.toLowerCase() === courseName.toLowerCase()
    console.log(
      "Course matches:",
      courseMatches,
      "Applied for:",
      userApplication.courseSelection,
      "Checking:",
      courseName,
    )

    return courseMatches
  }

  const handleGoToDashboard = () => {
    window.location.href = "/user/dashboard"
  }

  const handleSkillToggle = (skill: string) => {
    setEnrollFormData((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.includes(skill)
        ? prev.technicalSkills.filter((s) => s !== skill)
        : [...prev.technicalSkills, skill],
    }))
  }

  const addEducation = () => {
    if (!editData) return
    setEditData({
      ...editData,
      education: [...editData.education, { course: "", university: "", percentage: 0 }],
    })
  }

  const removeEducation = (index: number) => {
    if (!editData || editData.education.length <= 1) return
    setEditData({
      ...editData,
      education: editData.education.filter((_, i) => i !== index),
    })
  }

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    if (!editData) return
    const updatedEducation = [...editData.education]
    updatedEducation[index] = { ...updatedEducation[index], [field]: value }
    setEditData({ ...editData, education: updatedEducation })
  }

  const addAddress = () => {
    if (!editData) return
    setEditData({
      ...editData,
      address: [...editData.address, { address: "", city: "", state: "", pincode: 0 }],
    })
  }

  const removeAddress = (index: number) => {
    if (!editData || editData.address.length <= 1) return
    setEditData({
      ...editData,
      address: editData.address.filter((_, i) => i !== index),
    })
  }

  const updateAddress = (index: number, field: keyof Address, value: string | number) => {
    if (!editData) return
    const updatedAddress = [...editData.address]
    updatedAddress[index] = { ...updatedAddress[index], [field]: value }
    setEditData({ ...editData, address: updatedAddress })
  }

  const saveProfile = async () => {
    if (!editData || !userProfile) return

    try {
      const response = await fetch(`http://localhost:5000/api/userverification/user/${userProfile._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setUserProfile(updatedProfile)
        setEditData(updatedProfile)
        setEditMode(false)
        alert("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error saving profile")
    }
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
        await fetchUserApplication()
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

      {/* Application Status Banner */}
      {userApplication && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              userApplication.status === "Approved"
                ? "bg-green-100 border border-green-300"
                : userApplication.status === "Pending"
                  ? "bg-yellow-100 border border-yellow-300"
                  : "bg-red-100 border border-red-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Application Status: {userApplication.status}</h3>
                <p className="text-sm text-gray-600">
                  Course Applied: <strong>{userApplication.courseSelection}</strong>
                </p>
                <p className="text-sm text-gray-600">
                  {userApplication.status === "Approved"
                    ? "Congratulations! Your application has been approved. You can now access the dashboard for your enrolled course."
                    : userApplication.status === "Pending"
                      ? "Your application is under review. We'll notify you once it's processed."
                      : "Your application was not approved. Please contact support for more information."}
                </p>
              </div>
              {userApplication.status === "Approved" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoToDashboard}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
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
                {/* Dashboard Access Indicator */}
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

          {!userApplication ? (
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

      {/* Enrollment Form Modal */}
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
              className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Internship Enrollment</h2>
                  <button onClick={() => setShowEnrollForm(false)} className="text-gray-400 hover:text-gray-600 p-2">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleEnrollSubmit} className="space-y-8">
                  {/* User Details Section */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Your Details
                      </h3>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setEditMode(!editMode)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        {editMode ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        <span>{editMode ? "Cancel" : "Edit"}</span>
                      </motion.button>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={editData?.name || ""}
                            onChange={(e) => setEditData(editData ? { ...editData, name: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-900">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{userProfile.name}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                        {editMode ? (
                          <input
                            type="text"
                            value={editData?.fathername || ""}
                            onChange={(e) => setEditData(editData ? { ...editData, fathername: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-900">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>{userProfile.fathername}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{userProfile.mailid}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        {editMode ? (
                          <input
                            type="tel"
                            value={editData?.phone || ""}
                            onChange={(e) => setEditData(editData ? { ...editData, phone: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-900">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{userProfile.phone}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        {editMode ? (
                          <input
                            type="date"
                            value={editData?.dob ? new Date(editData.dob).toISOString().split("T")[0] : ""}
                            onChange={(e) => setEditData(editData ? { ...editData, dob: e.target.value } : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{new Date(userProfile.dob).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        {editMode ? (
                          <select
                            value={editData?.gender || ""}
                            onChange={(e) =>
                              setEditData(
                                editData
                                  ? { ...editData, gender: e.target.value as "Male" | "Female" | "Other" }
                                  : null,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <span className="text-gray-900">{userProfile.gender}</span>
                        )}
                      </div>
                    </div>

                    {/* Education Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2 text-purple-600" />
                          Education
                        </h4>
                        {editMode && (
                          <button
                            type="button"
                            onClick={addEducation}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                      {(editMode ? editData?.education : userProfile.education)?.map((edu, index) => (
                        <div key={index} className="mb-3 p-3 bg-white rounded border">
                          {editMode ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <input
                                type="text"
                                placeholder="Course"
                                value={edu.course}
                                onChange={(e) => updateEducation(index, "course", e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                              />
                              <input
                                type="text"
                                placeholder="University"
                                value={edu.university}
                                onChange={(e) => updateEducation(index, "university", e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                              />
                              <div className="flex space-x-2">
                                <input
                                  type="number"
                                  placeholder="Percentage"
                                  value={edu.percentage}
                                  onChange={(e) => updateEducation(index, "percentage", Number(e.target.value))}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                                />
                                {editData && editData.education.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeEducation(index)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">{edu.course}</p>
                              <p className="text-sm text-gray-600">
                                {edu.university} - {edu.percentage}%
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Address Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-red-600" />
                          Address
                        </h4>
                        {editMode && (
                          <button
                            type="button"
                            onClick={addAddress}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                      {(editMode ? editData?.address : userProfile.address)?.map((addr, index) => (
                        <div key={index} className="mb-3 p-3 bg-white rounded border">
                          {editMode ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Address"
                                value={addr.address}
                                onChange={(e) => updateAddress(index, "address", e.target.value)}
                                className="md:col-span-2 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                              />
                              <input
                                type="text"
                                placeholder="City"
                                value={addr.city}
                                onChange={(e) => updateAddress(index, "city", e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                              />
                              <input
                                type="text"
                                placeholder="State"
                                value={addr.state}
                                onChange={(e) => updateAddress(index, "state", e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                              />
                              <div className="flex space-x-2">
                                <input
                                  type="number"
                                  placeholder="Pincode"
                                  value={addr.pincode}
                                  onChange={(e) => updateAddress(index, "pincode", Number(e.target.value))}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
                                />
                                {editData && editData.address.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeAddress(index)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium">{addr.address}</p>
                              <p className="text-sm text-gray-600">
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {editMode && (
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={saveProfile}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </motion.button>
                      </div>
                    )}
                  </div>

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

      {/* Detailed Modal */}
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

                      {/* Dashboard Button - Fixed Logic */}
                      {canAccessDashboard(selectedInternship.coursename) ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGoToDashboard}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                        >
                          <span>Go to Dashboard</span>
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
                            : userApplication
                              ? userApplication.status === "Pending"
                                ? "⏳ Application under review"
                                : "❌ Application not approved for this course"
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
