import React from 'react';
import { useAuth } from '../context/AuthContext';

const IssuesList = ({ isAdmin = false }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAdmin ? 'All Issues' : 'My Issues'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {isAdmin ? 'Manage all system issues' : 'View and track your issues'}
              </p>
            </div>
            <nav className="flex space-x-4">
              {isAdmin ? (
                <>
                  <a href="/admin/dashboard" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Dashboard
                  </a>
                  <a href="/admin/employees" className="text-indigo-600 hover:text-indigo-500 font-medium">
                    Employees
                  </a>
                </>
              ) : (
                <a href="/employee/dashboard" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Dashboard
                </a>
              )}
              <button 
                onClick={logout}
                className="text-red-600 hover:text-red-500 font-medium"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Issues Management</h3>
              <p className="text-gray-500">
                {isAdmin ? 'View and manage all employee issues' : 'Submit and track your issues'}
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  {isAdmin ? 'View All Issues' : 'Create New Issue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IssuesList;