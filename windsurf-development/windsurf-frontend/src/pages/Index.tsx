
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Windsurf Grievance Portal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Employee Support and Issue Resolution System
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Admin Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Access the administrative dashboard to manage issues, users, and analytics.
              </p>
              <Button 
                onClick={() => navigate('/admin/login')}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Admin Login
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Employee Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Submit and track your grievances and support requests.
              </p>
              <Button 
                onClick={() => navigate('/mobile/login')}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Employee Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
