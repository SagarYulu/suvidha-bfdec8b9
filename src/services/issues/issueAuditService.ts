
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
