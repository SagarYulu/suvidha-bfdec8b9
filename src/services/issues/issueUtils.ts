
import { Issue } from "../../types";
import { api } from '../../lib/api';

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const mapDbIssueToAppIssue = (dbIssue: any, comments: any[]): Issue => {
  return {
    id: dbIssue.id,
    employeeUuid: dbIssue.employee_uuid || dbIssue.employeeUuid,
    typeId: dbIssue.type_id || dbIssue.typeId,
    subTypeId: dbIssue.sub_type_id || dbIssue.subTypeId,
    description: dbIssue.description,
    status: dbIssue.status as Issue["status"],
    priority: dbIssue.priority as Issue["priority"],
    createdAt: dbIssue.created_at || dbIssue.createdAt,
    updatedAt: dbIssue.updated_at || dbIssue.updatedAt,
    closedAt: dbIssue.closed_at || dbIssue.closedAt,
    assignedTo: dbIssue.assigned_to || dbIssue.assignedTo,
    comments: comments || [],
    lastStatusChangeAt: dbIssue.last_status_change_at || dbIssue.lastStatusChangeAt,
    reopenableUntil: dbIssue.reopenable_until || dbIssue.reopenableUntil,
    previouslyClosedAt: dbIssue.previously_closed_at || dbIssue.previouslyClosedAt
  };
};

const userNameCache: Record<string, string> = {};

export const getEmployeeNameByUuid = async (employeeUuid: string): Promise<string> => {
  if (userNameCache[employeeUuid]) {
    return userNameCache[employeeUuid];
  }
  
  if (employeeUuid === "1") {
    userNameCache[employeeUuid] = "Admin";
    return "Admin";
  }
  
  if (employeeUuid.startsWith("security-user")) {
    userNameCache[employeeUuid] = "Security Team";
    return "Security Team";
  }
  
  try {
    const response = await api.get(`/users/${employeeUuid}`);
    if (response.data) {
      userNameCache[employeeUuid] = response.data.name;
      return response.data.name;
    }
  } catch (error) {
    console.error(`Error fetching user name for UUID ${employeeUuid}:`, error);
  }
  
  return "Unknown Employee";
};

export const mapEmployeeUuidsToNames = async (employeeUuids: string[]): Promise<Record<string, string>> => {
  const uniqueIds = [...new Set(employeeUuids)];
  const result: Record<string, string> = {};
  
  await Promise.all(uniqueIds.map(async (uuid) => {
    result[uuid] = await getEmployeeNameByUuid(uuid);
  }));
  
  return result;
};

export const getAvailableAssignees = async (): Promise<{ value: string; label: string }[]> => {
  try {
    const response = await api.get('/users?roles=Admin,Support Agent,HR Admin,Super Admin');
    return (response.data || []).map((user: any) => ({
      value: user.id,
      label: `${user.name} (${user.role})`
    }));
  } catch (error) {
    console.error('Error in getAvailableAssignees:', error);
    return [];
  }
};
