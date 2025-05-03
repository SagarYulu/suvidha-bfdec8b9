
import { supabase } from "@/integrations/supabase/client";

export type IssueSubmitData = {
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status?: string;
  priority?: string;
};

export const submitIssue = async (data: IssueSubmitData) => {
  // Generate a UUID for the issue
  const id = crypto.randomUUID();
  
  const { error } = await supabase
    .from('issues')
    .insert({
      id: id,
      employee_uuid: data.employeeUuid,
      type_id: data.typeId,
      sub_type_id: data.subTypeId,
      description: data.description,
      status: data.status || "open",
      priority: data.priority || "medium",
    });

  if (error) {
    throw error;
  }

  return { success: true, issueId: id };
};

export const uploadBankProof = async (file: File, employeeUuid: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${employeeUuid}-${Date.now()}.${fileExt}`;
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
