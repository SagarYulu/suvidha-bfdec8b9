
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import SentimentOverview from '@/components/admin/sentiment/SentimentOverview';
import { useSentiment } from '@/hooks/useSentiment';

const SentimentPage: React.FC = () => {
  const [filters, setFilters] = useState({});
  const { data, isLoading, error } = useSentiment(filters);

  if (isLoading) {
    return (
      <AdminLayout title="Sentiment Analysis">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Sentiment Analysis">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Sentiment Analysis">
      <div className="space-y-6">
        {data && <SentimentOverview data={data} />}
      </div>
    </AdminLayout>
  );
};

export default SentimentPage;
