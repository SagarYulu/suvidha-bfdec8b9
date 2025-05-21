
import React from 'react';

interface FeedbackStarsProps {
  rating?: number;
  readOnly?: boolean;
  size?: number;
}

const FeedbackStars: React.FC<FeedbackStarsProps> = ({ 
  rating = 0,
  readOnly = true,
  size = 24 
}) => {
  return (
    <div className="flex">
      {/* Placeholder for stars that might be referenced elsewhere */}
      <span className="text-gray-400">Feature removed</span>
    </div>
  );
};

export default FeedbackStars;
