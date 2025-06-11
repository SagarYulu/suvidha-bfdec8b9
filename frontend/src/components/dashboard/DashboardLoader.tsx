
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const DashboardLoader: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Metrics Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((index) => (
          <Card key={index}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Loading */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardLoader;
