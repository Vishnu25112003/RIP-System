// pages/Internships/index.tsx
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { useAuth } from "../../../context/authContext"
import type { Internship, UserApplication, UserProfile, EnrollFormData } from "./types"

// Import the new section components
import HeroSection from "./Internships/HeroSection"
import ApplicationStatusBanner from "./Internships/ApplicationStatusBanner"
import AvailableInternshipsSection from "./Internships/AvailableInternshipSection"
import EnrollmentSection from "./Internships/EnrollmentSection"
import InternshipDetailModal from "./Internships/InternshipDetailModel"
import InternshipEnrollFormModal from "./Internships/InternshipEnrollForm"

const Internships: React.FC = () => {
  const { user } = useAuth()
  const [internships, setInternships] = useState<Internship[]>([])
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [userApplication, setUserApplication] = useState<UserApplication | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState("All")
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [enrollFormData, setEnrollFormData] = useState<EnrollFormData>({
    courseSelection: "",
    learningPreference: "",
    technicalSkills: [],
  })
  const [submitting, setSubmitting] = useState(false)

  const availableSkills = [
    "JavaScript",
    "Python",
    "Java",
    "React",
    "Node.js",
    "HTML/CSS",
    "SQL",
    "MongoDB",
    "Git",
    "AWS",
    "Docker",
    "Machine Learning",
    "Data Analysis",
    "UI/UX Design",
    "Project Management",
    "Communication",
  ]

  const fetchInternships = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/internships")
      const data = await response.json()
      const activeInternships = data.filter((internship: Internship) => internship.status === "Active")
      setInternships(activeInternships)
    } catch (error) {
      console.error("Error fetching internships:", error)
    }
  }, [])

  const fetchDebugData = useCallback(async () => {
    if (!user?.mailid) return

    try {
      console.log("=== FETCHING DEBUG DATA ===")
      const response = await fetch(`http://localhost:5000/debug/user/${encodeURIComponent(user.mailid)}`)
      const data = await response.json()
      console.log("Debug data received:", data)

      if (data.applications && data.applications.length > 0) {
        const latestApp = data.applications[0]
        console.log("Setting application from debug data:", latestApp)

        const applicationData: UserApplication = {
          _id: latestApp.id,
          status: latestApp.status,
          courseSelection: latestApp.courseSelection,
          learningPreference: latestApp.learningPreference,
          technicalSkills: latestApp.technicalSkills || [],
          hasApplication: true,
          appliedAt: latestApp.createdAt,
          approvedAt: latestApp.approvedAt,
          adminFeedback: latestApp.adminFeedback,
        }
        setUserApplication(applicationData)
      }
    } catch (error) {
      console.error("Error fetching debug data:", error)
    }
  }, [user?.mailid])

  const fetchUserApplication = useCallback(async () => {
    if (!user?.id && !user?.mailid) {
      console.log("No user ID or email available")
      return
    }

    try {
      console.log("=== FETCHING APPLICATION STATUS ===")
      console.log("User ID:", user.id)
      console.log("User Email:", user.mailid)
      console.log("User Profile ID:", userProfile?._id)

      let response
      let method = "unknown"
      let success = false

      if (user.id && !success) {
        try {
          console.log("Trying method 1: user.id")
          response = await fetch(`http://localhost:5000/api/applications/user/${user.id}`)
          method = "user.id"
          console.log("Method 1 response status:", response.status)
          if (response.ok) success = true
        } catch (e) {
          console.log("Method 1 failed:", e)
        }
      }

      if (!success && userProfile?._id) {
        try {
          console.log("Trying method 2: userProfile._id")
          response = await fetch(`http://localhost:5000/api/applications/user/${userProfile._id}`)
          method = "userProfile._id"
          console.log("Method 2 response status:", response.status)
          if (response.ok) success = true
        } catch (e) {
          console.log("Method 2 failed:", e)
        }
      }

      if (!success && user.mailid) {
        try {
          console.log("Trying method 3: email")
          response = await fetch(`http://localhost:5000/api/applications/email/${encodeURIComponent(user.mailid)}`)
          method = "email"
          console.log("Method 3 response status:", response.status)
          if (response.ok) success = true
        } catch (e) {
          console.log("Method 3 failed:", e)
        }
      }

      if (success && response) {
        const data = await response.json()
        console.log("=== APPLICATION DATA RECEIVED ===")
        console.log("Method used:", method)
        console.log("Full response:", data)

        if (data.hasApplication === true || (data.status && data.courseSelection)) {
          const applicationData: UserApplication = {
            _id: data._id || "",
            status: data.status,
            courseSelection: data.courseSelection,
            learningPreference: data.learningPreference,
            technicalSkills: data.technicalSkills || [],
            hasApplication: true,
            appliedAt: data.appliedAt,
            approvedAt: data.approvedAt,
            adminFeedback: data.adminFeedback,
          }
          console.log("✅ Setting application data:", applicationData)
          setUserApplication(applicationData)
        } else {
          console.log("❌ No application found in response")
          setUserApplication(null)
        }
      } else {
        console.log("❌ All fetch methods failed")
        console.log("Final response status:", response?.status)
        console.log("🔧 Trying debug endpoint as fallback...")
        await fetchDebugData()
      }
    } catch (error) {
      console.error("Error fetching user application:", error)
      console.log("🔧 Trying debug endpoint due to error...")
      await fetchDebugData()
    }
  }, [user?.id, user?.mailid, userProfile?._id, fetchDebugData])

  const fetchUserProfile = useCallback(async () => {
    if (!user?.mailid) return

    try {
      const response = await fetch("http://localhost:5000/api/userverification/all-users")
      const allUsers = await response.json()
      const profile = allUsers.find((u: UserProfile) => u.mailid === user.mailid)
      if (profile) {
        setUserProfile(profile)
        console.log("User profile loaded:", profile._id)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }, [user?.mailid])

  const refreshApplicationStatus = useCallback(async () => {
    console.log("=== REFRESHING APPLICATION STATUS ===")
    setRefreshing(true)
    await fetchUserApplication()
    setRefreshing(false)
    console.log("=== REFRESH COMPLETE ===")
  }, [fetchUserApplication])

  useEffect(() => {
    const loadData = async () => {
      console.log("=== INITIAL DATA LOAD ===")
      await fetchInternships()
      await fetchUserProfile()
      setTimeout(async () => {
        await fetchUserApplication()
        setLoading(false)
        console.log("=== INITIAL LOAD COMPLETE ===")
      }, 100)
    }
    loadData()
  }, [user, fetchInternships, fetchUserProfile, fetchUserApplication])

  useEffect(() => {
    if (userProfile && !userApplication) {
      console.log("UserProfile loaded, refetching application...")
      fetchUserApplication()
    }
  }, [userProfile, userApplication, fetchUserApplication])

  const canAccessDashboard = useCallback(
    (courseName: string) => {
      console.log("=== DASHBOARD ACCESS CHECK ===")
      console.log("Course Name:", courseName)
      console.log("User Application:", userApplication)

      if (!userApplication) {
        console.log("❌ No user application object")
        return false
      }

      if (!userApplication.hasApplication) {
        console.log("❌ hasApplication is false")
        return false
      }

      console.log("Application Status:", userApplication.status)

      if (userApplication.status !== "Approved") {
        console.log("❌ Application not approved, status:", userApplication.status)
        return false
      }

      const appliedCourse = userApplication.courseSelection?.trim() || ""
      const checkingCourse = courseName?.trim() || ""

      console.log("Exact Course Match Check:")
      console.log("- Applied for:", `"${appliedCourse}"`)
      console.log("- Checking:", `"${checkingCourse}"`)

      const courseMatches = appliedCourse.toLowerCase() === checkingCourse.toLowerCase()

      console.log("- Exact Match Result:", courseMatches)

      if (courseMatches) {
        console.log("✅ DASHBOARD ACCESS GRANTED!")
      } else {
        console.log("❌ Course doesn't match application exactly")
      }

      return courseMatches
    },
    [userApplication],
  )

  const handleGoToDashboard = useCallback(() => {
    console.log("Navigating to dashboard...")
    window.location.href = "/user/daily-tasks"
  }, [])

  const handleSkillToggle = useCallback((skill: string) => {
    setEnrollFormData((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.includes(skill)
        ? prev.technicalSkills.filter((s) => s !== skill)
        : [...prev.technicalSkills, skill],
    }))
  }, [])

  const validateEnrollForm = useCallback(() => {
    if (!enrollFormData.courseSelection) {
      alert("Please select a course")
      return false
    }
    if (!enrollFormData.learningPreference) {
      alert("Please select a learning preference")
      return false
    }
    if (enrollFormData.technicalSkills.length === 0) {
      alert("Please select at least one technical skill")
      return false
    }
    return true
  }, [enrollFormData])

  const handleEnrollSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateEnrollForm() || !userProfile) return

      setSubmitting(true)
      try {
        const applicationData = {
          userId: userProfile._id,
          courseSelection: enrollFormData.courseSelection,
          learningPreference: enrollFormData.learningPreference,
          technicalSkills: enrollFormData.technicalSkills,
        }

        console.log("Submitting application:", applicationData)

        const response = await fetch("http://localhost:5000/api/applications/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(applicationData),
        })

        if (response.ok) {
          alert("Application submitted successfully! We'll review it and get back to you soon.")
          setShowEnrollForm(false)
          setEnrollFormData({
            courseSelection: "",
            learningPreference: "",
            technicalSkills: [],
          })
          await refreshApplicationStatus()
        } else {
          const errorData = await response.json()
          alert(errorData.message || "Failed to submit application")
        }
      } catch (error) {
        console.error("Error submitting application:", error)
        alert("Network error. Please try again.")
      } finally {
        setSubmitting(false)
      }
    },
    [enrollFormData, userProfile, validateEnrollForm, refreshApplicationStatus],
  )

  const filteredInternships = internships.filter((internship) =>
    filter === "All" ? true : internship.field === filter,
  )

  const uniqueFields = ["All", ...Array.from(new Set(internships.map((i) => i.field)))]

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <HeroSection />

      {userApplication && userApplication.hasApplication && (
        <ApplicationStatusBanner
          userApplication={userApplication}
          refreshApplicationStatus={refreshApplicationStatus}
          refreshing={refreshing}
          handleGoToDashboard={handleGoToDashboard}
          canAccessDashboard={canAccessDashboard}
        />
      )}

      <AvailableInternshipsSection
        internships={internships}
        filter={filter}
        setFilter={setFilter}
        setSelectedInternship={setSelectedInternship}
        canAccessDashboard={canAccessDashboard}
        filteredInternships={filteredInternships}
        uniqueFields={uniqueFields}
      />

      <EnrollmentSection userApplication={userApplication} setShowEnrollForm={setShowEnrollForm} />

      <InternshipEnrollFormModal
        showEnrollForm={showEnrollForm}
        setShowEnrollForm={setShowEnrollForm}
        enrollFormData={enrollFormData}
        setEnrollFormData={setEnrollFormData}
        submitting={submitting}
        handleEnrollSubmit={handleEnrollSubmit}
        internships={internships}
        userProfile={userProfile}
        availableSkills={availableSkills}
        handleSkillToggle={handleSkillToggle}
        validateEnrollForm={validateEnrollForm}
        modalVariants={modalVariants}
      />

      <InternshipDetailModal
        selectedInternship={selectedInternship}
        setSelectedInternship={setSelectedInternship}
        canAccessDashboard={canAccessDashboard}
        handleGoToDashboard={handleGoToDashboard}
        modalVariants={modalVariants}
      />
    </div>
  )
}

export default Internships
