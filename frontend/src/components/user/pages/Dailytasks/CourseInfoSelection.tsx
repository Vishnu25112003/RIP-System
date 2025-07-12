// pages/daily-tasks/sections/CourseInfoSection.tsx
"use client"

import type React from "react"
import { motion } from "framer-motion"
import { GraduationCap } from "lucide-react"
import type { TasksData } from "../types"

interface CourseInfoSectionProps {
  tasksData: TasksData
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ tasksData }) => {
  return (
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
              Started on {new Date(tasksData.registrationDate).toLocaleDateString()} • Day {tasksData.actualCurrentDay}{" "}
              of your journey
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
  )
}

export default CourseInfoSection
