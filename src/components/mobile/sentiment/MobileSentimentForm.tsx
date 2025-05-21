
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface MobileSentimentFormProps {
  showTrendAnalysis?: boolean;
}

const MobileSentimentForm: React.FC<MobileSentimentFormProps> = ({ showTrendAnalysis = false }) => {
  const { authState } = useAuth();

  return (
    <div className="p-4 flex flex-col gap-4 pb-32 max-h-[90vh] overflow-y-auto">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">
          Sentiment Form Removed
        </h2>
        <p className="text-gray-700 text-sm">This functionality has been removed</p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
        <p className="text-yellow-800">
          The sentiment analysis functionality is no longer available.
        </p>
      </div>
    </div>
  );
};

export default MobileSentimentForm;
