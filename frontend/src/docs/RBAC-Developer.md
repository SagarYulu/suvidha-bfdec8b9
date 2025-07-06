
# RBAC Developer Guide

## Overview
This guide provides technical documentation for implementing Role-Based Access Control (RBAC) in the frontend application.

## Architecture

### Core Components
- `RBACContext`: Provides RBAC state and functions throughout the app
- `PermissionGate`: Component-level permission checking
- `RolePermissionsManager`: Admin interface for managing roles and permissions

### Permission System
Permissions are organized by categories:
- `user_management`: User creation, editing, deletion
- `analytics`: Viewing analytics dashboards and reports
- `settings`: Modifying system settings
- `issues`: Managing support tickets
- `export`: Data export capabilities

## Implementation

### 1. Context Setup
```tsx
import { RBACProvider } from '@/contexts/RBACContext';

function App() {
  return (
    <RBACProvider>
      <YourApp />
    </RBACProvider>
  );
}
```

### 2. Permission Checking
```tsx
import { useRBAC } from '@/contexts/RBACContext';

function SomeComponent() {
  const { hasPermission } = useRBAC();
  
  if (!hasPermission('user_management')) {
    return <div>Access denied</div>;
  }
  
  return <UserManagementPanel />;
}
```

### 3. Component-Level Protection
```tsx
import PermissionGate from '@/components/rbac/PermissionGate';

function Dashboard() {
  return (
    <div>
      <PermissionGate permission="analytics">
        <AnalyticsPanel />
      </PermissionGate>
      
      <PermissionGate 
        permission="user_management"
        fallback={<div>Contact admin for access</div>}
      >
        <UserSettings />
      </PermissionGate>
    </div>
  );
}
```

## API Integration

### Role Management
```tsx
// Get all roles
const roles = await ApiClient.get('/api/admin/roles');

// Create new role
const newRole = await ApiClient.post('/api/admin/roles', {
  name: 'Content Manager',
  description: 'Manages content and moderates users',
  permissions: ['content_edit', 'user_moderate']
});

// Update role permissions
await ApiClient.put('/api/admin/roles/123/permissions', {
  permissions: ['content_edit', 'content_delete', 'user_moderate']
});
```

### User Role Assignment
```tsx
// Assign role to user
await ApiClient.post('/api/admin/users/456/roles', {
  roleId: '123'
});

// Remove role from user
await ApiClient.delete('/api/admin/users/456/roles/123');
```

## Best Practices

### 1. Principle of Least Privilege
- Grant only the minimum permissions required
- Regularly audit and remove unused permissions
- Use specific permissions rather than broad ones

### 2. Permission Naming
- Use descriptive, hierarchical names: `user_management.create`, `analytics.view`
- Group related permissions by domain
- Avoid generic permissions like `admin` or `all_access`

### 3. Error Handling
```tsx
function ProtectedAction() {
  const { hasPermission } = useRBAC();
  
  const handleAction = async () => {
    if (!hasPermission('required_permission')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform this action.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await performAction();
    } catch (error) {
      if (error.status === 403) {
        // Handle permission-related errors
        toast({
          title: "Permission Error",
          description: "Your permissions may have changed. Please refresh the page.",
          variant: "destructive"
        });
      }
    }
  };
}
```

### 4. Loading States
```tsx
function PermissionAwareComponent() {
  const { permissions, isLoading } = useRBAC();
  
  if (isLoading) {
    return <Skeleton />;
  }
  
  return (
    <PermissionGate permission="required_permission">
      <ProtectedContent />
    </PermissionGate>
  );
}
```

## Testing

### Unit Tests
```tsx
import { render, screen } from '@testing-library/react';
import { RBACProvider } from '@/contexts/RBACContext';
import ProtectedComponent from './ProtectedComponent';

const renderWithRBAC = (permissions: string[]) => {
  const mockAuthState = {
    user: { id: '1', name: 'Test User' },
    permissions
  };
  
  return render(
    <RBACProvider value={mockAuthState}>
      <ProtectedComponent />
    </RBACProvider>
  );
};

test('shows content when user has permission', () => {
  renderWithRBAC(['user_management']);
  expect(screen.getByText('Protected Content')).toBeInTheDocument();
});

test('hides content when user lacks permission', () => {
  renderWithRBAC([]);
  expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Permission not updating**: Clear user session and re-authenticate
2. **Component not re-rendering**: Check if RBAC context is properly provided
3. **API errors**: Verify backend permissions match frontend expectations

### Debug Mode
Enable debug logging in development:
```tsx
const { hasPermission } = useRBAC();

console.log('User permissions:', permissions);
console.log('Checking permission:', permission, 'Result:', hasPermission(permission));
```
