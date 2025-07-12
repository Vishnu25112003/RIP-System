// pages/Internships/sections/InternshipDetailModal.tsx
"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Clock, MapPin, Zap, Calendar, CheckCircle, ArrowRight, Lock, BookOpen } from "lucide-react"
import type { Internship } from "../types"

interface InternshipDetailModalProps {
  selectedInternship: Internship | null
  setSelectedInternship: (internship: Internship | null) => void
  canAccessDashboard: (courseName: string) => boolean
  handleGoToDashboard: () => void
  modalVariants: {
    hidden: { opacity: number; scale: number }
    visible: { opacity: number; scale: number; transition: { duration: number } }
    exit: { opacity: number; scale: number; transition: { duration: number } }
  }
}

const InternshipDetailModal: React.FC<InternshipDetailModalProps> = ({
  selectedInternship,
  setSelectedInternship,
  canAccessDashboard,
  handleGoToDashboard,
  modalVariants,
}) => {
  if (!selectedInternship) return null

  return (
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

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
  )
}

export default InternshipDetailModal
