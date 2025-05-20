
import React, { useState } from "react";
import { Star } from "lucide-react";

interface FeedbackStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: number;
}

const FeedbackStars: React.FC<FeedbackStarsProps> = ({
  rating,
  onChange,
  readOnly = false,
  size = 24
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  // Color mappings for the stars
  const getStarColor = (starPosition: number, currentRating: number) => {
    if (starPosition <= currentRating) {
      switch(currentRating) {
        case 1: return "#ea384c"; // Red
        case 2: return "#F97316"; // Orange 
        case 3: return "#FEF7CD"; // Yellow
        case 4: return "#F2FCE2"; // Light Green
        case 5: return "#FFD700"; // Golden
        default: return "#8E9196"; // Gray
      }
    }
    return "#8E9196"; // Gray for unselected
  };
  
  // Get emoji based on rating
  const getEmoji = (rating: number) => {
    switch(rating) {
      case 1: return "😠"; // Very Unhappy
      case 2: return "😕"; // Unhappy
      case 3: return "😐"; // Not Sure
      case 4: return "🙂"; // Happy
      case 5: return "🤩"; // Very Happy
      default: return "";
    }
  };

  // Get mood label based on rating
  const getMoodLabel = (rating: number) => {
    switch(rating) {
      case 1: return "Very Unhappy / बहुत नाखुश";
      case 2: return "Unhappy / नाखुश";
      case 3: return "Not Sure / अनिश्चित";
      case 4: return "Happy / खुश";
      case 5: return "Very Happy / बहुत खुश";
      default: return "";
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="flex flex-col items-center space-y-2">
      {activeRating > 0 && (
        <div className="flex flex-col items-center animate-fade-in">
          <div className="text-2xl mb-1">
            {getEmoji(activeRating)}
          </div>
          <div className="text-sm text-center font-medium">
            {getMoodLabel(activeRating)}
          </div>
        </div>
      )}
      
      <div className="flex">
        {[1, 2, 3, 4, 5].map((starPosition) => (
          <div 
            key={starPosition}
            className={`cursor-pointer p-1 transition-transform duration-200 ${!readOnly && activeRating >= starPosition ? 'scale-110' : ''}`}
            onMouseEnter={() => !readOnly && setHoverRating(starPosition)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            onClick={() => !readOnly && onChange && onChange(starPosition)}
          >
            <Star
              size={size}
              fill={getStarColor(starPosition, activeRating)}
              stroke={getStarColor(starPosition, activeRating)}
              className="transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackStars;
