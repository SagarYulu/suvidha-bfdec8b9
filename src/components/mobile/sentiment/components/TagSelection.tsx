
import React from 'react';

interface TagSelectionProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const TagSelection: React.FC<TagSelectionProps> = ({
  selectedTags,
  onTagToggle
}) => {
  // Only render if there are tags selected
  if (selectedTags.length === 0) return null;
  
  return (
    <div className="bg-white/25 rounded-xl p-4 backdrop-blur-sm">
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-800">
          Selected topics:
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <div key={tag} className="bg-yulu-dashboard-blue text-white text-xs rounded-full px-3 py-1 flex items-center">
            {tag}
            <button 
              className="ml-1 hover:text-white/80" 
              onClick={() => onTagToggle(tag)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagSelection;
