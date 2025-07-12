// pages/daily-tasks/sections/ProgressStatsSection.tsx
"use client"

import type React from "react"
import { TrendingUp } from "lucide-react"
import type { TasksData } from "../types"

interface ProgressStatsSectionProps {
  tasksData: TasksData
  daysSinceRegistration: number
}

const ProgressStatsSection: React.FC<ProgressStatsSectionProps> = ({ tasksData, daysSinceRegistration }) => {
  return (
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
  )
}

export default ProgressStatsSection
