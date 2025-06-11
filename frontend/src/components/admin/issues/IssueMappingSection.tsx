
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Save, RotateCcw } from 'lucide-react';
import { ISSUE_TYPES } from '@/config/issueTypes';

interface IssueMappingSectionProps {
  issueId: string;
  currentTypeId: string;
  currentSubTypeId: string;
  mappedTypeId?: string;
  mappedSubTypeId?: string;
  onSaveMapping: (typeId: string, subTypeId: string) => void;
  canEdit?: boolean;
  isLoading?: boolean;
}

const IssueMappingSection: React.FC<IssueMappingSectionProps> = ({
  issueId,
  currentTypeId,
  currentSubTypeId,
  mappedTypeId,
  mappedSubTypeId,
  onSaveMapping,
  canEdit = false,
  isLoading = false
}) => {
  const [selectedTypeId, setSelectedTypeId] = useState(mappedTypeId || currentTypeId);
  const [selectedSubTypeId, setSelectedSubTypeId] = useState(mappedSubTypeId || currentSubTypeId);
  const [isSaving, setIsSaving] = useState(false);

  const getCurrentTypeLabel = () => {
    const type = ISSUE_TYPES.find(t => t.id === currentTypeId);
    return type ? type.label : currentTypeId;
  };

  const getCurrentSubTypeLabel = () => {
    const type = ISSUE_TYPES.find(t => t.id === currentTypeId);
    if (!type) return currentSubTypeId;
    const subType = type.subTypes.find(st => st.id === currentSubTypeId);
    return subType ? subType.label : currentSubTypeId;
  };

  const getSelectedTypeLabel = () => {
    const type = ISSUE_TYPES.find(t => t.id === selectedTypeId);
    return type ? type.label : selectedTypeId;
  };

  const getSelectedSubTypeLabel = () => {
    const type = ISSUE_TYPES.find(t => t.id === selectedTypeId);
    if (!type) return selectedSubTypeId;
    const subType = type.subTypes.find(st => st.id === selectedSubTypeId);
    return subType ? subType.label : selectedSubTypeId;
  };

  const getSubTypesForSelectedType = () => {
    const type = ISSUE_TYPES.find(t => t.id === selectedTypeId);
    return type ? type.subTypes : [];
  };

  const handleSave = async () => {
    if (!canEdit || isSaving) return;

    setIsSaving(true);
    try {
      await onSaveMapping(selectedTypeId, selectedSubTypeId);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedTypeId(currentTypeId);
    setSelectedSubTypeId(currentSubTypeId);
  };

  const hasChanges = selectedTypeId !== (mappedTypeId || currentTypeId) || 
                    selectedSubTypeId !== (mappedSubTypeId || currentSubTypeId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Issue Type Mapping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original Classification */}
        <div>
          <h4 className="font-medium mb-2">Original Classification</h4>
          <div className="flex gap-2">
            <Badge variant="outline">{getCurrentTypeLabel()}</Badge>
            <Badge variant="outline">{getCurrentSubTypeLabel()}</Badge>
          </div>
        </div>

        {/* Current/Mapped Classification */}
        {(mappedTypeId || mappedSubTypeId) && (
          <div>
            <h4 className="font-medium mb-2">Current Classification</h4>
            <div className="flex gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {getSelectedTypeLabel()}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {getSelectedSubTypeLabel()}
              </Badge>
            </div>
          </div>
        )}

        {canEdit && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Update Classification</h4>
            
            {/* Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Issue Type</label>
              <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Issue Sub Type</label>
              <Select 
                value={selectedSubTypeId} 
                onValueChange={setSelectedSubTypeId}
                disabled={!selectedTypeId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getSubTypesForSelectedType().map(subType => (
                    <SelectItem key={subType.id} value={subType.id}>
                      {subType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || isSaving || isLoading}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Mapping'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueMappingSection;
