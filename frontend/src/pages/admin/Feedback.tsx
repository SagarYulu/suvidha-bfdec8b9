
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import FeedbackAnalyticsPage from '@/components/admin/feedback/FeedbackAnalyticsPage';

const Feedback: React.FC = () => {
  return (
    <AdminLayout>
      <FeedbackAnalyticsPage />
    </AdminLayout>
  );
};

export default Feedback;
