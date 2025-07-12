// pages/Internships/sections/EnrollmentSection.tsx
"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Send, CheckCircle, AlertCircle, X } from "lucide-react"
import type { UserApplication } from "../types"

interface EnrollmentSectionProps {
  userApplication: UserApplication | null
  setShowEnrollForm: (show: boolean) => void
}

const EnrollmentSection: React.FC<EnrollmentSectionProps> = ({ userApplication, setShowEnrollForm }) => {
  return (
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
  )
}

export default EnrollmentSection
