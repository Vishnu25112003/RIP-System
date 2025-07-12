// pages/daily-tasks/sections/TasksListSection.tsx
"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, CheckCircle, Lock, Zap, BookOpen, ChevronDown, Calendar } from "lucide-react"
import type { TasksData } from "../types"

interface TasksListSectionProps {
  tasksData: TasksData
  expandedTask: number | null
  setExpandedTask: (day: number | null) => void
}

const TasksListSection: React.FC<TasksListSectionProps> = ({ tasksData, expandedTask, setExpandedTask }) => {
  // Get status icon and color (moved from main DailyTasks component)
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

  return (
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
                        <span>Unlocked by {task.unlockedBy === "cron" ? "midnight scheduler" : task.unlockedBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                {task.canAccess && task.status === "current" && (
                  <motion.div animate={{ rotate: expandedTask === task.day ? 180 : 0 }} transition={{ duration: 0.3 }}>
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
  )
}

export default TasksListSection
