
import React from 'react';
import { Link } from 'react-router-dom';
import FeedbackButton from '../FeedbackButton';

interface IssuesListProps {
  issues: any[];
  isLoading: boolean;
}

const IssuesList: React.FC<IssuesListProps> = ({ issues, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="mobile-card bg-white animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="mobile-card bg-white">
          <p className="text-gray-600">No issues found</p>
        </div>
        <FeedbackButton />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex flex-col space-y-4">
        {issues.map(issue => (
          <Link key={issue.id} to={`/mobile/issues/${issue.id}`}>
            <div className="mobile-card bg-white">
              <h3 className="font-semibold">{issue.title || 'Untitled Issue'}</h3>
              <p className="text-sm text-gray-600">
                {issue.status || 'No Status'} • {issue.created_at_formatted || 'Unknown date'}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <FeedbackButton />
    </div>
  );
};

export default IssuesList;
