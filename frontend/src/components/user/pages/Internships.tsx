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
} from "lucide-react"

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

const Internships: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([])
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")

  const fetchInternships = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/internships")
      const data = await response.json()
      // Only show active internships to users
      const activeInternships = data.filter((internship: Internship) => internship.status === "Active")
      setInternships(activeInternships)
    } catch (error) {
      console.error("Error fetching internships:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInternships()
  }, [])

  const handleApply = (internship: Internship) => {
    // TODO: Implement application logic
    alert(`Applied for ${internship.coursename}! We'll get back to you soon.`)
    setSelectedInternship(null)
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

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApply(selectedInternship)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Apply Now
                      </motion.button>

                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">🚀 Join 10,000+ students who've started their journey</p>
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
