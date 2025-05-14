
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { submitIssue, uploadBankProof } from "@/services/issueSubmitService";
import { Paperclip, Upload } from "lucide-react";

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
  
  // ESI-specific states for Aadhaar uploads
  const [aadharFrontFile, setAadharFrontFile] = useState<File | null>(null);
  const [aadharBackFile, setAadharBackFile] = useState<File | null>(null);
  const [isUploadingAadharFront, setIsUploadingAadharFront] = useState(false);
  const [isUploadingAadharBack, setIsUploadingAadharBack] = useState(false);
  const aadharFrontInputRef = useRef<HTMLInputElement>(null);
  const aadharBackInputRef = useRef<HTMLInputElement>(null);
  
  const isESITicket = selectedType === "esi";

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

  const handleAadharFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAadharFrontFile(file);
    }
  };

  const handleAadharBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setAadharBackFile(file);
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

    // Special validation for ESI tickets
    if (isESITicket) {
      if (!aadharFrontFile || !aadharBackFile) {
        toast({
          title: "Validation error",
          description: "Both Aadhaar card front and back images are required for ESI tickets",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    let fileUrl = null;
    let aadharFrontUrl = null;
    let aadharBackUrl = null;

    try {
      // Upload regular attachment if selected
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

      // Upload Aadhaar attachments for ESI tickets
      if (isESITicket) {
        if (aadharFrontFile) {
          setIsUploadingAadharFront(true);
          aadharFrontUrl = await uploadBankProof(aadharFrontFile, employeeUuid);
          setIsUploadingAadharFront(false);
          
          if (!aadharFrontUrl) {
            toast({
              title: "File upload failed",
              description: "Failed to upload Aadhaar card front. Please try again.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
        }
        
        if (aadharBackFile) {
          setIsUploadingAadharBack(true);
          aadharBackUrl = await uploadBankProof(aadharBackFile, employeeUuid);
          setIsUploadingAadharBack(false);
          
          if (!aadharBackUrl) {
            toast({
              title: "File upload failed",
              description: "Failed to upload Aadhaar card back. Please try again.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Create attachment URLs string for description
      let attachmentDetails = "";
      
      if (fileUrl) {
        attachmentDetails += `\nAttachment: ${fileUrl}`;
      }
      
      if (aadharFrontUrl) {
        attachmentDetails += `\nAadhaar Front: ${aadharFrontUrl}`;
      }
      
      if (aadharBackUrl) {
        attachmentDetails += `\nAadhaar Back: ${aadharBackUrl}`;
      }

      // Submit the issue with optional attachment URL
      await submitIssue({
        employeeUuid,
        typeId: selectedType,
        subTypeId: selectedSubType,
        description: `${description.trim()}${attachmentDetails}`,
        status: "open",
        priority: "medium",
        attachmentUrl: fileUrl || aadharFrontUrl, // Save the first available attachment URL
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
      setIsUploadingAadharFront(false);
      setIsUploadingAadharBack(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const triggerAadharFrontInput = () => {
    if (aadharFrontInputRef.current) {
      aadharFrontInputRef.current.click();
    }
  };

  const triggerAadharBackInput = () => {
    if (aadharBackInputRef.current) {
      aadharBackInputRef.current.click();
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

      {isESITicket ? (
        <div className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
            <p className="text-sm text-amber-700 font-medium">
              For ESI-related requests, both front and back sides of your Aadhaar card are required
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="aadharFront">Aadhaar Card Front (Required)</Label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={aadharFrontInputRef}
                onChange={handleAadharFrontChange}
                className="hidden"
                accept="image/*"
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerAadharFrontInput}
                className="flex items-center"
                disabled={isUploadingAadharFront}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploadingAadharFront ? "Uploading..." : aadharFrontFile ? aadharFrontFile.name : "Upload Aadhaar Front"}
              </Button>
              {aadharFrontFile && !isUploadingAadharFront && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm text-red-500 h-8 px-2"
                  onClick={() => setAadharFrontFile(null)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadharBack">Aadhaar Card Back (Required)</Label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={aadharBackInputRef}
                onChange={handleAadharBackChange}
                className="hidden"
                accept="image/*"
              />
              <Button
                type="button"
                variant="outline"
                onClick={triggerAadharBackInput}
                className="flex items-center"
                disabled={isUploadingAadharBack}
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploadingAadharBack ? "Uploading..." : aadharBackFile ? aadharBackFile.name : "Upload Aadhaar Back"}
              </Button>
              {aadharBackFile && !isUploadingAadharBack && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-sm text-red-500 h-8 px-2"
                  onClick={() => setAadharBackFile(null)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalDoc">Additional Document (Optional)</Label>
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
                {isUploading ? "Uploading..." : selectedFile ? selectedFile.name : "Add Additional Document"}
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
          </div>
        </div>
      ) : (
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
      )}

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full bg-yulu-blue hover:bg-blue-700"
          disabled={isSubmitting || isUploading || isUploadingAadharFront || isUploadingAadharBack}
        >
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </Button>
      </div>
    </form>
  );
};

export default StandardIssueForm;
