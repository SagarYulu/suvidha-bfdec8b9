
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Smartphone } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Yulu Grievance Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive platform for managing employee grievances with real-time tracking, 
            analytics, and seamless resolution workflows.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Comprehensive admin panel for managing issues, users, and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/login">
                <Button className="w-full">
                  Access Admin Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Smartphone className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Mobile Employee Portal</CardTitle>
              <CardDescription>
                Mobile-optimized interface for employees to submit and track issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/mobile/login">
                <Button className="w-full" variant="outline">
                  Employee Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Key Features</CardTitle>
              <CardDescription>
                Complete grievance management solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>• Real-time issue tracking</li>
                <li>• Advanced analytics</li>
                <li>• Sentiment analysis</li>
                <li>• Role-based access control</li>
                <li>• Mobile responsive design</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Demo Credentials
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Admin Access</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <p><strong>Email:</strong> admin@yulu.com</p>
                <p><strong>Password:</strong> password</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Employee Access</CardTitle>
              </CardHeader>
              <CardContent className="text-left">
                <p><strong>Employee ID:</strong> EMP001</p>
                <p><strong>Password:</strong> password</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
