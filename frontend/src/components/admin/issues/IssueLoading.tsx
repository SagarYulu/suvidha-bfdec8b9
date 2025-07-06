
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const IssueLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Details Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-8 w-20 ml-auto" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Employee Information */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-center mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i}>
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg border">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueLoading;
