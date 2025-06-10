
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Settings as SettingsIcon, 
  Save,
  Bell,
  Shield,
  Database,
  Mail
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'Windsurf Admin',
    adminEmail: 'admin@windsurf.com',
    notificationsEnabled: true,
    emailNotifications: true,
    autoAssignment: false
  });

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                placeholder="Enter site name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Admin Email</label>
              <Input
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                placeholder="Enter admin email"
                type="email"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Enable Notifications</span>
              <Button
                variant={settings.notificationsEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings({ 
                  ...settings, 
                  notificationsEnabled: !settings.notificationsEnabled 
                })}
              >
                {settings.notificationsEnabled ? 'On' : 'Off'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Notifications</span>
              <Button
                variant={settings.emailNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings({ 
                  ...settings, 
                  emailNotifications: !settings.emailNotifications 
                })}
              >
                {settings.emailNotifications ? 'On' : 'Off'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            <Button variant="outline" className="w-full">
              Two-Factor Authentication
            </Button>
            <Button variant="outline" className="w-full">
              Login History
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto Assignment</span>
              <Button
                variant={settings.autoAssignment ? "default" : "outline"}
                size="sm"
                onClick={() => setSettings({ 
                  ...settings, 
                  autoAssignment: !settings.autoAssignment 
                })}
              >
                {settings.autoAssignment ? 'On' : 'Off'}
              </Button>
            </div>
            <Button variant="outline" className="w-full">
              Database Backup
            </Button>
            <Button variant="outline" className="w-full">
              System Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">SMTP Server</label>
              <Input placeholder="smtp.example.com" />
            </div>
            <div>
              <label className="text-sm font-medium">SMTP Port</label>
              <Input placeholder="587" />
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input placeholder="username@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
