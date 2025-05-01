
import { DashboardRole, DashboardPage, RolePermissions } from "./types";

// Define the permissions matrix
const rolePermissionsMatrix: Record<DashboardRole, Record<DashboardPage, RolePermissions>> = {
  [DashboardRole.ADMIN]: {
    dashboard: { view: true, edit: true },
    tickets: { view: true, edit: true },
    users: { view: true, edit: true },
    analytics: { view: true, edit: true },
    access_control: { view: true, edit: true },
    settings: { view: true, edit: true },
    security_management: { view: true, edit: true },
    dashboard_users: { view: true, edit: true }
  },
  [DashboardRole.OPS_HEAD]: {
    dashboard: { view: true, edit: false },
    tickets: { view: true, edit: false },
    users: { view: false, edit: false },
    analytics: { view: true, edit: false },
    access_control: { view: false, edit: false },
    settings: { view: false, edit: false },
    security_management: { view: false, edit: false },
    dashboard_users: { view: false, edit: false }
  },
  [DashboardRole.SECURITY_MANAGER]: {
    dashboard: { view: false, edit: false },
    tickets: { view: false, edit: false },
    users: { view: false, edit: false },
    analytics: { view: false, edit: false },
    access_control: { view: true, edit: true },
    settings: { view: false, edit: false },
    security_management: { view: true, edit: true },
    dashboard_users: { view: true, edit: true }
  }
};

// Check if a user has permission for a specific action on a page
export const hasPermission = (
  role: DashboardRole | string | null, 
  page: DashboardPage, 
  action: "view" | "edit"
): boolean => {
  // If no role or invalid role, deny access
  if (!role || !(role in rolePermissionsMatrix)) {
    return false;
  }
  
  // Cast role to DashboardRole type
  const userRole = role as DashboardRole;
  
  // Check if the page exists in permissions matrix
  if (!(page in rolePermissionsMatrix[userRole])) {
    return false;
  }
  
  // Return permission for the specific action
  return rolePermissionsMatrix[userRole][page][action];
};
