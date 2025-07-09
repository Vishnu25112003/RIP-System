
"use client"

import type React from "react"
import { useAuth } from "../context/authContext"

const TestComponent: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>Auth Status Test</h3>
      <p>Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
      <p>User: {user ? user.name : "None"}</p>
      <p>Role: {user ? user.role : "None"}</p>
    </div>
  )
}

export default TestComponent
