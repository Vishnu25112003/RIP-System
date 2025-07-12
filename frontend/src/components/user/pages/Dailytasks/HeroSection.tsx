// pages/daily-tasks/sections/HeroSection.tsx
"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Trophy, Target, User } from "lucide-react"
import type { TasksData } from "../types"

interface HeroSectionProps {
  tasksData: TasksData
  daysSinceRegistration: number
}

const HeroSection: React.FC<HeroSectionProps> = ({ tasksData }) => {
  return (
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
  )
}

export default HeroSection
