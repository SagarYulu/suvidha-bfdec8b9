
import React from 'react';
import MobileLayout from '@/components/layouts/MobileLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MobileProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Navigation will be handled by auth state change
  };

  return (
    <MobileLayout title="Profile">
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <CardTitle>{user?.name || 'User Name'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <span>{user?.employeeId || 'N/A'}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <span>{user?.email || 'N/A'}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <span>+91 XXXXXXXXXX</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span>Location</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Open Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Resolved Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="w-full text-red-600 border-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </MobileLayout>
  );
};

export default MobileProfilePage;
