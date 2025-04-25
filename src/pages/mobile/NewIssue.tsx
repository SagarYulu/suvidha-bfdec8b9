
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import { ISSUE_TYPES } from "@/config/issueTypes";
import { createIssue } from "@/services/issueService";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MobileNewIssue = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user?.id) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to submit an issue.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedType || !selectedSubType) {
      toast({
        title: "Validation error",
        description: "Please select an issue type and subtype.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Validation error",
        description: "Please provide a description of the issue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createIssue({
        userId: authState.user.id,
        typeId: selectedType,
        subTypeId: selectedSubType,
        description: description.trim(),
        status: "open",
        priority: "medium",
      });

      toast({
        title: "Issue submitted",
        description: "Your issue has been successfully submitted.",
      });
      
      navigate("/mobile/issues");
    } catch (error) {
      console.error("Error submitting issue:", error);
      toast({
        title: "Submission error",
        description: "An error occurred while submitting your issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout title="New Issue">
      <div className="pb-16">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="issue-type">Issue Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => {
                setSelectedType(value);
                setSelectedSubType("");
              }}
            >
              <SelectTrigger id="issue-type">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ISSUE_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="space-y-2">
              <Label htmlFor="issue-subtype">Issue Subtype</Label>
              <Select
                value={selectedSubType}
                onValueChange={setSelectedSubType}
              >
                <SelectTrigger id="issue-subtype">
                  <SelectValue placeholder="Select issue subtype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ISSUE_TYPES.find((type) => type.id === selectedType)
                      ?.subTypes.map((subType) => (
                        <SelectItem key={subType.id} value={subType.id}>
                          {subType.label}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please describe your issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-yulu-blue hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Issue"}
            </Button>
          </div>
        </form>
      </div>
    </MobileLayout>
  );
};

export default MobileNewIssue;
