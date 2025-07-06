
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Save, RotateCcw, Info } from 'lucide-react';

interface IssueMappingSectionProps {
  issueId: string;
  originalType: string;
  originalSubType: string;
  mappedType?: string;
  mappedSubType?: string;
  onSaveMapping: (typeId: string, subTypeId: string) => void;
  availableTypes: Array<{ id: string; label: string; subTypes: Array<{ id: string; label: string }> }>;
}

const IssueMappingSection: React.FC<IssueMappingSectionProps> = ({
  issueId,
  originalType,
  originalSubType,
  mappedType,
  mappedSubType,
  onSaveMapping,
  availableTypes
}) => {
  const [selectedType, setSelectedType] = useState(mappedType || '');
  const [selectedSubType, setSelectedSubType] = useState(mappedSubType || '');
  const [isSaving, setIsSaving] = useState(false);

  const selectedTypeData = availableTypes.find(type => type.id === selectedType);
  const hasChanges = selectedType !== mappedType || selectedSubType !== mappedSubType;
  const isMapped = Boolean(mappedType && mappedSubType);

  const handleSaveMapping = async () => {
    if (!selectedType || !selectedSubType) return;

    setIsSaving(true);
    try {
      await onSaveMapping(selectedType, selectedSubType);
    } catch (error) {
      console.error('Failed to save mapping:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedType(mappedType || '');
    setSelectedSubType(mappedSubType || '');
  };

  const getOriginalTypeLabel = (typeId: string) => {
    const type = availableTypes.find(t => t.id === typeId);
    return type?.label || typeId;
  };

  const getOriginalSubTypeLabel = (typeId: string, subTypeId: string) => {
    const type = availableTypes.find(t => t.id === typeId);
    const subType = type?.subTypes.find(st => st.id === subTypeId);
    return subType?.label || subTypeId;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Issue Type Mapping
          {isMapped && <Badge variant="secondary">Mapped</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Map the original issue type to a standardized category for better analytics and reporting.
          </AlertDescription>
        </Alert>

        {/* Original Type Display */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Original Issue Type</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{getOriginalTypeLabel(originalType)}</Badge>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <Badge variant="outline">{getOriginalSubTypeLabel(originalType, originalSubType)}</Badge>
          </div>
        </div>

        {/* Mapping Controls */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Map to Standard Type</label>
            <Select value={selectedType} onValueChange={(value) => {
              setSelectedType(value);
              setSelectedSubType(''); // Reset subtype when type changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select standard type" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType && selectedTypeData && (
            <div>
              <label className="text-sm font-medium mb-2 block">Map to Standard Sub-Type</label>
              <Select value={selectedSubType} onValueChange={setSelectedSubType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select standard sub-type" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTypeData.subTypes.map((subType) => (
                    <SelectItem key={subType.id} value={subType.id}>
                      {subType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Mapping Preview */}
        {selectedType && selectedSubType && (
          <div className="bg-green-50 p-3 rounded-lg border-green-200 border">
            <h4 className="font-medium mb-2 text-green-800">Mapping Preview</h4>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                {selectedTypeData?.label}
              </Badge>
              <ArrowRight className="h-3 w-3 text-green-600" />
              <Badge className="bg-green-100 text-green-800">
                {selectedTypeData?.subTypes.find(st => st.id === selectedSubType)?.label}
              </Badge>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveMapping}
            disabled={!selectedType || !selectedSubType || !hasChanges || isSaving}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Mapping'}
          </Button>
          
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Current Mapping Status */}
        {isMapped && (
          <div className="text-sm text-gray-600">
            <p>
              Currently mapped to: <strong>{getOriginalTypeLabel(mappedType!)}</strong> → <strong>{getOriginalSubTypeLabel(mappedType!, mappedSubType!)}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueMappingSection;
