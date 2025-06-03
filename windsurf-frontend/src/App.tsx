
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Issues } from './pages/Issues'
import { IssueDetails } from './pages/IssueDetails'
import { NewIssue } from './pages/NewIssue'
import { Profile } from './pages/Profile'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="issues" element={<Issues />} />
            <Route path="issues/:id" element={<IssueDetails />} />
            <Route path="new-issue" element={<NewIssue />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
