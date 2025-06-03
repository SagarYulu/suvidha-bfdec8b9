
import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import IssuesPage from './pages/IssuesPage'
import IssueDetailPage from './pages/IssueDetailPage'
import CreateIssuePage from './pages/CreateIssuePage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from './components/ui/toaster'

function App() {
  // Mock authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/create-issue" element={<CreateIssuePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
