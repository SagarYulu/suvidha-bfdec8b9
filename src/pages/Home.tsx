
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Yulu Dashboard</h1>
        <p className="text-lg text-gray-600">
          Access the dashboard to manage your resources and view analytics.
        </p>
        
        <div className="flex justify-center mt-8">
          <Button 
            variant="default" 
            asChild
            className="flex items-center gap-2"
          >
            <Link to="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
