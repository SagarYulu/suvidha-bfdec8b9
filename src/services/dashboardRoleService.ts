
// Main barrel file to re-export everything from the smaller modules
// This maintains backward compatibility with existing code

export { DashboardRole } from './dashboard/types';
export type { DashboardPage, RolePermissions, DashboardUser } from './dashboard/types';
export { hasPermission } from './dashboard/permissionsService';
export { getDashboardUsers, createDashboardUser, assignDashboardRole } from './dashboard/userService';
export { createBulkDashboardUsers } from './dashboard/bulkOperations';
