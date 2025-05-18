
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { mapIssueType, unmapIssueType } from "@/services/issueService";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueTypeHelpers";
import { issueTypeOptions } from "@/config/issueTypes";
import { Issue } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clipboard, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface IssueTypeMappingProps {
  issue: Issue;
  onIssueMapped: (updatedIssue: Issue) => void;
}

const IssueTypeMapping = ({ issue, onIssueMapped }: IssueTypeMappingProps) => {
  const { authState } = useAuth();
  const [selectedType, setSelectedType] = useState<string>(issue.mappedTypeId || "");
  const [selectedSubType, setSelectedSubType] = useState<string>(issue.mappedSubTypeId || "");
  const [isMapping, setIsMapping] = useState(false);
  const [isUnmapping, setIsUnmapping] = useState(false);
  
  // Only show for "others" type issues
  const isOthersType = issue.typeId === "others";
  
  // Available subtypes based on the selected type
  const availableSubTypes = selectedType
    ? issueTypeOptions.find(t => t.value === selectedType)?.subTypes || []
    : [];
    
  const handleMapIssue = async () => {
    if (!selectedType || !selectedSubType) {
      toast({
        title: "Missing selection",
        description: "Please select both a type and subtype for mapping",
        variant: "destructive",
      });
      return;
    }
    
    if (!authState.user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    setIsMapping(true);
    
    try {
      const mappedIssue = await mapIssueType(
        issue.id,
        authState.user.id,
        selectedType,
        selectedSubType
      );
      
      if (mappedIssue) {
        toast({
          title: "Issue mapped successfully",
          description: `Mapped to ${getIssueTypeLabel(selectedType)} - ${getIssueSubTypeLabel(selectedType, selectedSubType)}`,
        });
        onIssueMapped(mappedIssue);
      } else {
        toast({
          title: "Mapping failed",
          description: "Failed to map the issue. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error mapping issue:", error);
      toast({
        title: "Mapping error",
        description: "An error occurred while mapping the issue",
        variant: "destructive",
      });
    } finally {
      setIsMapping(false);
    }
  };
  
  const handleUnmapIssue = async () => {
    if (!authState.user?.id) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    setIsUnmapping(true);
    
    try {
      const success = await unmapIssueType(
        issue.id,
        authState.user.id
      );
      
      if (success) {
        toast({
          title: "Issue mapping removed",
          description: "The issue has been returned to its original type",
        });
        
        // Update local state to reflect the unmapped issue
        const updatedIssue = {
          ...issue,
          mappedTypeId: undefined,
          mappedSubTypeId: undefined,
          mappedAt: undefined,
        };
        
        onIssueMapped(updatedIssue);
        setSelectedType("");
        setSelectedSubType("");
      } else {
        toast({
          title: "Unmapping failed",
          description: "Failed to remove the issue mapping. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error unmapping issue:", error);
      toast({
        title: "Unmapping error",
        description: "An error occurred while removing the issue mapping",
        variant: "destructive",
      });
    } finally {
      setIsUnmapping(false);
    }
  };
  
  if (!isOthersType && !issue.mappedTypeId) {
    return null; // Don't show the component for non-"others" tickets without mapping
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Clipboard className="h-5 w-5 mr-2" />
          Issue Type Mapping
        </CardTitle>
        <CardDescription>
          {isOthersType 
            ? "Map this 'Others' ticket to a specific issue type for accurate analytics" 
            : "This ticket has been mapped from the 'Others' category"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {issue.mappedTypeId ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-center">
              <div className="flex-1">
                <h4 className="font-medium text-blue-800">Mapped Issue Type</h4>
                <div className="flex items-center text-sm mt-1">
                  <span className="text-gray-500">Original:</span>
                  <span className="ml-1 font-medium">
                    {getIssueTypeLabel(issue.typeId)} - {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                  </span>
                  <ArrowRight className="mx-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Mapped to:</span>
                  <span className="ml-1 font-medium">
                    {getIssueTypeLabel(issue.mappedTypeId)} - {getIssueSubTypeLabel(issue.mappedTypeId, issue.mappedSubTypeId || "")}
                  </span>
                </div>
                {issue.mappedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Mapped on {format(new Date(issue.mappedAt), "MMM d, yyyy 'at' h:mm a")}
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleUnmapIssue} 
                disabled={isUnmapping}
                className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                {isUnmapping ? "Removing..." : "Remove mapping"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-amber-800 text-sm font-medium">
                  This ticket is categorized as "Others" and needs to be properly categorized for accurate analytics and reporting
                </span>
              </div>
            </div>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="typeMapping">Map to Issue Type</Label>
                <Select
                  value={selectedType}
                  onValueChange={value => {
                    setSelectedType(value);
                    setSelectedSubType(""); // Reset subtype when type changes
                  }}
                >
                  <SelectTrigger id="typeMapping">
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypeOptions
                      .filter(type => type.value !== "others") // Don't allow mapping to "others"
                      .map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subTypeMapping">Map to Issue Subtype</Label>
                <Select
                  value={selectedSubType}
                  onValueChange={setSelectedSubType}
                  disabled={!selectedType}
                >
                  <SelectTrigger id="subTypeMapping">
                    <SelectValue placeholder={selectedType ? "Select subtype" : "Select a type first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubTypes.map(subType => (
                      <SelectItem key={subType.value} value={subType.value}>
                        {subType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleMapIssue} 
                disabled={isMapping || !selectedType || !selectedSubType}
                className="w-full mt-2"
              >
                {isMapping ? "Mapping..." : "Map Issue Type"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueTypeMapping;
