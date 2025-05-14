
import React from 'react';
import MobileLayout from '@/components/MobileLayout';
import MobileSentimentForm from '@/components/mobile/sentiment/MobileSentimentForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface MobileSentimentProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const MobileSentiment: React.FC<MobileSentimentProps> = ({ isOpen = false, onClose }) => {
  // When used as a standalone page
  if (!isOpen && !onClose) {
    return (
      <MobileLayout 
        title="Feedback Matters" 
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
        <div className="py-4 relative">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 text-white hover:bg-[#00bdcd] rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <h2 className="text-xl font-semibold text-center text-white">Feedback Matters</h2>
          <MobileSentimentForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSentiment;
