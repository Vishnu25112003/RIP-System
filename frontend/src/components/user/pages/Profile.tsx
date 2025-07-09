"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  UserCheck,
  Sparkles,
  Award,
} from "lucide-react"
import { useAuth } from "../../../context/authContext"

interface Education {
  course: string
  university: string
  percentage: number
}

interface Address {
  address: string
  city: string
  state: string
  pincode: number
}

interface UserProfile {
  _id: string
  name: string
  fathername: string
  mailid: string
  phone: string
  dob: string
  gender: "Male" | "Female" | "Other"
  education: Education[]
  address: Address[]
  status: "Pending" | "Approved" | "Rejected"
}

const Profile: React.FC = () => {
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<UserProfile | null>(null)

  const fetchUserProfile = async () => {
    try {
      // Find user by email from auth context
      const response = await fetch("http://localhost:5000/api/userverification/all-users")
      const allUsers = await response.json()
      const userProfile = allUsers.find((u: UserProfile) => u.mailid === authUser?.mailid)

      if (userProfile) {
        setProfile(userProfile)
        setEditData(userProfile)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!editData || !profile) return

    setSaving(true)
    try {
      const response = await fetch(`http://localhost:5000/api/userverification/user/${profile._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditMode(false)
        alert("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error saving profile")
    } finally {
      setSaving(false)
    }
  }

  const addEducation = () => {
    if (!editData) return
    setEditData({
      ...editData,
      education: [...editData.education, { course: "", university: "", percentage: 0 }],
    })
  }

  const removeEducation = (index: number) => {
    if (!editData) return
    setEditData({
      ...editData,
      education: editData.education.filter((_, i) => i !== index),
    })
  }

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    if (!editData) return
    const updatedEducation = [...editData.education]
    updatedEducation[index] = { ...updatedEducation[index], [field]: value }
    setEditData({ ...editData, education: updatedEducation })
  }

  const addAddress = () => {
    if (!editData) return
    setEditData({
      ...editData,
      address: [...editData.address, { address: "", city: "", state: "", pincode: 0 }],
    })
  }

  const removeAddress = (index: number) => {
    if (!editData) return
    setEditData({
      ...editData,
      address: editData.address.filter((_, i) => i !== index),
    })
  }

  const updateAddress = (index: number, field: keyof Address, value: string | number) => {
    if (!editData) return
    const updatedAddress = [...editData.address]
    updatedAddress[index] = { ...updatedAddress[index], [field]: value }
    setEditData({ ...editData, address: updatedAddress })
  }

  useEffect(() => {
    fetchUserProfile()
  }, [authUser])

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h2>
          <p className="text-gray-600">Please contact support for assistance.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    Welcome, {profile.name}
                    <Sparkles className="inline-block w-8 h-8 ml-2 text-yellow-300" />
                  </h1>
                  <p className="text-xl opacity-90">Manage your profile and personal information</p>
                  <div className="flex items-center mt-2">
                    <UserCheck className="w-5 h-5 mr-2" />
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        profile.status === "Approved"
                          ? "bg-green-500/20 text-green-100"
                          : profile.status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-100"
                            : "bg-red-500/20 text-red-100"
                      }`}
                    >
                      {profile.status}
                    </span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditMode(!editMode)}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
              >
                {editMode ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                <span>{editMode ? "Cancel" : "Edit Profile"}</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-600" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editData?.name || ""}
                    onChange={(e) => setEditData(editData ? { ...editData, name: e.target.value } : null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editData?.fathername || ""}
                    onChange={(e) => setEditData(editData ? { ...editData, fathername: e.target.value } : null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{profile.fathername}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <p className="text-lg font-semibold text-gray-900">{profile.mailid}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={editData?.phone || ""}
                    onChange={(e) => setEditData(editData ? { ...editData, phone: e.target.value } : null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">{profile.phone}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                {editMode ? (
                  <input
                    type="date"
                    value={editData?.dob ? new Date(editData.dob).toISOString().split("T")[0] : ""}
                    onChange={(e) => setEditData(editData ? { ...editData, dob: e.target.value } : null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">{new Date(profile.dob).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                {editMode ? (
                  <select
                    value={editData?.gender || ""}
                    onChange={(e) =>
                      setEditData(
                        editData ? { ...editData, gender: e.target.value as "Male" | "Female" | "Other" } : null,
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{profile.gender}</p>
                )}
              </div>
            </div>

            {editMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-end space-x-4"
              >
                <button
                  onClick={() => setEditMode(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-500" />
                Profile Completion
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Personal Info</span>
                  <span className="text-green-600 font-semibold">100%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Education</span>
                  <span className={`font-semibold ${profile.education.length > 0 ? "text-green-600" : "text-red-600"}`}>
                    {profile.education.length > 0 ? "100%" : "0%"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Address</span>
                  <span className={`font-semibold ${profile.address.length > 0 ? "text-green-600" : "text-red-600"}`}>
                    {profile.address.length > 0 ? "100%" : "0%"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2">🎯 Complete Your Profile</h3>
              <p className="text-sm opacity-90 mb-4">
                Add your education and address details to unlock more opportunities!
              </p>
              <div className="text-xs opacity-75">Profile completion helps us match you with better internships.</div>
            </div>
          </motion.div>
        </div>

        {/* Education Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <GraduationCap className="w-6 h-6 mr-2 text-purple-600" />
              Education
            </h2>
            {editMode && (
              <button
                onClick={addEducation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education</span>
              </button>
            )}
          </div>

          {(editMode ? editData?.education : profile.education)?.map((edu, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 border border-gray-200 rounded-xl"
            >
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Course"
                    value={edu.course}
                    onChange={(e) => updateEducation(index, "course", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="University"
                    value={edu.university}
                    onChange={(e) => updateEducation(index, "university", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Percentage"
                      value={edu.percentage}
                      onChange={(e) => updateEducation(index, "percentage", Number(e.target.value))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => removeEducation(index)} className="text-red-600 hover:text-red-800 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{edu.course}</h3>
                  <p className="text-gray-600">{edu.university}</p>
                  <p className="text-blue-600 font-semibold">{edu.percentage}%</p>
                </div>
              )}
            </motion.div>
          ))}

          {(!profile.education || profile.education.length === 0) && !editMode && (
            <div className="text-center py-8">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No education information added yet.</p>
              <p className="text-sm text-gray-400">Click "Edit Profile" to add your educational background.</p>
            </div>
          )}
        </motion.div>

        {/* Address Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-red-600" />
              Address
            </h2>
            {editMode && (
              <button
                onClick={addAddress}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            )}
          </div>

          {(editMode ? editData?.address : profile.address)?.map((addr, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 border border-gray-200 rounded-xl"
            >
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Address"
                    value={addr.address}
                    onChange={(e) => updateAddress(index, "address", e.target.value)}
                    className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={addr.city}
                    onChange={(e) => updateAddress(index, "city", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={addr.state}
                    onChange={(e) => updateAddress(index, "state", e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Pincode"
                      value={addr.pincode}
                      onChange={(e) => updateAddress(index, "pincode", Number(e.target.value))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => removeAddress(index)} className="text-red-600 hover:text-red-800 p-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-gray-900">{addr.address}</p>
                  <p className="text-gray-600">
                    {addr.city}, {addr.state}
                  </p>
                  <p className="text-blue-600 font-semibold">PIN: {addr.pincode}</p>
                </div>
              )}
            </motion.div>
          ))}

          {(!profile.address || profile.address.length === 0) && !editMode && (
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No address information added yet.</p>
              <p className="text-sm text-gray-400">Click "Edit Profile" to add your address details.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
