// pages/Internships/sections/ApplicationStatusBanner.tsx
"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Clock, Trophy, AlertCircle, RefreshCw, GraduationCap, CheckCircle, ArrowRight, Calendar } from "lucide-react" // Import Calendar from lucide-react
import type { UserApplication } from "../types"

interface ApplicationStatusBannerProps {
  userApplication: UserApplication
  refreshApplicationStatus: () => Promise<void>
  refreshing: boolean
  handleGoToDashboard: () => void
  canAccessDashboard: (courseName: string) => boolean
}

const ApplicationStatusBanner: React.FC<ApplicationStatusBannerProps> = ({
  userApplication,
  refreshApplicationStatus,
  refreshing,
  handleGoToDashboard,
}) => {
  return (
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
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-current rounded-full transform translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full transform -translate-x-12 translate-y-12" />
        </div>

        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
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
  )
}

export default ApplicationStatusBanner
