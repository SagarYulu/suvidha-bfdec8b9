
import { api } from '../lib/api';
import { API_ENDPOINTS } from '../config/api';

export type IssueSubmitData = {
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status?: string;
  priority?: string;
  attachmentUrl?: string | null;
  attachments?: string[] | null;
};

export const submitIssue = async (data: IssueSubmitData) => {
  try {
    const response = await api.post(API_ENDPOINTS.ISSUES, data);
    return { success: true, issueId: response.data.id };
  } catch (error) {
    console.error('Error creating issue:', error);
    return { success: false, error: 'Failed to create issue' };
  }
};

export const uploadBankProof = async (file: File, employeeUuid: string): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeUuid', employeeUuid);
    
    const response = await api.post(API_ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.url;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

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
    return uploadedUrls;
  }
};
