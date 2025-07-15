"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Building2, User, Mail, Phone, Users, BookOpen, Plus, Trash2, ArrowLeft, CheckCircle } from "lucide-react"

interface Course {
  _id: string
  coursename: string
  field: string
  status: string
}

interface Student {
  registerNo: string
  email: string
  phone: string
  courseId: string
}

const OrganizationSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    preferredMode: "organizer" as "organizer" | "student",
    assignedCourse: "",
    numberOfStudents: 1,
  })

  const [students, setStudents] = useState<Student[]>([{ registerNo: "", email: "", phone: "", courseId: "" }])

  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [step, setStep] = useState(1)
  const navigate = useNavigate()

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/internships")
        const data = await response.json()
        setCourses(data.filter((course: Course) => course.status === "Active"))
      } catch (error) {
        console.error("Error fetching courses:", error)
      }
    }
    fetchCourses()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Update number of students when changed
    if (name === "numberOfStudents") {
      const count = Number.parseInt(value) || 1
      const newStudents = Array.from(
        { length: count },
        (_, i) => students[i] || { registerNo: "", email: "", phone: "", courseId: "" },
      )
      setStudents(newStudents)
    }
  }

  const handleStudentChange = (index: number, field: keyof Student, value: string) => {
    const updatedStudents = [...students]
    updatedStudents[index] = { ...updatedStudents[index], [field]: value }
    setStudents(updatedStudents)
  }

  const addStudent = () => {
    setStudents([...students, { registerNo: "", email: "", phone: "", courseId: "" }])
    setFormData((prev) => ({ ...prev, numberOfStudents: students.length + 1 }))
  }

  const removeStudent = (index: number) => {
    if (students.length > 1) {
      const updatedStudents = students.filter((_, i) => i !== index)
      setStudents(updatedStudents)
      setFormData((prev) => ({
        ...prev,
        numberOfStudents: updatedStudents.length,
      }))
    }
  }

  const validateForm = () => {
    // Basic validation
    if (!formData.name || !formData.organizerName || !formData.organizerEmail || !formData.organizerPhone) {
      setMessage("Please fill in all organization details")
      return false
    }

    // Course validation
    if (formData.preferredMode === "organizer" && !formData.assignedCourse) {
      setMessage("Please select a course for all students")
      return false
    }

    // Students validation
    for (let i = 0; i < students.length; i++) {
      const student = students[i]
      if (!student.registerNo || !student.email || !student.phone) {
        setMessage(`Please fill in all details for student ${i + 1}`)
        return false
      }
      if (formData.preferredMode === "student" && !student.courseId) {
        setMessage(`Please select a course for student ${i + 1}`)
        return false
      }
    }

    // Check for duplicate emails
    const emails = students.map((s) => s.email.toLowerCase())
    const uniqueEmails = new Set(emails)
    if (uniqueEmails.size !== emails.length) {
      setMessage("Duplicate student emails found")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setMessage("")

    try {
      const registrationData = {
        name: formData.name,
        organizerName: formData.organizerName,
        organizerEmail: formData.organizerEmail,
        organizerPhone: formData.organizerPhone,
        preferredMode: formData.preferredMode,
        assignedCourse: formData.preferredMode === "organizer" ? formData.assignedCourse : undefined,
        students: students.map((student) => ({
          registerNo: student.registerNo,
          email: student.email,
          phone: student.phone,
          courseId: formData.preferredMode === "student" ? student.courseId : undefined,
        })),
      }

      const response = await fetch("http://localhost:5000/api/organization/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Organization registered successfully! Awaiting admin approval.")
        setStep(3) // Success step
      } else {
        setMessage(data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setMessage("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your organization has been registered successfully. You will receive an email notification once the admin
            approves your registration.
          </p>
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xl inline-block mb-4">
            InternPortal
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Organization Registration</h2>
          <p className="text-gray-600 mt-2">Register multiple students at once</p>
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate("/auth/signin")}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Sign Up Options
        </button>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              message.includes("successful")
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Organization Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Building2 className="mr-2" size={24} />
              Organization Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organizer Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="organizerName"
                    value={formData.organizerName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter organizer name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organizer Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="organizerEmail"
                    value={formData.organizerEmail}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter organizer email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organizer Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="organizerPhone"
                    value={formData.organizerPhone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter organizer phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Course Selection Method */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="mr-2" size={24} />
              Course Selection Method
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="preferredMode"
                    value="organizer"
                    checked={formData.preferredMode === "organizer"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="font-medium">Organizer Preferred</span>
                  <span className="text-gray-500 ml-2">(Same course for all students)</span>
                </label>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="preferredMode"
                    value="student"
                    checked={formData.preferredMode === "student"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="font-medium">Student Preferred</span>
                  <span className="text-gray-500 ml-2">(Each student chooses their course)</span>
                </label>
              </div>

              {formData.preferredMode === "organizer" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course for All Students *
                  </label>
                  <select
                    name="assignedCourse"
                    value={formData.assignedCourse}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.coursename} - {course.field}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.preferredMode === "student" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Students *</label>
                  <input
                    type="number"
                    name="numberOfStudents"
                    value={formData.numberOfStudents}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Student Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <Users className="mr-2" size={24} />
                Student Details ({students.length} students)
              </h3>
              {formData.preferredMode === "student" && (
                <button
                  type="button"
                  onClick={addStudent}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add Student
                </button>
              )}
            </div>

            <div className="space-y-4">
              {students.map((student, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Student {index + 1}</h4>
                    {students.length > 1 && formData.preferredMode === "student" && (
                      <button
                        type="button"
                        onClick={() => removeStudent(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Register Number *</label>
                      <input
                        type="text"
                        value={student.registerNo}
                        onChange={(e) => handleStudentChange(index, "registerNo", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter register number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        value={student.email}
                        onChange={(e) => handleStudentChange(index, "email", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={student.phone}
                        onChange={(e) => handleStudentChange(index, "phone", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone"
                      />
                    </div>
                  </div>

                  {formData.preferredMode === "student" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Selection *</label>
                      <select
                        value={student.courseId}
                        onChange={(e) => handleStudentChange(index, "courseId", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a course</option>
                        {courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.coursename} - {course.field}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering Organization..." : "Register Organization"}
          </button>
        </form>

        {/* Link back to individual signup */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Want to register as an individual?{" "}
            <Link to="/auth/signin" className="text-blue-600 hover:text-blue-700 font-semibold">
              Individual Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OrganizationSignup
