
import { Issue } from "@/types";

/**
 * Issue utility functions - helpers for processing issue data
 */

// Function to generate a UUID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Function to map database issue to app Issue type
export const mapDbIssueToAppIssue = (dbIssue: any, comments: any[]): Issue => {
  return {
    id: Number(dbIssue.id),
    employeeId: Number(dbIssue.employeeId || dbIssue.employee_id),
    employeeUuid: dbIssue.employee_uuid, // Keep for backward compatibility
    typeId: dbIssue.typeId || dbIssue.type_id,
    subTypeId: dbIssue.subTypeId || dbIssue.sub_type_id,
    description: dbIssue.description,
    status: dbIssue.status as Issue["status"],
    priority: dbIssue.priority as Issue["priority"],
    createdAt: dbIssue.createdAt || dbIssue.created_at,
    updatedAt: dbIssue.updatedAt || dbIssue.updated_at,
    closedAt: dbIssue.closedAt || dbIssue.closed_at,
    assignedTo: dbIssue.assignedTo ? Number(dbIssue.assignedTo) : undefined,
    comments: comments,
    lastStatusChangeAt: dbIssue.lastStatusChangeAt || dbIssue.last_status_change_at,
    reopenableUntil: dbIssue.reopenableUntil || dbIssue.reopenable_until,
    previouslyClosedAt: dbIssue.previouslyClosedAt || dbIssue.previously_closed_at
  };
};

import { getUserById } from "@/services/userService";

// Cache for user names to reduce duplicate API calls
const userNameCache: Record<string, string> = {};

/**
 * Gets the employee name from their UUID
 * Provides caching to reduce API calls
 */
export const getEmployeeNameByUuid = async (employeeUuid: string): Promise<string> => {
  // Return from cache if available
  if (userNameCache[employeeUuid]) {
    return userNameCache[employeeUuid];
  }
  
  // Special case for known system IDs
  if (employeeUuid === "1") {
    userNameCache[employeeUuid] = "Admin";
    return "Admin";
  }
  
  // Handle security-user IDs - including when they have numbers after
  if (employeeUuid.startsWith("security-user")) {
    userNameCache[employeeUuid] = "Security Team";
    return "Security Team";
  }
  
  try {
    const user = await getUserById(employeeUuid);
    if (user) {
      // Store in cache for future use
      userNameCache[employeeUuid] = user.name;
      return user.name;
    }
  } catch (error) {
    console.error(`Error fetching user name for UUID ${employeeUuid}:`, error);
  }
  
  // Fallback if user not found
  return "Unknown Employee";
};

/**
 * Maps employee UUIDs to names in a batch for better performance
 */
export const mapEmployeeUuidsToNames = async (employeeUuids: string[]): Promise<Record<string, string>> => {
  const uniqueIds = Array.from(new Set(employeeUuids));
  const result: Record<string, string> = {};
  
  await Promise.all(uniqueIds.map(async (uuid) => {
    result[uuid] = await getEmployeeNameByUuid(uuid);
  }));
  
  return result;
};

/**
 * Maps employee integer IDs to names in a batch for better performance
 * This works with the PostgreSQL integer ID schema
 */
export const mapEmployeeIdsToNames = async (employeeIds: number[]): Promise<Record<number, string>> => {
  const uniqueIds = Array.from(new Set(employeeIds));
  const result: Record<number, string> = {};
  
  try {
    // Import authenticatedAxios for JWT authenticated requests
    const { default: authenticatedAxios } = await import('@/services/authenticatedAxios');
    
    // Fetch all employees in one API call for better performance
    const response = await authenticatedAxios.get('/api/employees');
    const employees = response.data;
    
    // Create mapping from employee ID to name
    const employeeMap = employees.reduce((acc: Record<number, string>, emp: any) => {
      acc[emp.id] = emp.name;
      return acc;
    }, {});
    
    // Map requested IDs to names
    uniqueIds.forEach(id => {
      result[id] = employeeMap[id] || "Unknown Employee";
    });
    
  } catch (error) {
    console.error('Error fetching employee names:', error);
    // Fallback: mark all as unknown
    uniqueIds.forEach(id => {
      result[id] = "Unknown Employee";
    });
  }
  
  return result;
};

/**
 * Get available assignees for ticket assignment
 * Returns a formatted list for dropdown selection
 */
export const getAvailableAssignees = async (): Promise<{ value: string; label: string }[]> => {
  try {
    // Import authenticatedAxios for JWT authenticated requests
    const { default: authenticatedAxios } = await import('@/services/authenticatedAxios');
    
    // Get users with admin or support roles from the database
    const response = await authenticatedAxios.get('/api/dashboard-users');
    const allUsers = response.data;
    
    // Filter users with admin or support roles
    const adminUsers = allUsers.filter((user: any) => 
      ['Admin', 'Support Agent', 'HR Admin', 'Super Admin'].includes(user.role)
    );
    
    // Map to the format needed for the dropdown
    return adminUsers.map((user: any) => ({
      value: user.id.toString(),
      label: `${user.name} (${user.role})`
    }));
  } catch (error) {
    console.error('Error in getAvailableAssignees:', error);
    return [];
  }
};
