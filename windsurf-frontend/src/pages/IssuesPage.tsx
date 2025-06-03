
import React from 'react';

const IssuesPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
        <p className="text-gray-600">Manage and track all grievances</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Issues</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center">No issues found</p>
        </div>
      </div>
    </div>
  );
};

export default IssuesPage;
