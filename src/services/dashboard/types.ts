
// Types and enums for dashboard role management

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
}
