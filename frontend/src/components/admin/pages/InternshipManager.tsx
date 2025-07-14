"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import {
  FaBriefcase,
  FaClipboardList,
  FaBookOpen,
  FaTasks,
  FaRegEye,
  FaPencilAlt,
  FaFileUpload,
  FaTrashAlt,
  FaTimesCircle,
  FaCloudUploadAlt,
} from "react-icons/fa"

interface Task {
  day?: number
  title: string
  description: string
  exercise?: string
  test?: string
}

interface Internship {
  _id: string
  coursename: string
  field: string
  description: string
  duration: string
  status: "Active" | "Inactive"
  image?: string
  dailyTasks: Task[]
}

const InternshipManager: React.FC = () => {
  const [formData, setFormData] = useState({
    coursename: "",
    field: "",
    description: "",
    duration: "1",
    status: "Inactive" as "Active" | "Inactive",
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null) // New state for image preview
  const [taskDocumentFile, setTaskDocumentFile] = useState<File | null>(null)
  const [internships, setInternships] = useState<Internship[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [tasks, setTasks] = useState<Task[]>([{ title: "", description: "", exercise: "", test: "" }])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showTaskViewModal, setShowTaskViewModal] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null) // Ref for the image file input

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0]
      setImage(selectedImage)
      setImagePreviewUrl(URL.createObjectURL(selectedImage)) // Create URL for preview
    } else {
      setImage(null)
      setImagePreviewUrl(null)
    }
  }

  const fetchInternships = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/internships")
      setInternships(res.data)
    } catch (error) {
      console.error("Fetch error", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => form.append(key, value))
    if (image) form.append("image", image)

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/internships/${editingId}`, form)
      } else {
        await axios.post("http://localhost:5000/api/internships", form)
      }
      resetForm()
      fetchInternships() // Re-fetch to ensure the main list is updated
    } catch (error) {
      console.error("Error submitting internship", error)
    }
  }

  const resetForm = () => {
    setFormData({
      coursename: "",
      field: "",
      description: "",
      duration: "1",
      status: "Inactive",
    })
    setImage(null)
    setImagePreviewUrl(null) // Clear image preview
    setEditingId(null)
    setTasks([{ title: "", description: "", exercise: "", test: "" }])
    setShowForm(false)
    setTaskDocumentFile(null)
    setUploadMessage(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = "" // Clear file input element
    }
  }

  const handleEdit = (internship: Internship) => {
    setFormData({
      coursename: internship.coursename,
      field: internship.field,
      description: internship.description,
      duration: internship.duration,
      status: internship.status,
    })
    setEditingId(internship._id)
    setTasks(internship.dailyTasks)
    // Set image preview if an image exists for the internship
    if (internship.image) {
      setImagePreviewUrl(`http://localhost:5000/uploads/${internship.image}`)
      setImage(null) // Clear the File object, as we're showing an existing image
    } else {
      setImagePreviewUrl(null)
      setImage(null)
    }
    setShowForm(true)
  }

  const openTaskModal = (internship: Internship) => {
    setSelectedInternship(internship)
    setTasks(
      internship.dailyTasks.length > 0
        ? [...internship.dailyTasks]
        : [{ title: "", description: "", exercise: "", test: "" }],
    )
    setTaskDocumentFile(null)
    setUploadMessage(null)
    setShowTaskModal(true)
  }

  const closeTaskModal = () => {
    setShowTaskModal(false)
    setSelectedInternship(null)
    setTaskDocumentFile(null)
    setUploadMessage(null)
    fetchInternships()
  }

  const openTaskViewModal = (internship: Internship) => {
    setSelectedInternship(internship)
    setShowTaskViewModal(true)
  }

  const closeTaskViewModal = () => {
    setShowTaskViewModal(false)
    setSelectedInternship(null)
  }

  const handleTaskChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const updated = [...tasks]
    updated[index] = { ...updated[index], [name]: value }
    setTasks(updated)
  }

  const addTask = () => setTasks([...tasks, { title: "", description: "", exercise: "", test: "" }])

  const removeTask = (indexToRemove: number) => {
    setTasks(tasks.filter((_, i) => i !== indexToRemove))
  }

  const handleUpdateTasks = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInternship?._id) {
      setUploadMessage("No internship selected for task update.")
      return
    }

    const validTasks = tasks
      .filter((t) => t.title.trim() && t.description.trim())
      .map((task, i) => ({ ...task, day: task.day || i + 1 }))

    const form = new FormData()
    form.append("tasks", JSON.stringify(validTasks))

    try {
      const res = await axios.put(`http://localhost:5000/api/internships/${selectedInternship._id}`, form)
      setUploadMessage("Tasks updated manually successfully!")
      setSelectedInternship(res.data)
    } catch (error) {
      console.error("Error updating tasks manually", error)
      setUploadMessage("Error updating tasks manually.")
    }
  }

  const handleTaskDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskDocumentFile || !selectedInternship?._id) {
      setUploadMessage("Please select a document file first.")
      return
    }

    setUploadMessage("Uploading and parsing document...")
    const form = new FormData()
    form.append("taskDocument", taskDocumentFile)

    try {
      const res = await axios.post(
        `http://localhost:5000/api/internships/${selectedInternship._id}/upload-tasks`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )
      setUploadMessage(res.data.message || "Document uploaded and tasks parsed successfully!")
      setTasks(res.data.parsedTasks)
    } catch (error: any) {
      console.error("Error uploading task document", error)
      setUploadMessage(error.response?.data?.error || "Failed to upload and parse document.")
    } finally {
      setTaskDocumentFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTaskDocumentFile(e.target.files[0])
    } else {
      setTaskDocumentFile(null)
    }
  }

  const clearSelectedFile = () => {
    setTaskDocumentFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setTaskDocumentFile(e.dataTransfer.files[0])
    }
  }

  useEffect(() => {
    fetchInternships()
  }, [])

  return (
    <div className="p-6 min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-800 to-purple-700 p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <FaClipboardList className="text-neonpink" /> Internship Manager
          </h2>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-white text-blue-900 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition"
          >
            + Create Course
          </button>
        </div>
      </div>

      {/* Internship Cards */}
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 mt-8">
        <FaBriefcase className="text-neonpink" /> Created Internships
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((item) => (
          <div
            key={item._id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700 hover:shadow-xl transition-shadow"
          >
            {item.image && (
              <img
                src={`http://localhost:5000/uploads/${item.image}`}
                alt={item.coursename}
                className="h-40 w-full object-cover"
              />
            )}
            <div className="p-4">
              {/* Course Name */}
              <h3 className="font-bold text-lg flex items-center gap-2 mb-1">
                <FaBookOpen className="text-blue-400" />
                <span className="truncate">{item.coursename}</span>
              </h3>
              {/* Field & Duration Row */}
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{item.field}</span>
                <span>{item.duration} mo</span>
              </div>
              {/* Status Badge */}
              <div className="mb-3">
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                    item.status === "Active" ? "bg-green-700 text-green-100" : "bg-red-700 text-red-100"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              {/* Action Icons */}
              <div className="flex justify-around pt-1 border-t border-gray-700">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-yellow-400 hover:text-yellow-300 transition"
                  title="Edit Internship"
                >
                  <FaPencilAlt size={16} />
                </button>
                <button
                  onClick={() => openTaskModal(item)}
                  className="text-green-400 hover:text-green-300 transition"
                  title="Manage Tasks"
                >
                  <FaTasks size={16} />
                </button>
                <button
                  onClick={() => openTaskViewModal(item)}
                  className="text-blue-400 hover:text-blue-300 transition"
                  title="View Tasks"
                >
                  <FaRegEye size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Internship Creation / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/40">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-2xl">
            <h3 className="text-2xl font-bold mb-4">{editingId ? "Edit Internship" : "Create Internship"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="coursename"
                value={formData.coursename}
                onChange={handleChange}
                placeholder="Course Name"
                className="w-full border border-gray-600 p-2 rounded bg-gray-700"
              />
              <input
                name="field"
                value={formData.field}
                onChange={handleChange}
                placeholder="Field"
                className="w-full border border-gray-600 p-2 rounded bg-gray-700"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full border border-gray-600 p-2 rounded bg-gray-700"
              />
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full border border-gray-600 p-2 rounded bg-gray-700"
              >
                <option value="1">1 Month</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-600 p-2 rounded bg-gray-700"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {/* Image Upload Section */}
              <div className="flex flex-col gap-2">
                <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300">
                  Course Image (JPG, PNG, GIF, AVIF)
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.avif"
                  onChange={handleImageChange}
                  ref={imageInputRef}
                  className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                {imagePreviewUrl && (
                  <div className="mt-2 relative w-32 h-32 rounded-md overflow-hidden border border-gray-600">
                    <img
                      src={imagePreviewUrl || "/placeholder.svg"}
                      alt="Image Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null)
                        setImagePreviewUrl(null)
                        if (imageInputRef.current) imageInputRef.current.value = ""
                      }}
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white hover:bg-black/70"
                      title="Remove image"
                    >
                      <FaTimesCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                  {editingId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tasks Modal */}
      {showTaskModal && selectedInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/40">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaTasks /> Edit Daily Tasks - {selectedInternship.coursename}
            </h2>

            {/* Document Upload Section */}
            <div className="mb-6 p-4 border border-gray-700 rounded-md bg-gray-900">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FaFileUpload /> Upload Task Document (.docx, .txt)
              </h3>
              <form onSubmit={handleTaskDocumentUpload} className="space-y-3">
                <input
                  type="file"
                  accept=".docx,.txt"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <div
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                    isDragging ? "border-blue-500 bg-gray-700" : "border-gray-600 hover:border-gray-500"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {taskDocumentFile ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <FaCloudUploadAlt size={24} />
                      <span>{taskDocumentFile.name}</span>
                      <button type="button" onClick={clearSelectedFile} className="text-red-400 hover:text-red-300">
                        <FaTimesCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <FaCloudUploadAlt size={32} className="mx-auto mb-2" />
                      <p className="font-semibold">Drag & Drop your document here</p>
                      <p className="text-sm">or click to browse (.docx, .txt)</p>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!taskDocumentFile}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload & Parse
                </button>
                {uploadMessage && (
                  <p className={`text-sm mt-2 ${uploadMessage.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                    {uploadMessage}
                  </p>
                )}
              </form>
            </div>

            {/* Manual Task Editing Section */}
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FaPencilAlt /> Manually Edit Tasks
            </h3>
            <form onSubmit={handleUpdateTasks} className="space-y-4">
              {tasks.map((task, i) => (
                <div key={i} className="mb-4 p-3 border border-gray-600 rounded-md bg-gray-900 relative">
                  <label className="block font-medium mb-2">Day {task.day || i + 1}</label>
                  <button
                    type="button"
                    onClick={() => removeTask(i)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition"
                    title="Delete Task"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      name="title"
                      value={task.title}
                      onChange={(e) => handleTaskChange(i, e)}
                      placeholder="Title"
                      className="border border-gray-600 p-2 rounded bg-gray-700"
                    />
                    <textarea
                      name="description"
                      value={task.description}
                      onChange={(e) => handleTaskChange(i, e)}
                      placeholder="Description"
                      className="w-full border border-gray-600 p-2 rounded bg-gray-700 min-h-[60px]"
                    />
                    <input
                      name="exercise"
                      value={task.exercise || ""}
                      onChange={(e) => handleTaskChange(i, e)}
                      placeholder="Exercise (Optional)"
                      className="border border-gray-600 p-2 rounded bg-gray-700"
                    />
                    <input
                      name="test"
                      value={task.test || ""}
                      onChange={(e) => handleTaskChange(i, e)}
                      placeholder="Test (Optional)"
                      className="border border-gray-600 p-2 rounded bg-gray-700"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addTask}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
              >
                + Add Task
              </button>
              <div className="flex gap-2 justify-end">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
                  Save Manual Changes
                </button>
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Tasks Modal */}
      {showTaskViewModal && selectedInternship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/40">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaRegEye /> View Tasks - {selectedInternship.coursename}
            </h2>
            <div className="space-y-4">
              {selectedInternship.dailyTasks.length > 0 ? (
                selectedInternship.dailyTasks.map((task, index) => (
                  <div key={index} className="p-4 border border-gray-600 rounded-md bg-gray-900">
                    <h4 className="font-semibold">Day {task.day}</h4>
                    <p>
                      <strong>Title:</strong> {task.title}
                    </p>
                    <p>
                      <strong>Description:</strong> {task.description}
                    </p>
                    <p>
                      <strong>Exercise:</strong> {task.exercise || "-"}
                    </p>
                    <p>
                      <strong>Test:</strong> {task.test || "-"}
                    </p>
                  </div>
                ))
              ) : (
                <p>No tasks found.</p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500" onClick={closeTaskViewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InternshipManager
