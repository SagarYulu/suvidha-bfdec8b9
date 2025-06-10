
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Smartphone, 
  BarChart3,
  Shield
} from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Windsurf Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive platform for employee issue management and administrative oversight
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Admin Dashboard Access */}
          <Card className="hover:shadow-xl transition-shadow duration-300 cursor-pointer" 
                onClick={() => navigate('/admin/login')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Access comprehensive administrative tools, user management, analytics, and system oversight
              </p>
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-500">
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics & Reporting
                </li>
                <li className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Issue Resolution
                </li>
              </ul>
              <Button className="w-full" onClick={() => navigate('/admin/login')}>
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>

          {/* Mobile App Access */}
          <Card className="hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate('/mobile/login')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Smartphone className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Employee Mobile</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Employee portal for issue reporting, status tracking, and communication with support team
              </p>
              <ul className="text-left space-y-2 mb-6 text-sm text-gray-500">
                <li className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Submit Issues
                </li>
                <li className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Track Progress
                </li>
                <li className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Direct Communication
                </li>
              </ul>
              <Button className="w-full" variant="outline" onClick={() => navigate('/mobile/login')}>
                Access Mobile App
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-gray-600">Comprehensive user administration and role-based access control</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">Real-time insights and detailed reporting on issue resolution</p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Security</h3>
              <p className="text-gray-600">Enterprise-grade security with audit trails and compliance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
