
// Define all the dashboard roles
export enum DashboardRole {
  ADMIN = "admin",
  OPS_HEAD = "ops_head",
  SECURITY_MANAGER = "security_manager"
}

// Define permissions per page for each role
export interface RolePermissions {
  view: boolean;
  edit: boolean;
}

// Define the pages that can have permissions
export type DashboardPage = 
  "dashboard" | 
  "tickets" | 
  "users" | 
  "analytics" | 
  "access_control" | 
  "settings" | 
  "security_management" |
  "dashboard_users";

// Define a type for the dashboard user data returned from Supabase
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  emp_id: string;
  role: DashboardRole;
  phone?: string;
  city?: string;
  cluster?: string;
  manager?: string;
}

// Map of role permissions per page
export const rolePermissions: Record<DashboardRole, Record<DashboardPage, RolePermissions>> = {
  [DashboardRole.ADMIN]: {
    dashboard: { view: true, edit: true },
    tickets: { view: true, edit: true },
    users: { view: true, edit: true },
    analytics: { view: true, edit: true },
    access_control: { view: true, edit: true },
    settings: { view: true, edit: true },
    security_management: { view: true, edit: true },
    dashboard_users: { view: true, edit: true },
  },
  [DashboardRole.OPS_HEAD]: {
    dashboard: { view: true, edit: true },
    tickets: { view: true, edit: true },
    users: { view: true, edit: false },
    analytics: { view: true, edit: false },
    access_control: { view: false, edit: false },
    settings: { view: true, edit: false },
    security_management: { view: false, edit: false },
    dashboard_users: { view: false, edit: false },
  },
  [DashboardRole.SECURITY_MANAGER]: {
    dashboard: { view: true, edit: false },
    tickets: { view: true, edit: false },
    users: { view: false, edit: false },
    analytics: { view: false, edit: false },
    access_control: { view: false, edit: false },
    settings: { view: false, edit: false },
    security_management: { view: true, edit: true },
    dashboard_users: { view: false, edit: false },
  },
};

// Check if a user with a specific role has permission to access a page
export const hasPagePermission = (
  role: DashboardRole | string | null, 
  page: DashboardPage, 
  action: 'view' | 'edit' = 'view'
): boolean => {
  if (!role) return false;
  
  // Convert string role to enum if needed
  const userRole = typeof role === 'string' ? role as DashboardRole : role;
  
  return rolePermissions[userRole]?.[page]?.[action] || false;
};

// Get all dashboard users
export const getDashboardUsers = async (): Promise<DashboardUser[]> => {
  const { getDashboardUsers: fetchDashboardUsers } = await import('./dashboardUserService');
  return await fetchDashboardUsers();
};

// Create a dashboard user
export const createDashboardUser = async (
  userData: {
    name: string;
    email: string;
    password: string;
    role: DashboardRole;
    city?: string;
    cluster?: string;
    manager?: string;
    phone?: string;
  }
): Promise<boolean> => {
  const { createDashboardUser: createUser } = await import('./dashboardUserService');
  return await createUser(userData);
};

// Assign a role to an existing user
export const assignDashboardRole = async (
  userId: string, 
  role: DashboardRole
): Promise<boolean> => {
  const { assignDashboardRole: assignRole } = await import('./dashboardUserService');
  return await assignRole(userId, role);
};

// Create multiple dashboard users at once
export const createBulkDashboardUsers = async (
  usersData: any[]
): Promise<{ success: boolean, count: number }> => {
  const { createBulkDashboardUsers: createBulkUsers } = await import('./dashboardUserService');
  return await createBulkUsers(usersData);
};
