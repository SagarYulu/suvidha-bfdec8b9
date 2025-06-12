
import React from 'react';

const DashboardLoader: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Metrics Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-lg border animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>

      {/* Table Loading */}
      <div className="bg-white p-6 rounded-lg border animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardLoader;
