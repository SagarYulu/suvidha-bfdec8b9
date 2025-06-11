
import { userService as apiUserService } from '@/services/api/userService';

// Re-export all user service functions for backward compatibility
export const getUsers = apiUserService.getUsers;
export const getEmployees = apiUserService.getEmployees;
export const getUserById = apiUserService.getUserById;
export const createUser = apiUserService.createUser;
export const updateUser = apiUserService.updateUser;
export const deleteUser = apiUserService.deleteUser;
export const changePassword = apiUserService.changePassword;
export const getUserPermissions = apiUserService.getUserPermissions;
export const updateUserPermissions = apiUserService.updateUserPermissions;
export const bulkCreateUsers = apiUserService.bulkCreateUsers;
export const exportUsers = apiUserService.exportUsers;

// Export the service object as well
export const userService = apiUserService;
