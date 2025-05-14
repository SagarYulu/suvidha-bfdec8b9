
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { submitIssue, uploadBankProof } from "@/services/issueSubmitService";
import { Paperclip } from "lucide-react";

type StandardIssueFormProps = {
  employeeUuid: string;
  selectedType: string;
  selectedSubType: string;
  onSuccess: () => void;
};

const StandardIssueForm = ({
  employeeUuid,
  selectedType,
  selectedSubType,
  onSuccess,
}: StandardIssueFormProps) => {
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!employeeUuid) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to submit a ticket.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedType || !selectedSubType) {
      toast({
        title: "Validation error",
        description: "Please select a ticket type and subtype.",
        variant: "destructive",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Validation error",
        description: "Please provide a description of the ticket.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    let fileUrl = null;

    try {
      // Upload file if selected
      if (selectedFile) {
        setIsUploading(true);
        fileUrl = await uploadBankProof(selectedFile, employeeUuid);
        setIsUploading(false);
        
        if (!fileUrl) {
          toast({
            title: "File upload failed",
            description: "Failed to upload your attachment. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Submit the issue with optional attachment URL
      await submitIssue({
        employeeUuid,
        typeId: selectedType,
        subTypeId: selectedSubType,
        description: description.trim(),
        status: "open",
        priority: "medium",
        attachmentUrl: fileUrl,
      });

      toast({
        title: "Ticket submitted",
        description: "Your ticket has been successfully submitted.",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast({
        title: "Submission error",
        description: "An error occurred while submitting your ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <form onSubmit={handleStandardSubmit} className="space-y-6">
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

      <div className="space-y-2">
        <Label>Attachment (Optional)</Label>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*, application/pdf, .doc, .docx"
          />
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            className="flex items-center"
            disabled={isUploading}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : selectedFile ? selectedFile.name : "Add Attachment"}
          </Button>
          {selectedFile && !isUploading && (
            <Button 
              type="button" 
              variant="ghost" 
              className="text-sm text-red-500 h-8 px-2"
              onClick={() => setSelectedFile(null)}
            >
              Remove
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Max file size: 5MB. Accepted formats: images, PDF, Word documents
        </p>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-yulu-blue hover:bg-blue-700"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </Button>
      </div>
    </form>
  );
};

export default StandardIssueForm;
