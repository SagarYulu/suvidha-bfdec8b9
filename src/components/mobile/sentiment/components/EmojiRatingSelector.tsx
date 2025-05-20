
import React from 'react';
import { cn } from '@/lib/utils';

interface EmojiRatingSelectorProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const EmojiRatingSelector: React.FC<EmojiRatingSelectorProps> = ({
  rating,
  onRatingChange
}) => {
  // Emoji based on rating
  const getEmoji = (currentRating: number) => {
    if (currentRating === 1) return "😡";
    if (currentRating === 2) return "🙁";
    if (currentRating === 3) return "😐";
    if (currentRating === 4) return "🙂";
    return "😊";
  };

  // Mood text based on rating
  const getMoodText = (currentRating: number) => {
    if (currentRating === 1) return "Very Unhappy";
    if (currentRating === 2) return "Unhappy";
    if (currentRating === 3) return "Neutral";
    if (currentRating === 4) return "Happy";
    return "Very Happy";
  };

  return (
    <div className="flex flex-col space-y-2 mt-2">
      {[5, 4, 3, 2, 1].map((value) => (
        <button
          key={value}
          className={cn(
            "flex items-center py-3 px-4 rounded-lg transition-colors",
            rating === value 
              ? "bg-amber-400 text-gray-800 font-semibold" 
              : "bg-amber-200 hover:bg-amber-300 text-gray-800"
          )}
          onClick={() => onRatingChange(value)}
        >
          <span className="text-xl mr-3">{getEmoji(value)}</span>
          <span className="font-medium">{getMoodText(value)}</span>
        </button>
      ))}
    </div>
  );
};

export default EmojiRatingSelector;
