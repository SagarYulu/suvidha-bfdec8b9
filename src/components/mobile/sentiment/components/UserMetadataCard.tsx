
import React from 'react';
import { InfoIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface UserMetadataCardProps {
  metadata: {
    city: string;
    cluster: string;
    role: string;
  };
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
      <button
        onClick={toggleMetadata}
        className="flex items-center justify-center mx-auto px-4 py-2 bg-white/50 hover:bg-white/60 rounded-full text-gray-800 text-sm transition-colors"
      >
        <InfoIcon className="w-4 h-4 mr-1" />
        {showMetadata ? "Hide Details" : "Review Your Details"}
        {showMetadata ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4" />
        )}
      </button>
      
      {showMetadata && (
        <Card className="bg-white/70 border-amber-200">
          <CardContent className="pt-4 pb-2 px-4">
            <dl className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <dt className="font-medium text-gray-800">City:</dt>
                <dd className="text-gray-700">{metadata.city}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium text-gray-800">Cluster:</dt>
                <dd className="text-gray-700">{metadata.cluster}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium text-gray-800">Role:</dt>
                <dd className="text-gray-700">{metadata.role}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default UserMetadataCard;
