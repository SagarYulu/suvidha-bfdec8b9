
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserMetadata {
  city: string;
  cluster: string;
  role: string;
}

interface UserMetadataCardProps {
  metadata: UserMetadata;
  showMetadata: boolean;
  toggleMetadata: () => void;
}

const UserMetadataCard: React.FC<UserMetadataCardProps> = ({
  metadata,
  showMetadata,
  toggleMetadata
}) => {
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="self-end text-gray-700 hover:bg-white hover:bg-opacity-15"
              onClick={toggleMetadata}
            >
              <Info className="h-4 w-4 mr-1" />
              Your Info
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view what information will be sent with your feedback</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showMetadata && (
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Your Information</h3>
          <div className="text-xs text-gray-800">
            <div className="flex justify-between py-1 border-b border-gray-700/20">
              <span>City:</span>
              <span className="font-medium">{metadata.city}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-700/20">
              <span>Cluster:</span>
              <span className="font-medium">{metadata.cluster}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Role:</span>
              <span className="font-medium">{metadata.role}</span>
            </div>
          </div>
          <p className="text-xs text-gray-700 mt-2">
            This information helps us categorize feedback appropriately.
          </p>
        </div>
      )}
    </>
  );
};

export default UserMetadataCard;
