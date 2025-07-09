"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { FaBriefcase, FaClipboardList, FaBookOpen, FaTasks, FaRegEye, FaPencilAlt } from "react-icons/fa"

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
  const [internships, setInternships] = useState<Internship[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [tasks, setTasks] = useState<Task[]>([{ title: "", description: "", exercise: "", test: "" }])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showTaskViewModal, setShowTaskViewModal] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

    const validTasks = tasks
      .filter((t) => t.title.trim() && t.description.trim())
      .map((task, i) => ({ ...task, day: i + 1 }))

    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => form.append(key, value))
    if (image) form.append("image", image)
    form.append("tasks", JSON.stringify(validTasks))

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/internships/${editingId}`, form)
      } else {
        await axios.post("http://localhost:5000/api/internships", form)
      }
      resetForm()
      fetchInternships()
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
    setEditingId(null)
    setTasks([{ title: "", description: "", exercise: "", test: "" }])
    setShowForm(false)
  }

  const handleEdit = (internship: Internship) => {
    setFormData({
      coursename: internship.coursename,
      field: internship.field,
      description: internship.description,
      duration: internship.duration,
      status: internship.status,
    })
    setImage(null)
    setEditingId(internship._id)
    setTasks(internship.dailyTasks)
    setShowForm(true)
  }

  const openTaskModal = (internship: Internship) => {
    setSelectedInternship(internship)
    setTasks(
      internship.dailyTasks.length > 0
        ? [...internship.dailyTasks]
        : [{ title: "", description: "", exercise: "", test: "" }],
    )
    setShowTaskModal(true)
  }

  const closeTaskModal = () => {
    setShowTaskModal(false)
    setSelectedInternship(null)
  }

  const openTaskViewModal = (internship: Internship) => {
    setSelectedInternship(internship)
    setShowTaskViewModal(true)
  }

  const closeTaskViewModal = () => {
    setShowTaskViewModal(false)
    setSelectedInternship(null)
  }

  const handleTaskChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updated = [...tasks]
    updated[index] = { ...updated[index], [name]: value }
    setTasks(updated)
  }

  const addTask = () => setTasks([...tasks, { title: "", description: "", exercise: "", test: "" }])

  const handleUpdateTasks = async (e: React.FormEvent) => {
    e.preventDefault()
    const validTasks = tasks
      .filter((t) => t.title.trim() && t.description.trim())
      .map((task, i) => ({ ...task, day: i + 1 }))

    const form = new FormData()
    form.append("tasks", JSON.stringify(validTasks))

    try {
      await axios.put(`http://localhost:5000/api/internships/${selectedInternship?._id}`, form)
      closeTaskModal()
      fetchInternships()
    } catch (error) {
      console.error("Error updating tasks", error)
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
            <FaClipboardList className=" text-neonpink" /> Internship Manager
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
        <FaBriefcase className=" text-neonpink" /> Created Internships
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
              <input
                type="file"
                onChange={(e) => e.target.files && setImage(e.target.files[0])}
                className="w-full border border-gray-600 p-2 rounded bg-gray-700"
              />
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
            <form onSubmit={handleUpdateTasks} className="space-y-4">
              {tasks.map((task, i) => (
                <div key={i} className="mb-4 p-3 border border-gray-600 rounded-md bg-gray-900">
                  <label className="block font-medium mb-2">Day {i + 1}</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      name="title"
                      value={task.title}
                      onChange={(e) => handleTaskChange(i, e)}
                      placeholder="Title"
                      className="border border-gray-600 p-2 rounded bg-gray-700"
                    />
                    <input
                      name="description"
                      value={task.description}
                      onChange={(e) => handleTaskChange(i, e)}
                      placeholder="Description"
                      className="border border-gray-600 p-2 rounded bg-gray-700"
                    />
                    <input
                      name="exercise"
                      value={task.exercise || ""}
                      onChange={(e) => handleTaskChange(i, e)}
                      placeholder="Exercise"
                      className="border border-gray-600 p-2 rounded bg-gray-700"
                    />
                    <input
                      name="test"
                      value={task.test || ""}
                      onChange={(e) => handleTaskChange(i, e)}
                      placeholder="Test"
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
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                >
                  Cancel
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
                    <h4 className="font-semibold">Day {index + 1}</h4>
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
