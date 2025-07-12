// pages/daily-tasks/index.tsx
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { useAuth } from "../../../context/authContext"
import type { TasksData, TodayTask } from "./types"

// Import section components
import HeroSection from "./Dailytasks/HeroSection"
import CourseInfoSection from "./Dailytasks/CourseInfoSelection"
import TasksListSection from "./Dailytasks/TaskListSection"
import SubmissionPanel from "./Dailytasks/SubmissionPanel"
import ProgressStatsSection from "./Dailytasks/ProgressStatsSection"

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
  const getDaysSinceRegistration = useCallback((registrationDate: string) => {
    const now = new Date()
    const regDate = new Date(registrationDate)
    const diffTime = Math.abs(now.getTime() - regDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }, [])

  // Fetch user profile to get userId
  const fetchUserProfile = useCallback(async () => {
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
  }, [user?.mailid])

  // Fetch user's tasks
  const fetchUserTasks = useCallback(async (userId: string) => {
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
  }, [])

  // Fetch today's task details
  const fetchTodayTask = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/today/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setTodayTask(data)
        console.log("Today's task loaded:", data)
      } else {
        const errorData = await response.json()
        console.log("No accessible task for today:", errorData.error)
        setTodayTask(null) // Ensure todayTask is null if no task is available
      }
    } catch (error) {
      console.error("Error fetching today's task:", error)
      setTodayTask(null) // Ensure todayTask is null on error
    }
  }, [])

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
  }, [user, fetchUserProfile, fetchUserTasks, fetchTodayTask])

  // Auto-expand current available task when tasks data is loaded
  useEffect(() => {
    if (tasksData && !expandedTask) {
      const currentTask = tasksData.tasks.find((t) => t.status === "current")
      if (currentTask) {
        setExpandedTask(currentTask.day)
      }
    }
  }, [tasksData, expandedTask])

  // Handle file selection
  // const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = (event.target as HTMLInputElement).files?.[0]
  //   if (file) {
  //     // Validate file size (max 10MB)
  //     if (file.size > 10 * 1024 * 1024) {
  //       alert("File size must be less than 10MB")
  //       return
  //     }
  //     setSelectedFile(file)
  //   }
  // }, [])

  // Handle task submission
  const handleSubmitTask = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [selectedFile, submissionText, todayTask, userProfile, fetchUserTasks, fetchTodayTask],
  )

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
      <HeroSection tasksData={tasksData} daysSinceRegistration={daysSinceRegistration} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourseInfoSection tasksData={tasksData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <TasksListSection tasksData={tasksData} expandedTask={expandedTask} setExpandedTask={setExpandedTask} />

          <div className="lg:col-span-1">
            <SubmissionPanel
              todayTask={todayTask}
              userProfile={userProfile}
              submitting={submitting}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              submissionText={submissionText}
              setSubmissionText={setSubmissionText}
              handleSubmitTask={handleSubmitTask}
              tasksData={tasksData} // Pass tasksData for "No Task Available" message
            />

            <ProgressStatsSection tasksData={tasksData} daysSinceRegistration={daysSinceRegistration} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyTasks
