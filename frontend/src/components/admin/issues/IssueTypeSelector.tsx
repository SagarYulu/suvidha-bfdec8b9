
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface IssueType {
  id: string;
  label: string;
  labelHindi?: string;
  subTypes: IssueSubType[];
}

interface IssueSubType {
  id: string;
  label: string;
  labelHindi?: string;
}

interface IssueTypeSelectorProps {
  issueTypes: IssueType[];
  selectedType: string;
  selectedSubType: string;
  onTypeChange: (typeId: string) => void;
  onSubTypeChange: (subTypeId: string) => void;
  disabled?: boolean;
}

const IssueTypeSelector: React.FC<IssueTypeSelectorProps> = ({
  issueTypes,
  selectedType,
  selectedSubType,
  onTypeChange,
  onSubTypeChange,
  disabled = false
}) => {
  const selectedTypeData = issueTypes.find(type => type.id === selectedType);
  const availableSubTypes = selectedTypeData?.subTypes || [];

  const handleTypeChange = (typeId: string) => {
    onTypeChange(typeId);
    // Reset subtype when type changes
    onSubTypeChange('');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="issueType">Issue Type</Label>
        <Select 
          value={selectedType} 
          onValueChange={handleTypeChange}
          disabled={disabled}
        >
          <SelectTrigger id="issueType">
            <SelectValue placeholder="Select issue type" />
          </SelectTrigger>
          <SelectContent>
            {issueTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.labelHindi ? `${type.label} / ${type.labelHindi}` : type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedType && (
        <div>
          <Label htmlFor="issueSubType">Issue Sub-Type</Label>
          <Select 
            value={selectedSubType} 
            onValueChange={onSubTypeChange}
            disabled={disabled || availableSubTypes.length === 0}
          >
            <SelectTrigger id="issueSubType">
              <SelectValue 
                placeholder={
                  availableSubTypes.length === 0 
                    ? "No sub-types available" 
                    : "Select issue sub-type"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {availableSubTypes.map((subType) => (
                <SelectItem key={subType.id} value={subType.id}>
                  {subType.labelHindi ? `${subType.label} / ${subType.labelHindi}` : subType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default IssueTypeSelector;
