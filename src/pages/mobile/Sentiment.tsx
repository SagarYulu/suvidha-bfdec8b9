
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
  // Background gradient for better aesthetics
  const bgGradient = "linear-gradient(135deg, #33C3F0 0%, #00CEDE 100%)";
  
  // When used as a standalone page
  if (!isOpen && !onClose) {
    return (
      <MobileLayout 
        title="Feedback Matters" 
        bgColor="#33C3F0"
      >
        <div 
          className="min-h-screen -mt-16 pt-16" 
          style={{ background: bgGradient }}
        >
          <MobileSentimentForm />
        </div>
      </MobileLayout>
    );
  }
  
  // When used as a dialog
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose && onClose()}>
      <DialogContent className="sm:max-w-md p-0 border-0 overflow-hidden" style={{ background: bgGradient }}>
        <div className="py-4 relative">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"
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
