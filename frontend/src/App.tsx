
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard';
import Issues from '@/pages/admin/Issues';
import Analytics from '@/pages/admin/Analytics';
import Feedback from '@/pages/admin/Feedback';

// Mobile Pages
import Login from '@/pages/mobile/Login';
import MobileIssues from '@/pages/mobile/Issues';
import NewIssue from '@/pages/mobile/NewIssue';
import IssueDetails from '@/pages/mobile/IssueDetails';
import MobileFeedback from '@/pages/mobile/Feedback';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/issues" element={<Issues />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/feedback" element={<Feedback />} />
          
          {/* Mobile Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/mobile/login" element={<Login />} />
          <Route path="/mobile/issues" element={<MobileIssues />} />
          <Route path="/mobile/new-issue" element={<NewIssue />} />
          <Route path="/mobile/issue/:id" element={<IssueDetails />} />
          <Route path="/mobile/feedback" element={<MobileFeedback />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
