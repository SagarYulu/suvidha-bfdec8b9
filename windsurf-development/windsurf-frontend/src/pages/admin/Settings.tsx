
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Save, Shield, Database, Mail } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure system settings and preferences</p>
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
              <label className="block text-sm font-medium mb-2">System Name</label>
              <Input placeholder="Windsurf Management System" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Admin Email</label>
              <Input placeholder="admin@windsurf.com" type="email" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <Input placeholder="UTC+05:30" />
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save General Settings
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
              <Input placeholder="30" type="number" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
              <Input placeholder="5" type="number" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Two-Factor Authentication</span>
              <Badge variant="outline">Disabled</Badge>
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Backup Frequency</label>
              <Input placeholder="Daily" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Retention Period (days)</label>
              <Input placeholder="30" type="number" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto Backup</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Database Settings
            </Button>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Server</label>
              <Input placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">SMTP Port</label>
              <Input placeholder="587" type="number" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">From Email</label>
              <Input placeholder="noreply@windsurf.com" type="email" />
            </div>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Email Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
