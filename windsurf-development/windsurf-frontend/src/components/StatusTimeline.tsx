
import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  user?: string;
  description?: string;
}

interface Issue {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  priority: string;
  description: string;
}

interface StatusTimelineProps {
  issues: Issue[];
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'resolved':
    case 'closed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'in_progress':
    case 'in progress':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'open':
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    default:
      return <XCircle className="w-4 h-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'resolved':
    case 'closed':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'open':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ issues }) => {
  // Sort issues by most recent activity
  const sortedIssues = [...issues].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 10); // Show only last 10 activities

  if (!sortedIssues.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-lg font-medium">No recent activity</p>
          <p className="text-sm">Issue timeline will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {sortedIssues.map((issue, index) => (
        <div key={issue.id} className="flex items-start space-x-3">
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            <div className="p-1 bg-white border-2 border-gray-200 rounded-full">
              {getStatusIcon(issue.status)}
            </div>
            {index < sortedIssues.length - 1 && (
              <div className="w-px h-12 bg-gray-200 mt-2" />
            )}
          </div>
          
          {/* Event content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}
                >
                  {issue.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  #{issue.id.slice(0, 8)}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {formatTimeAgo(issue.updated_at)}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mt-1 truncate">
              {issue.description}
            </p>
            
            {/* Priority indicator */}
            <div className="flex items-center mt-2 space-x-2">
              <span className={`px-2 py-0.5 rounded text-xs ${
                issue.priority === 'high' || issue.priority === 'critical' 
                  ? 'bg-red-100 text-red-700'
                  : issue.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {issue.priority.toUpperCase()}
              </span>
              <span className="text-xs text-gray-500">
                Created {formatTimeAgo(issue.created_at)}
              </span>
            </div>
          </div>
        </div>
      ))}
      
      {/* View more indicator */}
      {issues.length > 10 && (
        <div className="text-center pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusTimeline;
