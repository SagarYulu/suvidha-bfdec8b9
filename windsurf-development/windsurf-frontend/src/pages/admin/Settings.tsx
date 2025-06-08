
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon,
  Mail,
  Bell,
  Shield,
  Database,
  Palette,
  Save,
  TestTube,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    email: {
      smtpHost: '',
      smtpPort: '587',
      smtpUser: '',
      smtpPass: '',
      fromEmail: '',
      enabled: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      assignmentNotifications: true,
      statusChangeNotifications: true,
      escalationNotifications: true
    },
    security: {
      sessionTimeout: '30',
      passwordMinLength: '8',
      requireSpecialChars: true,
      maxLoginAttempts: '5',
      twoFactorAuth: false
    },
    system: {
      autoAssignment: true,
      escalationEnabled: true,
      escalationHours: '48',
      maintenanceMode: false,
      debugMode: false
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      companyName: 'Grievance Portal',
      logoUrl: ''
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(prevSettings => ({ ...prevSettings, ...data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (category) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          category,
          settings: settings[category]
        })
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      const response = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(settings.email)
      });

      if (response.ok) {
        toast.success('Test email sent successfully');
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      console.error('Error testing email:', error);
      toast.error('Failed to test email configuration');
    }
  };

  const updateSettings = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          System Settings
        </h1>
      </div>

      <Tabs defaultValue="email" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSettings('email', 'smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSettings('email', 'smtpPort', e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  value={settings.email.smtpUser}
                  onChange={(e) => updateSettings('email', 'smtpUser', e.target.value)}
                  placeholder="your-email@domain.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPass">SMTP Password</Label>
                <Input
                  id="smtpPass"
                  type="password"
                  value={settings.email.smtpPass}
                  onChange={(e) => updateSettings('email', 'smtpPass', e.target.value)}
                  placeholder="Your app password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  value={settings.email.fromEmail}
                  onChange={(e) => updateSettings('email', 'fromEmail', e.target.value)}
                  placeholder="noreply@company.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="emailEnabled"
                  checked={settings.email.enabled}
                  onCheckedChange={(checked) => updateSettings('email', 'enabled', checked)}
                />
                <Label htmlFor="emailEnabled">Enable Email Notifications</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={() => handleSaveSettings('email')} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Email Settings
                </Button>
                <Button variant="outline" onClick={handleTestEmail}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="assignmentNotifications">Assignment Notifications</Label>
                    <p className="text-sm text-gray-500">Notify when issues are assigned</p>
                  </div>
                  <Switch
                    id="assignmentNotifications"
                    checked={settings.notifications.assignmentNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'assignmentNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="statusChangeNotifications">Status Change Notifications</Label>
                    <p className="text-sm text-gray-500">Notify when issue status changes</p>
                  </div>
                  <Switch
                    id="statusChangeNotifications"
                    checked={settings.notifications.statusChangeNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'statusChangeNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="escalationNotifications">Escalation Notifications</Label>
                    <p className="text-sm text-gray-500">Notify when issues are escalated</p>
                  </div>
                  <Switch
                    id="escalationNotifications"
                    checked={settings.notifications.escalationNotifications}
                    onCheckedChange={(checked) => updateSettings('notifications', 'escalationNotifications', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('notifications')} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSettings('security', 'sessionTimeout', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSettings('security', 'passwordMinLength', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => updateSettings('security', 'maxLoginAttempts', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requireSpecialChars"
                  checked={settings.security.requireSpecialChars}
                  onCheckedChange={(checked) => updateSettings('security', 'requireSpecialChars', checked)}
                />
                <Label htmlFor="requireSpecialChars">Require Special Characters in Password</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactorAuth"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSettings('security', 'twoFactorAuth', checked)}
                />
                <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
              </div>

              <Button onClick={() => handleSaveSettings('security')} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="escalationHours">Auto-Escalation Hours</Label>
                <Input
                  id="escalationHours"
                  type="number"
                  value={settings.system.escalationHours}
                  onChange={(e) => updateSettings('system', 'escalationHours', e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoAssignment">Auto Assignment</Label>
                    <p className="text-sm text-gray-500">Automatically assign issues to available agents</p>
                  </div>
                  <Switch
                    id="autoAssignment"
                    checked={settings.system.autoAssignment}
                    onCheckedChange={(checked) => updateSettings('system', 'autoAssignment', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="escalationEnabled">Escalation Enabled</Label>
                    <p className="text-sm text-gray-500">Enable automatic escalation of overdue issues</p>
                  </div>
                  <Switch
                    id="escalationEnabled"
                    checked={settings.system.escalationEnabled}
                    onCheckedChange={(checked) => updateSettings('system', 'escalationEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Enable maintenance mode to restrict access</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.system.maintenanceMode}
                    onCheckedChange={(checked) => updateSettings('system', 'maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debugMode">Debug Mode</Label>
                    <p className="text-sm text-gray-500">Enable detailed logging for troubleshooting</p>
                  </div>
                  <Switch
                    id="debugMode"
                    checked={settings.system.debugMode}
                    onCheckedChange={(checked) => updateSettings('system', 'debugMode', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('system')} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={settings.appearance.companyName}
                  onChange={(e) => updateSettings('appearance', 'companyName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={settings.appearance.logoUrl}
                  onChange={(e) => updateSettings('appearance', 'logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select 
                  value={settings.appearance.theme} 
                  onValueChange={(value) => updateSettings('appearance', 'theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateSettings('appearance', 'primaryColor', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateSettings('appearance', 'primaryColor', e.target.value)}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('appearance')} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save Appearance Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
