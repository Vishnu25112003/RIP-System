"use client"

import type React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/authContext"

// Auth components
import Signin from "./auth/Signin"
import OrganizationSignup from "./auth/OrganizationSignin"
import Login from "./auth/Login"

// Admin and User Apps
import AdminApp from "./components/admin/AdminApp"
import UserApp from "./components/user/UserApp"

// Test component
import TestComponent from "./components/TestComponent"

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
)

// Protected Route component
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "Admin" | "User"
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    if (user?.role === "Admin") {
      return <Navigate to="/admin/dashboard" replace />
    } else {
      return <Navigate to="/user/home" replace />
    }
  }

  return <>{children}</>
}

// Public Route component (redirect if already authenticated)
interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (isAuthenticated) {
    // Redirect based on role
    if (user?.role === "Admin") {
      return <Navigate to="/admin/dashboard" replace />
    } else {
      return <Navigate to="/user/home" replace />
    }
  }

  return <>{children}</>
}

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Test route */}
      <Route path="/test" element={<TestComponent />} />

      {/* Public Routes */}
      <Route
        path="/auth/signin"
        element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/organization-signup"
        element={
          <PublicRoute>
            <OrganizationSignup />
          </PublicRoute>
        }
      />
      <Route
        path="/auth/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="Admin">
            <AdminApp />
          </ProtectedRoute>
        }
      />

      {/* Protected User Routes */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute requiredRole="User">
            <UserApp />
          </ProtectedRoute>
        }
      />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/auth/login" replace />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  )
}

export default AppRoutes
