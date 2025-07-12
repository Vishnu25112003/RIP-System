// pages/Internships/sections/InternshipEnrollFormModal.tsx
"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, Send } from "lucide-react"
import type { Internship, UserProfile, EnrollFormData } from "../types"

interface InternshipEnrollFormModalProps {
  showEnrollForm: boolean
  setShowEnrollForm: (show: boolean) => void
  enrollFormData: EnrollFormData
  setEnrollFormData: (data: EnrollFormData) => void
  submitting: boolean
  handleEnrollSubmit: (e: React.FormEvent) => Promise<void>
  internships: Internship[]
  userProfile: UserProfile | null
  availableSkills: string[]
  handleSkillToggle: (skill: string) => void
  validateEnrollForm: () => boolean
  modalVariants: {
    hidden: { opacity: number; scale: number }
    visible: { opacity: number; scale: number; transition: { duration: number } }
    exit: { opacity: number; scale: number; transition: { duration: number } }
  }
}

const InternshipEnrollFormModal: React.FC<InternshipEnrollFormModalProps> = ({
  showEnrollForm,
  setShowEnrollForm,
  enrollFormData,
  setEnrollFormData,
  submitting,
  handleEnrollSubmit,
  internships,
  userProfile,
  availableSkills,
  handleSkillToggle,
  modalVariants,
}) => {
  return (
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
                          onChange={() =>
                            setEnrollFormData((prev) => ({
                              ...prev,
                              courseSelection: internship.coursename, // Pass value directly
                            }))
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
                          onChange={() =>
                            setEnrollFormData((prev) => ({
                              ...prev,
                              learningPreference: preference, // Pass value directly
                            }))
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
  )
}

export default InternshipEnrollFormModal
