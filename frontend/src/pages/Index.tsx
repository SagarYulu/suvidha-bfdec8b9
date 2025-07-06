
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Smartphone } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Yulu Suvidha Portal
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Employee Issue Management System
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <Shield className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Admin Portal</h2>
              <p className="text-gray-600 mb-6">
                Manage issues, users, and view analytics
              </p>
              <Button 
                onClick={() => navigate('/admin/login')}
                className="w-full"
                size="lg"
              >
                Access Admin Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <Smartphone className="mx-auto h-16 w-16 text-green-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-4">Mobile App</h2>
              <p className="text-gray-600 mb-6">
                Submit and track your issues on the go
              </p>
              <Button 
                onClick={() => navigate('/mobile/login')}
                className="w-full"
                size="lg"
                variant="outline"
              >
                Access Mobile App
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
            <Button 
              variant="link" 
              onClick={() => navigate('/data-migration')}
              className="text-gray-500"
            >
              Data Migration
            </Button>
            <Button 
              variant="link" 
              onClick={() => navigate('/database-export')}
              className="text-gray-500"
            >
              Database Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
