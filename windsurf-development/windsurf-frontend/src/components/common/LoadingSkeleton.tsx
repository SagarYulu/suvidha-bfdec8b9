
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'dashboard' | 'list';
  rows?: number;
}

const LoadingSkeleton = ({ type = 'card', rows = 3 }: LoadingSkeletonProps) => {
  if (type === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="p-6 border rounded-lg">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-32" />
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0 flex items-center space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg">
          <Skeleton className="h-4 w-48 mb-3" />
          <Skeleton className="h-3 w-32 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
