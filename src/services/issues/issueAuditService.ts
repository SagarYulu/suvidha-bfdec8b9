
import { api } from '../../lib/api';

export const createAuditLog = async (
  issueId: string,
  userId: string,
  action: string,
  details: any,
  description: string
) => {
  try {
    await api.post('/audit-logs', {
      issueId,
      userId,
      action,
      details,
      description
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

export const getAuditTrail = async (issueId: string) => {
  try {
    const response = await api.get(`/audit-logs/${issueId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return [];
  }
};
