
import React from "react";
import { Label } from "@/components/ui/label";
import { ISSUE_TYPES } from "@/config/issueTypes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IssueTypeSelectorProps = {
  selectedType: string;
  setSelectedType: (value: string) => void;
  selectedSubType: string;
  setSelectedSubType: (value: string) => void;
  resetForm?: () => void;
};

const IssueTypeSelector = ({
  selectedType,
  setSelectedType,
  selectedSubType,
  setSelectedSubType,
  resetForm,
}: IssueTypeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="issue-type">Ticket Type / टिकट का प्रकार</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value);
            setSelectedSubType("");
            if (resetForm) resetForm();
          }}
        >
          <SelectTrigger id="issue-type">
            <SelectValue placeholder="Select ticket type / टिकट का प्रकार चुनें" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {ISSUE_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label} {type.labelHindi ? `/ ${type.labelHindi}` : ''}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {selectedType && (
        <div className="space-y-2">
          <Label htmlFor="issue-subtype">Ticket Subtype / टिकट का उप-प्रकार</Label>
          <Select
            value={selectedSubType}
            onValueChange={setSelectedSubType}
          >
            <SelectTrigger id="issue-subtype">
              <SelectValue placeholder="Select ticket subtype / टिकट का उप-प्रकार चुनें" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ISSUE_TYPES.find((type) => type.id === selectedType)
                  ?.subTypes.map((subType) => (
                    <SelectItem key={subType.id} value={subType.id}>
                      {subType.label} {subType.labelHindi ? `/ ${subType.labelHindi}` : ''}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default IssueTypeSelector;
