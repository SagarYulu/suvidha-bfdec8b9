
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Banknote, CreditCard, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const bankAccountSchema = z.object({
  accountNumber: z.string().min(1, "Account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  description: z.string().optional(),
});

type BankAccountFormProps = {
  userId: string;
  selectedType: string;
  selectedSubType: string;
  onSuccess: () => void;
};

const BankAccountChangeForm = ({
  userId,
  selectedType,
  selectedSubType,
  onSuccess,
}: BankAccountFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountNumber: "",
      ifscCode: "",
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type (only accept images)
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      setProofFile(file);
    }
  };
  
  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `bank-proofs/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('issue-attachments')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return null;
      }
      
      const { data } = supabase.storage
        .from('issue-attachments')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error in file upload function:", error);
      return null;
    }
  };

  const handleBankDetailsSubmit = async (data: z.infer<typeof bankAccountSchema>) => {
    if (!userId) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to submit a ticket.",
        variant: "destructive",
      });
      return;
    }

    if (!proofFile) {
      toast({
        title: "Validation error",
        description: "Please upload a bank proof document (passbook/cheque/statement).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Upload the file first
      const fileUrl = await uploadFileToSupabase(proofFile);
      
      if (!fileUrl) {
        toast({
          title: "Upload error",
          description: "Failed to upload bank proof document. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
      
      // Create issue with bank details
      const enhancedDescription = `
Account Number: ${data.accountNumber}
IFSC Code: ${data.ifscCode}
Uploaded Proof: ${fileUrl}
${data.description ? `\nAdditional Notes: ${data.description}` : ''}
      `.trim();
      
      const { error } = await supabase
        .from('issues')
        .insert({
          user_id: userId,
          type_id: selectedType,
          subtype_id: selectedSubType,
          description: enhancedDescription,
          status: "open",
          priority: "medium",
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Bank details change request submitted",
        description: "Your request to update bank details has been successfully submitted.",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Error submitting bank details change:", error);
      toast({
        title: "Submission error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleBankDetailsSubmit)} className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
          <div className="flex items-center mb-2">
            <Banknote className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-medium text-blue-700">Bank Account Update Request</h3>
          </div>
          <p className="text-sm text-blue-600">
            Please provide your new bank account details and upload a proof document
            (bank passbook/canceled cheque/statement) showing your name, account number and IFSC code.
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Enter your bank account number"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="ifscCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IFSC Code</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Enter bank IFSC code"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <Label htmlFor="proof-upload">Bank Proof Document</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <input 
              type="file"
              id="proof-upload"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="proof-upload"
                  className="mx-auto cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                >
                  {proofFile ? (
                    <span className="text-green-600">
                      {proofFile.name} ({(proofFile.size / 1024).toFixed(1)} KB)
                    </span>
                  ) : (
                    <span>Upload bank proof image</span>
                  )}
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Upload passbook/canceled cheque/bank statement
              </p>
            </div>
          </div>
          {!proofFile && (
            <p className="text-xs text-amber-600 mt-1">*Required: Please upload a proof document</p>
          )}
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional details about your bank account change request..."
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-yulu-blue hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isUploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit Bank Details Change"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BankAccountChangeForm;
