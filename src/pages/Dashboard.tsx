
import React from 'react';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-500">
          Please implement this dashboard page or use the admin dashboard at 
          <a href="/admin/dashboard" className="text-blue-500 hover:underline ml-1">
            /admin/dashboard
          </a>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
