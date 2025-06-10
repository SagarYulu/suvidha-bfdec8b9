
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { Paperclip } from "lucide-react";

type StandardIssueFormProps = {
  employeeUuid: string;
  selectedType: string;
  selectedSubType: string;
  onSuccess: () => void;
  skipTypeValidation?: boolean;
  showHindi?: boolean;
};

const StandardIssueForm = ({
  employeeUuid,
  selectedType,
  selectedSubType,
  onSuccess,
  skipTypeValidation = false,
  showHindi = false,
}: StandardIssueFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      description: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    if (!skipTypeValidation && (!selectedType || !selectedSubType)) {
      toast({
        title: "Validation error",
        description: "Please select issue type and subtype",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      let attachmentUrls: string[] = [];

      // Upload files if any
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('employeeUuid', employeeUuid);
          
          const uploadResponse = await apiService.uploadFile(formData);
          if (uploadResponse.success) {
            attachmentUrls.push(uploadResponse.fileUrl);
          }
        }
      }

      setIsUploading(false);

      // Submit the issue
      await apiService.createIssue({
        type_id: selectedType,
        sub_type_id: selectedSubType,
        description: data.description,
        priority: "medium",
        attachments: attachmentUrls,
      });

      toast({
        title: "Issue submitted",
        description: "Your issue has been submitted successfully",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Submission error",
        description: error.message || "An error occurred while submitting your issue. Please try again.",
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="description">
          {showHindi ? "Description / विवरण" : "Description"}
        </Label>
        <Textarea
          id="description"
          placeholder={showHindi 
            ? "Please describe your issue in detail / कृपया अपनी समस्या का विस्तार से वर्णन करें" 
            : "Please describe your issue in detail"}
          {...register("description", { 
            required: "Description is required",
            minLength: { value: 10, message: "Description must be at least 10 characters" }
          })}
          rows={5}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message as string}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachments">
          {showHindi 
            ? "Attachments (Optional) / अटैचमेंट (वैकल्पिक)" 
            : "Attachments (Optional)"}
        </Label>
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*, application/pdf, .doc, .docx"
            multiple
          />
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileInput}
            className="flex items-center"
            disabled={isUploading}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            {showHindi ? "Add Files / फाइलें जोड़ें" : "Add Files"}
          </Button>
          
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    {showHindi ? "Remove / हटायें" : "Remove"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {showHindi 
            ? "Max file size: 5MB per file. Accepted formats: images, PDF, Word documents / अधिकतम फाइल साइज: 5MB प्रति फाइल। स्वीकृत फॉर्मेट: इमेज, PDF, वर्ड डॉक्यूमेंट" 
            : "Max file size: 5MB per file. Accepted formats: images, PDF, Word documents"}
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting 
          ? (showHindi ? "Submitting... / जमा हो रहा है..." : "Submitting...") 
          : (showHindi ? "Submit Issue / समस्या जमा करें" : "Submit Issue")}
      </Button>
    </form>
  );
};

export default StandardIssueForm;
