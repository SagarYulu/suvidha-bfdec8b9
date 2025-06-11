
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { userService } from '@/services/api/userService';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    cluster: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const userData = await userService.getUserById(user.id);
      setUserProfile({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        city: userData.city || '',
        cluster: userData.cluster || '',
        role: userData.role || ''
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive',
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await userService.updateUser(user.id, {
        name: userProfile.name,
        phone: userProfile.phone,
        city: userProfile.city,
        cluster: userProfile.cluster
      });
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user?.id) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await userService.changePassword(
        user.id,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Account Settings</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={userProfile.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Select 
                  value={userProfile.city} 
                  onValueChange={(value) => setUserProfile({ ...userProfile, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cluster">Cluster</Label>
                <Input
                  id="cluster"
                  value={userProfile.cluster}
                  onChange={(e) => setUserProfile({ ...userProfile, cluster: e.target.value })}
                />
              </div>

              <div>
                <Label>Role</Label>
                <div className="mt-2">
                  <Badge variant="outline">{userProfile.role}</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">Role cannot be changed</p>
              </div>

              <Button onClick={handleProfileUpdate} disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    currentPassword: e.target.value 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    newPassword: e.target.value 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ 
                    ...passwordData, 
                    confirmPassword: e.target.value 
                  })}
                />
              </div>

              <Button 
                onClick={handlePasswordChange} 
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <h3 className="font-semibold">Version</h3>
                <p className="text-gray-600">1.0.0</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold">Last Updated</h3>
                <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold">Environment</h3>
                <p className="text-gray-600">Production</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;
