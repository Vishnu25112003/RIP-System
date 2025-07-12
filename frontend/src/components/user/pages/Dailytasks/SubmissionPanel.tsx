// pages/daily-tasks/sections/SubmissionPanel.tsx
"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Upload, Send, RefreshCw, Lock, Calendar } from "lucide-react"
import type { TodayTask, TasksData } from "../types"

interface SubmissionPanelProps {
  todayTask: TodayTask | null
  userProfile: any
  submitting: boolean
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  submissionText: string
  setSubmissionText: (text: string) => void
  handleSubmitTask: (e: React.FormEvent) => Promise<void>
  tasksData: TasksData // Added for "No Task Available" message
}

const SubmissionPanel: React.FC<SubmissionPanelProps> = ({
  todayTask,
  submitting,
  selectedFile,
  setSelectedFile,
  submissionText,
  setSubmissionText,
  handleSubmitTask,
  tasksData,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="sticky top-8"
    >
      {todayTask && todayTask.canSubmit ? (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Send className="w-5 h-5 mr-2 text-green-600" />
            Submit Day {todayTask.taskDay} Task
          </h3>

          <form onSubmit={handleSubmitTask} className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Exercise File *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{selectedFile ? selectedFile.name : "Click to upload file"}</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, TXT, ZIP, Images (Max 10MB)</p>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What did you learn today? *</label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what you learned, challenges faced, and key takeaways..."
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!selectedFile || !submissionText.trim() || submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${
                !selectedFile || !submissionText.trim() || submitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Task</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Next Unlock Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-blue-700 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Next task unlocks based on your daily schedule</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Task Available</h3>
          <p className="text-gray-600 text-sm">
            {tasksData.tasks.find((t) => t.status === "current")
              ? "Complete previous tasks to unlock today's task"
              : "Check back tomorrow for new tasks"}
          </p>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              You're on Day {tasksData.actualCurrentDay} of your internship journey
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default SubmissionPanel
