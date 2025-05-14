
import React from 'react';
import MobileLayout from '@/components/MobileLayout';
import MobileSentimentForm from '@/components/mobile/sentiment/MobileSentimentForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MobileSentimentProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MobileSentiment: React.FC<MobileSentimentProps> = ({ isOpen = false, onClose }) => {
  // When used as a standalone page
  if (!isOpen && !onClose) {
    return (
      <MobileLayout 
        title="Employee Sentiment" 
        bgColor="#00CEDE"
      >
        <MobileSentimentForm />
      </MobileLayout>
    );
  }
  
  // When used as a dialog
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-md p-0 bg-[#00CEDE]">
        <div className="py-4">
          <h2 className="text-xl font-semibold text-center text-white">Employee Sentiment</h2>
          <MobileSentimentForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSentiment;
