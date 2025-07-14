"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiActivity,
  FiAward,
  FiFile,
  FiCheckCircle,
  FiFileText,
  FiRefreshCw,
} from "react-icons/fi"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts" // Changed to AreaChart and Area
import { motion } from "framer-motion"

interface DashboardStats {
  totalRegisteredUsers: number
  totalAuthUsers: number
  activeInternships: number
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  totalTaskSubmissions: number
  totalEnrollments: number
  certificatesIssued: number
}

interface LatestUser {
  _id: string
  name: string
  mailid: string
  status: string
}

interface ActivityDataPoint {
  date: string
  newUsers: number
  taskSubmissions: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [latestUsers, setLatestUsers] = useState<LatestUser[]>([])
  const [activityData, setActivityData] = useState<ActivityDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const [statsRes, usersRes, activityRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/dashboard/stats"),
        fetch("http://localhost:5000/api/admin/dashboard/latest-users"),
        fetch("http://localhost:5000/api/admin/dashboard/weekly-activity"),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      } else {
        throw new Error(`Failed to fetch stats: ${statsRes.statusText}`)
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setLatestUsers(data.data)
      } else {
        throw new Error(`Failed to fetch latest users: ${usersRes.statusText}`)
      }

      if (activityRes.ok) {
        const data = await activityRes.json()
        setActivityData(data.data)
      } else {
        throw new Error(`Failed to fetch activity data: ${activityRes.statusText}`)
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err)
      setError(err.message || "Failed to load dashboard data.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="ml-4 text-lg">Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">
        <p className="text-lg">Error: {error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Retry</span>
        </motion.button>
      </div>
    )
  }

  const displayStats = [
    {
      title: "Registered Users",
      value: stats?.totalRegisteredUsers ?? 0,
      icon: <FiUsers className="text-3xl text-neonpink" />,
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications ?? 0,
      icon: <FiUserCheck className="text-3xl text-neonpink" />,
    },
    {
      title: "Active Internships",
      value: stats?.activeInternships ?? 0,
      icon: <FiBookOpen className="text-3xl text-neonpink" />,
    },
    {
      title: "Total Submissions",
      value: stats?.totalTaskSubmissions ?? 0,
      icon: <FiActivity className="text-3xl text-neonpink" />,
    },
    {
      title: "Certificates Issued",
      value: stats?.certificatesIssued ?? 0,
      icon: <FiAward className="text-3xl text-neonpink" />,
    },
  ]

  const quickActions = [
    {
      label: "Create Internship",
      icon: <FiFile className="text-3xl text-neonpink" />,
      path: "/admin/internships",
    },
    {
      label: "View Applications",
      icon: <FiCheckCircle className="text-3xl text-neonpink" />,
      path: "/admin/applications",
    },
    {
      label: "View User Activity",
      icon: <FiFileText className="text-3xl text-neonpink" />,
      path: "/admin/user-activity",
    },
    {
      label: "Manage Certificates",
      icon: <FiAward className="text-3xl text-neonpink" />,
      path: "/admin/certificates",
    },
  ]

  return (
    <div className="p-10 text-white bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          disabled={refreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </motion.button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {displayStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <div>{stat.icon}</div>
              <div>
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-md text-gray-400">{stat.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Graph Section (Area Chart) */}
      <div className="bg-gray-800 p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Weekly Activity Overview (New Users & Submissions)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a66cff" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a66cff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTaskSubmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", padding: "10px" }}
              labelStyle={{ color: "#fff", fontWeight: "bold" }}
              itemStyle={{ color: "#fff" }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px", color: "#ccc" }} />
            <Area
              type="monotone"
              dataKey="newUsers"
              stroke="#a66cff"
              fillOpacity={1}
              fill="url(#colorNewUsers)"
              name="New Users"
            />
            <Area
              type="monotone"
              dataKey="taskSubmissions"
              stroke="#4ade80"
              fillOpacity={1}
              fill="url(#colorTaskSubmissions)"
              name="Task Submissions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Latest Users Table */}
      <div className="bg-gray-800 p-6 rounded-xl mb-8">
        <FiUsers className="text-3xl text-neonpink mb-4" />
        <h2 className="text-xl font-semibold mb-4">Latest Registered Users</h2>
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {latestUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                  No recent users found.
                </td>
              </tr>
            ) : (
              latestUsers.map((user, idx) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-gray-800 hover:bg-gray-700 transition"
                >
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.mailid}</td>
                  <td
                    className={`py-2 px-4 font-medium ${user.status === "Active" ? "text-green-400" : "text-yellow-400"}`}
                  >
                    {user.status}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <motion.a
              key={idx}
              href={action.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-center"
            >
              <span className="text-4xl text-neonpink">{action.icon}</span>
              <span className="text-lg font-medium">{action.label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
