
import { supabase } from "@/integrations/supabase/client";

export type IssueSubmitData = {
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status?: string;
  priority?: string;
  attachmentUrl?: string | null;
  attachments?: string[] | null; // Add support for multiple attachments
};

export const submitIssue = async (data: IssueSubmitData) => {
  // Generate a UUID for the issue
  const id = crypto.randomUUID();
  
  // Map from our Issue type property names to the database column names
  const dbIssueData = {
    id: id,
    employee_uuid: data.employeeUuid,
    type_id: data.typeId,
    sub_type_id: data.subTypeId,
    description: data.description,
    status: data.status || "open",
    priority: data.priority || "medium",
    attachment_url: data.attachmentUrl || null,
    attachments: data.attachments || null, // Store array of attachment URLs
  };

  if (!dbIssueData.employee_uuid || !dbIssueData.type_id || !dbIssueData.sub_type_id || !dbIssueData.description) {
    console.error('Missing required fields for issue creation');
    return { success: false, error: 'Missing required fields' };
  }

  console.log("Submitting issue with data:", dbIssueData);

  const { data: result, error } = await supabase
    .from('issues')
    .insert(dbIssueData)
    .select();

  if (error) {
    console.error('Error creating issue:', error);
    return { success: false, error: error.message };
  }

  return { success: true, issueId: id };
};

export const uploadBankProof = async (file: File, employeeUuid: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeUuid}-${Date.now()}.${fileExt}`;
    const filePath = `issue-attachments/${fileName}`;
    
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

// New function to handle multiple file uploads
export const uploadMultipleFiles = async (files: File[], employeeUuid: string): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  try {
    for (const file of files) {
      const url = await uploadBankProof(file, employeeUuid);
      if (url) {
        uploadedUrls.push(url);
      }
    }
    
    return uploadedUrls;
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    return uploadedUrls; // Return whatever we managed to upload
  }
};
