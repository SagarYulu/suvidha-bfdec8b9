# Role-Based Access Control (RBAC) Developer Guide

## Overview

This document provides detailed information for developers on how to modify and extend the RBAC system in this application.

## Core Files

1. **`src/contexts/RBACContext.tsx`**: The central configuration file that defines:
   - Permission types
   - Role to permission mappings
   - Context provider and hook for permission checks

2. **`src/hooks/useRoleAccess.tsx`**: A utility hook that:
   - Checks if a user has a specific permission
   - Handles redirection for unauthorized access
   - Displays toast notifications

3. **`src/components/guards/RoleBasedGuard.tsx`**: Protects routes based on permissions

4. **`src/components/guards/PermissionGuards.tsx`**: Pre-configured guards for common permissions

5. **`src/components/rbac/PermissionGate.tsx`**: Conditionally renders UI elements based on permissions

## Modifying the RBAC System

### Adding a New Permission

1. Open `src/contexts/RBACContext.tsx`
2. Add your new permission to the `Permission` type:
   ```typescript
   export type Permission = 
     | 'view:dashboard' 
     | 'manage:users'
     // Add your new permission here
     | 'access:new-feature';
   ```
3. Assign the new permission to the appropriate roles in the `ROLE_PERMISSIONS` mapping:
   ```typescript
   const ROLE_PERMISSIONS: Record<string, Permission[]> = {
     'admin': [
       // Existing permissions
       'access:new-feature'  // Add your new permission here
     ],
     // Update other roles as needed
   };
   ```

### Creating a New Guard for a Permission

To protect routes with your new permission, add a new guard in `src/components/guards/PermissionGuards.tsx`:

```typescript
// New feature guard
export const NewFeatureGuard: React.FC<GuardProps> = ({ 
  children, 
  redirectTo = '/admin/dashboard' 
}) => (
  <RoleBasedGuard permission="access:new-feature" redirectTo={redirectTo}>
    {children}
  </RoleBasedGuard>
);
```

Then use this guard in `App.tsx` to protect routes:

```typescript
<Route path="/admin/new-feature" element={
  <NewFeatureGuard>
    <NewFeaturePage />
  </NewFeatureGuard>
} />
```

### Special Developer Access

The email `sagar.km@yulu.bike` is configured as a developer account with full access override.

You can find this configuration in:
- `src/contexts/RBACContext.tsx` - The hasPermission function
- `src/hooks/useRoleAccess.tsx` - The checkAccess function

## Best Practices

1. **Clear Permission Names**: Use descriptive permission names with a colon separator (`area:action`)
2. **Fine-grained Permissions**: Create specific permissions rather than broad ones
3. **Default Deny**: Always default to no access and explicitly grant permissions
4. **UI Components**: Use `PermissionGate` for conditional UI rendering

## Implementing a Database-Backed RBAC System

For a production environment, consider moving from hardcoded permissions to a database schema:

1. Create tables for:
   - `permissions` - List of all permissions
   - `roles` - List of all roles
   - `role_permissions` - Many-to-many relationship between roles and permissions
   - `user_roles` - Many-to-many relationship between users and roles

2. Create API endpoints to:
   - Fetch permissions for a user
   - Assign/remove roles from users
   - Modify permissions for roles

3. Update the RBAC context to fetch permissions from the API instead of using hardcoded values

## Testing RBAC Implementation

When testing your RBAC implementation:

1. Test with different user roles
2. Verify direct URL access is protected
3. Check that UI elements are conditionally rendered correctly
4. Test permission changes and their effect on access
