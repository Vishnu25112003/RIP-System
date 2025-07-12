"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  CheckCircle,
  Lock,
  AlertCircle,
  Upload,
  Send,
  BookOpen,
  Target,
  Trophy,
  GraduationCap,
  TrendingUp,
  ChevronDown,
  RefreshCw,
  Calendar,
  Zap,
  User,
} from "lucide-react"
import { useAuth } from "../../../context/authContext"

interface Task {
  _id: string
  day: number
  title: string
  description: string
  exercise?: string
  test?: string
  status: "completed" | "current" | "locked"
  canAccess: boolean
  isSubmitted: boolean
  submissionId?: string
  unlockDate?: string
  unlockedBy?: string
}

interface Course {
  _id: string
  coursename: string
  field: string
  description: string
}

interface TasksData {
  course: Course
  tasks: Task[]
  currentDay: number
  actualCurrentDay: number
  registrationDate: string
  totalSubmissions: number
  totalUnlocks: number
}

interface TodayTask {
  task: Task
  courseId: string
  currentDay: number
  taskDay: number
  canSubmit: boolean
}

const DailyTasks: React.FC = () => {
  const { user } = useAuth()
  const [tasksData, setTasksData] = useState<TasksData | null>(null)
  const [todayTask, setTodayTask] = useState<TodayTask | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [expandedTask, setExpandedTask] = useState<number | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submissionText, setSubmissionText] = useState("")
  const [userProfile, setUserProfile] = useState<any>(null)

  // Calculate days since registration for display
  const getDaysSinceRegistration = (registrationDate: string) => {
    const now = new Date()
    const regDate = new Date(registrationDate)
    const diffTime = Math.abs(now.getTime() - regDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Fetch user profile to get userId
  const fetchUserProfile = async () => {
    if (!user?.mailid) return null

    try {
      const response = await fetch("http://localhost:5000/api/userverification/all-users")
      const allUsers = await response.json()
      const profile = allUsers.find((u: any) => u.mailid === user.mailid)
      if (profile) {
        setUserProfile(profile)
        return profile._id
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
    return null
  }

  // Fetch user's tasks
  const fetchUserTasks = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/user/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setTasksData(data)
        console.log("Tasks loaded:", data)
      } else {
        console.error("Failed to fetch tasks:", response.status)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  // Fetch today's task details
  const fetchTodayTask = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/today/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setTodayTask(data)
        console.log("Today's task loaded:", data)
      } else {
        const errorData = await response.json()
        console.log("No accessible task for today:", errorData.error)
      }
    } catch (error) {
      console.error("Error fetching today's task:", error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      const userId = await fetchUserProfile()
      if (userId) {
        await Promise.all([fetchUserTasks(userId), fetchTodayTask(userId)])
      }
      setLoading(false)
    }
    loadData()
  }, [user])

  // Auto-expand current available task when tasks data is loaded
  useEffect(() => {
    if (tasksData && !expandedTask) {
      const currentTask = tasksData.tasks.find((t) => t.status === "current")
      if (currentTask) {
        setExpandedTask(currentTask.day)
      }
    }
  }, [tasksData])

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      setSelectedFile(file)
    }
  }

  // Handle task submission
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !submissionText.trim() || !todayTask || !userProfile) {
      alert("Please fill in all required fields")
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("exerciseFile", selectedFile)
      formData.append("userId", userProfile._id)
      formData.append("courseId", todayTask.courseId)
      formData.append("day", todayTask.taskDay.toString())
      formData.append("submissionDescription", submissionText.trim())

      const response = await fetch("http://localhost:5000/api/tasks/submit", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Task submitted successfully! 🎉\n\nNext task will unlock based on your daily schedule.`)

        // Reset form
        setSelectedFile(null)
        setSubmissionText("")
        setExpandedTask(null)

        // Refresh data
        await Promise.all([fetchUserTasks(userProfile._id), fetchTodayTask(userProfile._id)])
      } else {
        const error = await response.json()
        alert(error.error || "Failed to submit task")
      }
    } catch (error) {
      console.error("Error submitting task:", error)
      alert("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "current":
        return <Zap className="w-6 h-6 text-blue-500" />
      case "locked":
        return <Lock className="w-6 h-6 text-gray-400" />
      default:
        return <Clock className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50"
      case "current":
        return "border-blue-200 bg-blue-50"
      case "locked":
        return "border-gray-200 bg-gray-50"
      default:
        return "border-gray-200 bg-white"
    }
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

  if (!tasksData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Course Found</h2>
          <p className="text-gray-600">You don't have an approved application for any course.</p>
        </div>
      </div>
    )
  }

  const daysSinceRegistration = getDaysSinceRegistration(tasksData.registrationDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Hero Section with Registration Info */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Welcome to Day {tasksData.actualCurrentDay}
              </span>
              <span className="block text-white">of your Internship!</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Master {tasksData.course.coursename} with daily challenges and hands-on exercises
            </motion.p>

            <motion.div
              className="flex items-center justify-center space-x-8 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>{tasksData.totalSubmissions} Tasks Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Day {tasksData.actualCurrentDay} of Journey</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Started {new Date(tasksData.registrationDate).toLocaleDateString()}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Course Info Section with Registration Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{tasksData.course.coursename}</h2>
                <p className="text-gray-600">{tasksData.course.field}</p>
                <p className="text-sm text-gray-500">
                  Started on {new Date(tasksData.registrationDate).toLocaleDateString()} • Day{" "}
                  {tasksData.actualCurrentDay} of your journey
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {tasksData.totalSubmissions}/{tasksData.tasks.length}
              </div>
              <div className="text-sm text-gray-500">Tasks Completed</div>
            </div>
          </div>
          <div className="mt-4 bg-gray-100 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(tasksData.totalSubmissions / tasksData.tasks.length) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Tasks List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tasks Column */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
                Daily Tasks
              </h3>

              <div className="space-y-4">
                {tasksData.tasks.map((task, index) => (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`border-2 rounded-xl p-6 transition-all duration-300 ${getStatusColor(task.status)} ${
                      task.canAccess ? "cursor-pointer hover:shadow-lg" : "cursor-not-allowed"
                    }`}
                    onClick={() => {
                      if (task.status === "current") {
                        setExpandedTask(expandedTask === task.day ? null : task.day)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(task.status)}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Day {task.day} - {task.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {task.status === "completed" && "✅ Completed"}
                            {task.status === "current" && "⚡ Available Now - Click to expand"}
                            {task.status === "locked" && "🔒 " + (task.unlockDate || "Locked")}
                          </p>
                          {/* Show unlock information */}
                          {task.unlockDate && (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{task.unlockDate}</span>
                            </div>
                          )}
                          {task.unlockedBy && task.status === "current" && (
                            <div className="flex items-center mt-1 text-xs text-green-600">
                              <Zap className="w-3 h-3 mr-1" />
                              <span>
                                Unlocked by {task.unlockedBy === "cron" ? "midnight scheduler" : task.unlockedBy}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {task.canAccess && task.status === "current" && (
                        <motion.div
                          animate={{ rotate: expandedTask === task.day ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      )}
                    </div>

                    {/* Expanded Task Details */}
                    <AnimatePresence>
                      {expandedTask === task.day && task.canAccess && task.status === "current" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 pt-6 border-t border-gray-200"
                        >
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-2">Description:</h5>
                              <p className="text-gray-700">{task.description}</p>
                            </div>

                            {task.exercise && (
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Exercise:</h5>
                                <p className="text-gray-700">{task.exercise}</p>
                              </div>
                            )}

                            {task.test && (
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Test/Setup:</h5>
                                <p className="text-gray-700">{task.test}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Submission Panel */}
          <div className="lg:col-span-1">
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
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                          accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.png"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {selectedFile ? selectedFile.name : "Click to upload file"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PDF, DOC, TXT, ZIP, Images (Max 10MB)</p>
                        </label>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What did you learn today? *
                      </label>
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

              {/* Enhanced Progress Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Your Progress
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-semibold text-green-600">
                      {tasksData.tasks.filter((t) => t.status === "completed").length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Journey Day:</span>
                    <span className="font-semibold text-blue-600">{tasksData.actualCurrentDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tasks:</span>
                    <span className="font-semibold text-gray-900">{tasksData.tasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unlocked:</span>
                    <span className="font-semibold text-purple-600">{tasksData.totalUnlocks + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Active:</span>
                    <span className="font-semibold text-orange-600">{daysSinceRegistration}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyTasks
