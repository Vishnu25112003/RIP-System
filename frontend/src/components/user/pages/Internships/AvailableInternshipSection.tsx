// pages/Internships/sections/AvailableInternshipsSection.tsx
"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Clock, MapPin, ChevronRight, BookOpen, Target, CheckCircle } from "lucide-react"
import type { Internship } from "../types"

interface AvailableInternshipsSectionProps {
  internships: Internship[]
  filter: string
  setFilter: (filter: string) => void
  setSelectedInternship: (internship: Internship) => void
  canAccessDashboard: (courseName: string) => boolean
  filteredInternships: Internship[]
  uniqueFields: string[]
}

const AvailableInternshipsSection: React.FC<AvailableInternshipsSectionProps> = ({
  filter,
  setFilter,
  setSelectedInternship,
  canAccessDashboard,
  filteredInternships,
  uniqueFields,
}) => {
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

  return (
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
  )
}

export default AvailableInternshipsSection
