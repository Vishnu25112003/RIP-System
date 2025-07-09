import type React from "react"
import { BrowserRouter as Router } from "react-router-dom"
import { AuthProvider } from "./context/authContext"
import AppRoutes from "./router"
import ErrorBoundary from "./components/ErrorBoundary"

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
