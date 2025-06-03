
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MobileSentimentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-white">Mobile Sentiment</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-white">
          <p>Mobile sentiment analysis coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileSentimentPage;
