
import React from 'react';
import { Link } from 'react-router-dom';
import { useRBAC } from '@/contexts/RBACContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Users, 
  Shield, 
  Database, 
  Bell,
  UserPlus,
  Cog
} from "lucide-react";

const Settings: React.FC = () => {
  const { hasPermission } = useRBAC();

  const settingsCards = [
    {
      title: "User Management",
      description: "Manage dashboard users and their permissions",
      icon: Users,
      permission: 'manage:users' as const,
      actions: [
        {
          label: "Add Dashboard User",
          href: "/admin/dashboard-users/add",
          permission: 'create:dashboardUser' as const,
          variant: "default" as const
        },
        {
          label: "View All Users",
          href: "/admin/users",
          permission: 'manage:users' as const,
          variant: "outline" as const
        }
      ]
    },
    {
      title: "Security Settings",
      description: "Configure security policies and access controls",
      icon: Shield,
      permission: 'access:security' as const,
      actions: [
        {
          label: "Security Policies",
          href: "/admin/security",
          permission: 'access:security' as const,
          variant: "outline" as const
        }
      ]
    },
    {
      title: "System Configuration",
      description: "Configure system-wide settings and preferences",
      icon: Cog,
      permission: 'manage:settings' as const,
      actions: [
        {
          label: "System Settings",
          href: "/admin/system",
          permission: 'manage:settings' as const,
          variant: "outline" as const
        }
      ]
    },
    {
      title: "Database Management",
      description: "Manage database connections and data exports",
      icon: Database,
      permission: 'access:security' as const,
      actions: [
        {
          label: "Export Data",
          href: "/admin/exports",
          permission: 'access:security' as const,
          variant: "outline" as const
        }
      ]
    },
    {
      title: "Notifications",
      description: "Configure notification preferences and templates",
      icon: Bell,
      permission: 'manage:settings' as const,
      actions: [
        {
          label: "Notification Settings",
          href: "/admin/notifications",
          permission: 'manage:settings' as const,
          variant: "outline" as const
        }
      ]
    }
  ];

  if (!hasPermission('manage:settings')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3" />
            Settings
          </h1>
          <p className="text-gray-600 mt-1">Manage your application settings and configurations</p>
        </div>
        
        {hasPermission('create:dashboardUser') && (
          <Button asChild>
            <Link to="/admin/dashboard-users/add">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Dashboard User
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards.map((card) => {
          if (!hasPermission(card.permission)) return null;
          
          const Icon = card.icon;
          
          return (
            <Card key={card.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Icon className="h-5 w-5 mr-2 text-blue-600" />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm">{card.description}</p>
                
                <div className="space-y-2">
                  {card.actions?.map((action) => {
                    if (!hasPermission(action.permission)) return null;
                    
                    return (
                      <Button
                        key={action.label}
                        asChild
                        variant={action.variant}
                        size="sm"
                        className="w-full"
                      >
                        <Link to={action.href}>
                          {action.label}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hasPermission('create:dashboardUser') && (
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link to="/admin/dashboard-users/add">
                  <UserPlus className="h-6 w-6 mb-2" />
                  <span className="text-sm">Add User</span>
                </Link>
              </Button>
            )}
            
            {hasPermission('manage:users') && (
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link to="/admin/users">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="text-sm">User Management</span>
                </Link>
              </Button>
            )}
            
            {hasPermission('access:security') && (
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link to="/admin/exports">
                  <Database className="h-6 w-6 mb-2" />
                  <span className="text-sm">Export Data</span>
                </Link>
              </Button>
            )}
            
            {hasPermission('view:dashboard') && (
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link to="/admin/dashboard">
                  <SettingsIcon className="h-6 w-6 mb-2" />
                  <span className="text-sm">Dashboard</span>
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
