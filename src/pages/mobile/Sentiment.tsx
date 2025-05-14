
import React from 'react';
import MobileLayout from '@/components/MobileLayout';
import MobileSentimentForm from '@/components/mobile/sentiment/MobileSentimentForm';

const MobileSentiment: React.FC = () => {
  return (
    <MobileLayout 
      title="Employee Sentiment" 
      bgColor="#00CEDE"
    >
      <MobileSentimentForm />
    </MobileLayout>
  );
};

export default MobileSentiment;
