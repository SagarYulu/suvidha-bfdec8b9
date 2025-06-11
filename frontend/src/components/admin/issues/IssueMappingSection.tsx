
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Save, AlertTriangle } from 'lucide-react';
import { Issue } from '@/types';

interface IssueMappingSectionProps {
  issue: Issue;
  onMappingUpdate: (typeId: string, subTypeId: string) => void;
  isLoading?: boolean;
}

const IssueMappingSection: React.FC<IssueMappingSectionProps> = ({
  issue,
  onMappingUpdate,
  isLoading = false
}) => {
  const [selectedType, setSelectedType] = useState(issue.mappedTypeId || '');
  const [selectedSubType, setSelectedSubType] = useState(issue.mappedSubTypeId || '');
  const [isSaving, setIsSaving] = useState(false);

  const issueTypes = [
    { id: '1', label: 'Technical Issue' },
    { id: '2', label: 'Account Issue' },
    { id: '3', label: 'Service Request' },
    { id: '4', label: 'Billing Issue' }
  ];

  const subTypes = {
    '1': [
      { id: '1-1', label: 'App Crash' },
      { id: '1-2', label: 'Login Problem' },
      { id: '1-3', label: 'Feature Not Working' }
    ],
    '2': [
      { id: '2-1', label: 'Profile Update' },
      { id: '2-2', label: 'Password Reset' },
      { id: '2-3', label: 'Account Verification' }
    ],
    '3': [
      { id: '3-1', label: 'Information Request' },
      { id: '3-2', label: 'Document Request' },
      { id: '3-3', label: 'General Inquiry' }
    ],
    '4': [
      { id: '4-1', label: 'Payment Issue' },
      { id: '4-2', label: 'Refund Request' },
      { id: '4-3', label: 'Invoice Problem' }
    ]
  };

  const handleSave = async () => {
    if (!selectedType || !selectedSubType) return;

    setIsSaving(true);
    try {
      await onMappingUpdate(selectedType, selectedSubType);
    } finally {
      setIsSaving(false);
    }
  };

  const needsMapping = !issue.mappedTypeId || !issue.mappedSubTypeId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Issue Mapping
          {needsMapping && (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Mapping
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsMapping && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              This issue needs to be mapped to appropriate categories for better tracking and analytics.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Issue Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sub Type</label>
            <Select 
              value={selectedSubType} 
              onValueChange={setSelectedSubType}
              disabled={!selectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sub type" />
              </SelectTrigger>
              <SelectContent>
                {selectedType && subTypes[selectedType as keyof typeof subTypes]?.map(subType => (
                  <SelectItem key={subType.id} value={subType.id}>
                    {subType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {issue.mappedAt && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Last mapped by {issue.mappedBy} on {new Date(issue.mappedAt).toLocaleString()}
          </div>
        )}

        <Button 
          onClick={handleSave}
          disabled={!selectedType || !selectedSubType || isSaving || isLoading}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Mapping'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default IssueMappingSection;
