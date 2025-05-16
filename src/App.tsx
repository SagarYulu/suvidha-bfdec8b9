import React, { Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
// Admin pages
import Login from '@/pages/admin/Login';
import Dashboard from '@/pages/admin/Dashboard';
import Users from '@/pages/admin/Users';
import Issues from '@/pages/admin/Issues';
import IssueDetails from '@/pages/admin/IssueDetails';
import AssignedIssues from '@/pages/admin/AssignedIssues';
import Analytics from '@/pages/admin/Analytics';
import AccessControl from '@/pages/admin/AccessControl';
import Settings from '@/pages/admin/Settings';
import AddDashboardUser from '@/pages/admin/dashboard-users/AddDashboardUser';
import SentimentAnalysis from '@/pages/admin/SentimentAnalysis';
import TestDataGenerator from '@/pages/admin/TestDataGenerator';

// Mobile pages
import MobileIndex from '@/pages/mobile/Index';
import MobileLogin from '@/pages/mobile/Login';
import MobileIssues from '@/pages/mobile/Issues';
import MobileIssueDetails from '@/pages/mobile/IssueDetails';
import MobileAssignedIssues from '@/pages/mobile/AssignedIssues';
import MobileSettings from '@/pages/mobile/Settings';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    document.title = 'Employee Support System';
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Index />,
      errorElement: <NotFound />,
    },
    {
      path: '/mobile',
      children: [
        {
          path: '',
          element: <MobileIndex />,
        },
        {
          path: 'login',
          element: <MobileLogin />,
        },
        {
          path: 'issues',
          element: <MobileIssues />,
        },
        {
          path: 'issues/:id',
          element: <MobileIssueDetails />,
        },
        {
          path: 'assigned-issues',
          element: <MobileAssignedIssues />,
        },
        {
          path: 'settings',
          element: <MobileSettings />,
        },
      ],
    },
    {
      path: '/admin',
      children: [
        {
          path: 'login',
          element: <Login />,
        },
        {
          path: 'dashboard',
          element: <Dashboard />,
        },
        {
          path: 'users',
          element: <Users />,
        },
        {
          path: 'issues',
          element: <Issues />,
        },
        {
          path: 'issues/:id',
          element: <IssueDetails />,
        },
        {
          path: 'assigned-issues',
          element: <AssignedIssues />,
        },
        {
          path: 'analytics',
          element: <Analytics />,
        },
        {
          path: 'access-control',
          element: <AccessControl />,
        },
        {
          path: 'settings',
          element: <Settings />,
        },
        {
          path: 'add-dashboard-user',
          element: <AddDashboardUser />,
        },
		    {
          path: 'sentiment-analysis',
          element: <SentimentAnalysis />,
        },
      ],
    },
  ]);

  // Admin routes
  const adminRoutes = [
    {
      path: "test-data-generator",
      element: <TestDataGenerator />,
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
