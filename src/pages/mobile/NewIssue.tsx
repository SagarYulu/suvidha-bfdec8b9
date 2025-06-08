
import React from 'react';
import MobileLayout from '@/components/MobileLayout';
import IssueCreationForm from '@/components/issues/IssueCreationForm';

const MobileNewIssue: React.FC = () => {
  return (
    <MobileLayout title="Create New Issue">
      <div className="p-4">
        <IssueCreationForm />
      </div>
    </MobileLayout>
  );
};

export default MobileNewIssue;
