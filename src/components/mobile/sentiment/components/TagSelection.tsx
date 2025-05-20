
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TagSelectionProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const TagSelection: React.FC<TagSelectionProps> = ({ 
  selectedTags, 
  onTagToggle
}) => {
  if (selectedTags.length === 0) return null;
  
  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-gray-800 mb-2">Related topics:</p>
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-gray-800 cursor-pointer px-3 py-1"
            onClick={() => onTagToggle(tag)}
          >
            {tag} ×
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagSelection;
