
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
        case 2: return "#FEC6A1"; // Orange
        case 3: return "#FEF7CD"; // Yellow
        case 4: return "#F2FCE2"; // Light Green
        case 5: return "#8B5CF6"; // Green
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

  return (
    <div className="flex flex-col items-center">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((starPosition) => (
          <div 
            key={starPosition}
            className="cursor-pointer p-1"
            onMouseEnter={() => !readOnly && setHoverRating(starPosition)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            onClick={() => !readOnly && onChange && onChange(starPosition)}
          >
            <Star
              size={size}
              fill={getStarColor(starPosition, hoverRating || rating)}
              stroke={getStarColor(starPosition, hoverRating || rating)}
              className={`transition-colors ${!readOnly ? "hover:scale-110" : ""}`}
            />
          </div>
        ))}
      </div>
      {rating > 0 && (
        <div className="mt-1 text-center text-lg">
          {getEmoji(rating)}
        </div>
      )}
    </div>
  );
};

export default FeedbackStars;
