
import React from 'react';
import MobileLayout from '@/components/MobileLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <MobileLayout title="Home">
      <div className="p-4 space-y-6">
        <h1 className="text-xl font-bold">Welcome to Mobile App</h1>
        
        <Card>
          <CardContent className="p-4">
            <p className="mb-4">View your issues or create a new one</p>
            <div className="space-x-2">
              <Button 
                onClick={() => navigate('/mobile/issues')}
                variant="default"
              >
                My Issues
              </Button>
              <Button 
                onClick={() => navigate('/mobile/issues/new')}
                variant="outline"
              >
                Report Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
};

export default Home;
