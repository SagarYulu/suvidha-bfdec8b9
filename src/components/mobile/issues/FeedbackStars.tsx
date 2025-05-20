
import React, { useState, useCallback } from "react";
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
  
  // Color mappings for the stars - using the specified Uber-style colors
  const getStarColor = (starPosition: number, currentRating: number) => {
    if (starPosition <= currentRating) {
      switch(currentRating) {
        case 1: return "#FF3B30"; // Red
        case 2: return "#FF6A33"; // Orange-Red
        case 3: return "#FFA500"; // Orange
        case 4: return "#FFD700"; // Yellow-Orange
        case 5: return "#FFC300"; // Golden
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
      case 3: return "😐"; // Neutral
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
      case 3: return "Neutral / तटस्थ";
      case 4: return "Happy / खुश";
      case 5: return "Very Happy / बहुत खुश";
      default: return "";
    }
  };

  // Memoize star rendering to prevent flickering
  const renderStar = useCallback((position: number, activeRating: number) => {
    const color = getStarColor(position, activeRating);
    
    return (
      <div 
        key={position}
        className={`cursor-pointer p-1 transition-transform duration-150 ${!readOnly && activeRating >= position ? 'scale-105' : ''}`}
        onMouseEnter={() => !readOnly && setHoverRating(position)}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
        onClick={() => !readOnly && onChange && onChange(position)}
      >
        <Star
          size={size}
          fill={color}
          stroke={color}
          strokeWidth={1.5}
          className="transition-colors"
          // Remove any default rounded corners
          style={{ 
            shapeRendering: "geometricPrecision",
            transform: "scale(1)",
          }}
        />
      </div>
    );
  }, [readOnly, onChange, size]);
  
  const activeRating = hoverRating || rating;

  return (
    <div className="flex flex-col items-center space-y-3">
      {activeRating > 0 && (
        <div className="flex flex-col items-center animate-fade-in">
          <div className="text-3xl mb-1">
            {getEmoji(activeRating)}
          </div>
          <div className="text-sm text-center font-medium">
            {getMoodLabel(activeRating)}
          </div>
        </div>
      )}
      
      <div className="flex justify-center">
        {[1, 2, 3, 4, 5].map((position) => renderStar(position, activeRating))}
      </div>
    </div>
  );
};

export default FeedbackStars;
