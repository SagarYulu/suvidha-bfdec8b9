
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
    id: dbIssue.id,
    employeeUuid: dbIssue.employee_uuid,
    typeId: dbIssue.type_id,
    subTypeId: dbIssue.sub_type_id,
    description: dbIssue.description,
    status: dbIssue.status as Issue["status"],
    priority: dbIssue.priority as Issue["priority"],
    createdAt: dbIssue.created_at,
    updatedAt: dbIssue.updated_at,
    closedAt: dbIssue.closed_at,
    assignedTo: dbIssue.assigned_to,
    comments: comments
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
  const uniqueIds = [...new Set(employeeUuids)];
  const result: Record<string, string> = {};
  
  await Promise.all(uniqueIds.map(async (uuid) => {
    result[uuid] = await getEmployeeNameByUuid(uuid);
  }));
  
  return result;
};
