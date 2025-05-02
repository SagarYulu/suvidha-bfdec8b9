
import React from "react";

const DashboardLoader = () => {
  return (
    <div className="flex justify-center items-center py-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
      <span className="ml-3 text-lg text-gray-600">Loading dashboard data...</span>
    </div>
  );
};

export default DashboardLoader;
